import { NextRequest, NextResponse } from "next/server";
import {
  callChatCompletion,
  extractMessageContent,
  isAiConfiguredAsync,
} from "@/lib/ai-client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { LANGUAGES } from "@/lib/content/languages";
import { logError, logInfo, logWarn } from "@/lib/core/logger";

interface ChallengeTask {
  description: string;
  input_format: string;
  output_format: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
}

interface TestCase {
  input: string;
  expected_output: string;
  is_hidden: boolean;
}

interface GeneratedChallenge {
  problem: ChallengeTask;
  test_cases: TestCase[];
  difficulty: "easy" | "medium" | "hard";
  metadata: {
    topics: string[];
    estimated_time_minutes: number;
  };
}

const buildChallengePrompt = (language: string, date: string) => {
  return `You are an expert programming instructor. Generate a daily coding challenge for ${language}.

DATE: ${date}
LANGUAGE: ${language}
DIFFICULTY: Medium (suitable for learners with 30-60 days of experience)

Create a coding challenge that:
1. Tests fundamental programming concepts
2. Is solvable in 15-30 minutes
3. Has clear input/output specifications
4. Includes 2-3 example test cases
5. Has 5-7 test cases total (mix of visible and hidden)

IMPORTANT: Generate a DIFFERENT challenge each time. Vary the problem domain:
- String manipulation
- Array/List operations
- Mathematical problems
- Logic puzzles
- Data structure basics
- Simple algorithms

Return ONLY valid JSON in this exact format:
{
  "problem": {
    "description": "Clear problem statement with context",
    "input_format": "Description of input format",
    "output_format": "Description of expected output",
    "examples": [
      {
        "input": "example input",
        "output": "example output",
        "explanation": "why this output"
      }
    ],
    "constraints": ["constraint 1", "constraint 2"]
  },
  "test_cases": [
    {
      "input": "test input",
      "expected_output": "expected result",
      "is_hidden": false
    }
  ],
  "difficulty": "medium",
  "metadata": {
    "topics": ["topic1", "topic2"],
    "estimated_time_minutes": 20
  }
}

Make the challenge interesting and educational!`;
};

const parseChallengeResponse = (content: string): GeneratedChallenge | null => {
  try {
    const sanitized = content.replace(/```json|```/g, "").trim();
    if (!sanitized || !sanitized.startsWith("{")) {
      logWarn("AI response is not valid JSON");
      return null;
    }

    const parsed = JSON.parse(sanitized) as GeneratedChallenge;

    // Validate required fields
    if (
      !parsed.problem ||
      !parsed.test_cases ||
      !Array.isArray(parsed.test_cases)
    ) {
      logWarn("Challenge missing required fields");
      return null;
    }

    if (parsed.test_cases.length < 3) {
      logWarn("Challenge has too few test cases");
      return null;
    }

    return parsed;
  } catch (error) {
    logError("Failed to parse challenge response:", error as Error);
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logError("Unauthorized cron request", new Error("Invalid cron secret"), {
        component: "api",
        action: "generate-challenge",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if AI is configured
    if (!(await isAiConfiguredAsync())) {
      logError("AI not configured", new Error("AI_API_TOKEN not set"), {
        component: "api",
        action: "generate-challenge",
      });
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 },
      );
    }

    // Use service role key for admin access (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      logError(
        "Supabase not configured",
        new Error("Missing Supabase credentials"),
        {
          component: "api",
          action: "generate-challenge",
        },
      );
      return NextResponse.json(
        { error: "Database service not configured" },
        { status: 503 },
      );
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    logInfo("Starting daily challenge generation", {
      component: "api",
      action: "generate-challenge",
      metadata: { date: today },
    });

    const results = {
      success: [] as string[],
      failed: [] as string[],
      skipped: [] as string[],
    };

    // Generate challenge for each language
    for (const lang of LANGUAGES) {
      try {
        // Check if challenge already exists for this date and language
        const { data: existing, error: checkError } = await supabase
          .from("daily_challenges")
          .select("id")
          .eq("date", today)
          .eq("language", lang.id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          // PGRST116 is "not found" error, which is expected
          throw checkError;
        }

        if (existing) {
          logInfo(`Challenge already exists for ${lang.id}`, {
            component: "api",
            action: "generate-challenge",
            metadata: { language: lang.id, date: today },
          });
          results.skipped.push(lang.id);
          continue;
        }

        // Generate challenge using AI
        logInfo(`Generating challenge for ${lang.id}`, {
          component: "api",
          action: "generate-challenge",
          metadata: { language: lang.id },
        });

        const prompt = buildChallengePrompt(lang.label, today);

        const { data, raw } = await callChatCompletion({
          messages: [
            {
              role: "system",
              content:
                "You are an expert programming instructor. Generate coding challenges in valid JSON format only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.9, // Higher temperature for more variety
          maxTokens: 2000,
        });

        const content = raw || extractMessageContent(data);
        const challenge = parseChallengeResponse(String(content));

        if (!challenge) {
          logError(
            `Failed to parse challenge for ${lang.id}`,
            new Error("Invalid AI response"),
            {
              component: "api",
              action: "generate-challenge",
              metadata: {
                language: lang.id,
                response: String(content).slice(0, 200),
              },
            },
          );
          results.failed.push(lang.id);
          continue;
        }

        // Save challenge to database
        const { error: insertError } = await supabase
          .from("daily_challenges")
          .insert({
            date: today,
            language: lang.id,
            problem: challenge.problem,
            test_cases: challenge.test_cases,
            difficulty: challenge.difficulty,
            metadata: challenge.metadata,
          });

        if (insertError) {
          throw insertError;
        }

        logInfo(`Successfully generated challenge for ${lang.id}`, {
          component: "api",
          action: "generate-challenge",
          metadata: {
            language: lang.id,
            difficulty: challenge.difficulty,
            testCases: challenge.test_cases.length,
          },
        });

        results.success.push(lang.id);

        // Add small delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        logError(`Error generating challenge for ${lang.id}`, error as Error, {
          component: "api",
          action: "generate-challenge",
          metadata: { language: lang.id },
        });
        results.failed.push(lang.id);
      }
    }

    logInfo("Daily challenge generation completed", {
      component: "api",
      action: "generate-challenge",
      metadata: results,
    });

    return NextResponse.json({
      success: true,
      date: today,
      results,
    });
  } catch (error) {
    logError("Fatal error in challenge generation", error as Error, {
      component: "api",
      action: "generate-challenge",
    });

    return NextResponse.json(
      {
        error: "Failed to generate challenges",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET endpoint for manual testing
export async function GET(request: NextRequest) {
  // Only allow in development or with proper auth
  if (process.env.NODE_ENV === "production") {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Forward to POST handler
  return POST(request);
}
