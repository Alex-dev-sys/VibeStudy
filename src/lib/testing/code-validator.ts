/**
 * Code validation and automated testing system
 */

import type { TestCase } from '@/types/curriculum';

export interface TestResult {
  passed: boolean;
  testCase: TestCase;
  actualOutput?: any;
  error?: string;
  executionTime?: number;
}

export interface ValidationResult {
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  results: TestResult[];
  score: number; // 0-100
  feedback: string;
}

/**
 * Execute code with test cases using Piston API
 */
export async function executeCodeWithTests(
  code: string,
  tests: TestCase[],
  languageId: string
): Promise<ValidationResult> {
  const results: TestResult[] = [];
  let passedCount = 0;

  for (const testCase of tests) {
    try {
      const startTime = performance.now();

      // Prepare code with test input
      const testCode = prepareTestCode(code, testCase, languageId);

      // Execute via Piston API
      const output = await executePiston(testCode, languageId);

      const executionTime = performance.now() - startTime;

      // Parse output and compare
      const actualOutput = parseOutput(output, languageId);
      const passed = compareOutput(actualOutput, testCase.expected, languageId);

      if (passed) passedCount++;

      results.push({
        passed,
        testCase,
        actualOutput,
        executionTime
      });

    } catch (error) {
      results.push({
        passed: false,
        testCase,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  const allPassed = passedCount === tests.length;
  const score = Math.round((passedCount / tests.length) * 100);

  return {
    allPassed,
    passedCount,
    totalCount: tests.length,
    results,
    score,
    feedback: generateFeedback(results, passedCount, tests.length)
  };
}

/**
 * Prepare code with test input based on language
 */
function prepareTestCode(
  userCode: string,
  testCase: TestCase,
  languageId: string
): string {
  switch (languageId) {
    case 'python':
      return preparePythonTest(userCode, testCase);

    case 'javascript':
    case 'typescript':
      return prepareJavaScriptTest(userCode, testCase);

    case 'java':
      return prepareJavaTest(userCode, testCase);

    case 'cpp':
      return prepareCppTest(userCode, testCase);

    case 'go':
      return prepareGoTest(userCode, testCase);

    case 'csharp':
      return prepareCSharpTest(userCode, testCase);

    default:
      throw new Error(`Unsupported language: ${languageId}`);
  }
}

/**
 * Python test preparation
 */
function preparePythonTest(userCode: string, testCase: TestCase): string {
  const inputs = Array.isArray(testCase.input)
    ? testCase.input
    : [testCase.input];

  return `
${userCode}

# Test execution
import json
try:
    result = main(${inputs.map(i => JSON.stringify(i)).join(', ')})
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;
}

/**
 * JavaScript test preparation
 */
function prepareJavaScriptTest(userCode: string, testCase: TestCase): string {
  const inputs = Array.isArray(testCase.input)
    ? testCase.input
    : [testCase.input];

  return `
${userCode}

// Test execution
try {
  const result = main(${inputs.map(i => JSON.stringify(i)).join(', ')});
  console.log(JSON.stringify(result));
} catch (e) {
  console.log(JSON.stringify({ error: e.message }));
}
`;
}

/**
 * Java test preparation
 */
function prepareJavaTest(userCode: string, testCase: TestCase): string {
  const inputs = Array.isArray(testCase.input)
    ? testCase.input
    : [testCase.input];

  return `
import com.google.gson.Gson;

${userCode}

public class Main {
    public static void main(String[] args) {
        Gson gson = new Gson();
        try {
            Solution solution = new Solution();
            Object result = solution.solve(${inputs.map(i => JSON.stringify(i)).join(', ')});
            System.out.println(gson.toJson(result));
        } catch (Exception e) {
            System.out.println("{\\"error\\":\\"" + e.getMessage() + "\\"}");
        }
    }
}
`;
}

/**
 * C++ test preparation
 */
function prepareCppTest(userCode: string, testCase: TestCase): string {
  // Simplified - would need more sophisticated parsing
  return userCode;
}

/**
 * Go test preparation
 */
function prepareGoTest(userCode: string, testCase: TestCase): string {
  const inputs = Array.isArray(testCase.input)
    ? testCase.input
    : [testCase.input];

  return `
package main

import (
    "encoding/json"
    "fmt"
)

${userCode}

func main() {
    result := solve(${inputs.map(i => JSON.stringify(i)).join(', ')})
    jsonResult, _ := json.Marshal(result)
    fmt.Println(string(jsonResult))
}
`;
}

/**
 * C# test preparation
 */
function prepareCSharpTest(userCode: string, testCase: TestCase): string {
  return userCode; // Simplified
}

/**
 * Execute code via Piston API
 */
async function executePiston(code: string, languageId: string): Promise<string> {
  const languageMap: Record<string, { language: string; version: string }> = {
    python: { language: 'python', version: '3.10.0' },
    javascript: { language: 'javascript', version: '18.15.0' },
    typescript: { language: 'typescript', version: '5.0.3' },
    java: { language: 'java', version: '15.0.2' },
    cpp: { language: 'cpp', version: '10.2.0' },
    go: { language: 'go', version: '1.16.2' },
    csharp: { language: 'csharp', version: '6.12.0' }
  };

  const config = languageMap[languageId];
  if (!config) {
    throw new Error(`Language ${languageId} not supported`);
  }

  const response = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: config.language,
      version: config.version,
      files: [{ content: code }]
    })
  });

  if (!response.ok) {
    throw new Error('Code execution failed');
  }

  const result = await response.json();

  if (result.run.stderr) {
    throw new Error(result.run.stderr);
  }

  return result.run.stdout || '';
}

/**
 * Parse output based on language
 */
function parseOutput(output: string, languageId: string): any {
  try {
    // Most languages will output JSON
    return JSON.parse(output.trim());
  } catch {
    // Fallback to raw output
    return output.trim();
  }
}

/**
 * Compare actual output with expected
 */
function compareOutput(actual: any, expected: any, languageId: string): boolean {
  // Handle error objects
  if (actual && typeof actual === 'object' && 'error' in actual) {
    return false;
  }

  // Deep equality check
  return JSON.stringify(actual) === JSON.stringify(expected);
}

/**
 * Generate helpful feedback based on test results
 */
function generateFeedback(
  results: TestResult[],
  passedCount: number,
  totalCount: number
): string {
  if (passedCount === totalCount) {
    return '🎉 Отлично! Все тесты пройдены!';
  }

  if (passedCount === 0) {
    return '❌ Ни один тест не пройден. Проверь логику программы и попробуй снова.';
  }

  const failedTests = results.filter(r => !r.passed);
  const firstFailed = failedTests[0];

  let feedback = `✅ Пройдено ${passedCount} из ${totalCount} тестов.\n\n`;
  feedback += `❌ Первый непройденный тест: ${firstFailed.testCase.description}\n`;

  if (firstFailed.error) {
    feedback += `Ошибка: ${firstFailed.error}`;
  } else if (firstFailed.actualOutput !== undefined) {
    feedback += `Ожидалось: ${JSON.stringify(firstFailed.testCase.expected)}\n`;
    feedback += `Получено: ${JSON.stringify(firstFailed.actualOutput)}`;
  }

  return feedback;
}

/**
 * Validate code syntax without execution
 */
export async function validateSyntax(
  code: string,
  languageId: string
): Promise<{ valid: boolean; errors?: string[] }> {
  try {
    // Use Piston to check syntax
    const result = await executePiston(code, languageId);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Syntax error']
    };
  }
}
