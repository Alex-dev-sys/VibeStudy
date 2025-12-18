/**
 * English Language Prompts
 * AI prompt templates in English for course generation
 */

import type { PromptParams } from './types';

export const buildEnglishPrompt = ({ day, languageId, dayTopic, dayDescription, previousDaySummary }: PromptParams) => `You are an experienced programming instructor. Create educational material for day ${day} of a 90-day course.

═══════════════════════════════════════
DAY ${day} of 90
TOPIC: ${dayTopic}
DETAILS: ${dayDescription}
LANGUAGE: ${languageId}
PREVIOUS TOPIC: ${previousDaySummary ?? 'First day of the course'}
STUDENT LEVEL: ${day <= 10 ? 'ABSOLUTE BEGINNER (knows nothing)' : day <= 30 ? 'BEGINNER (knows only basics)' : day <= 60 ? 'INTERMEDIATE' : 'ADVANCED'}
═══════════════════════════════════════

⚠️ CRITICAL RULES (ANTI-HALLUCINATION):
1. DO NOT invent functions or methods that do not exist in the standard ${languageId} library.
2. DO NOT use syntax from other languages.
3. VERIFY every code example: it must be working and syntactically correct.
4. If you are unsure about a method's existence, use a simpler and verified approach.

⚠️ CONSIDER LEARNING PROGRESS (STRICT CONSTRAINTS):
${day === 1 ? '- This is the FIRST day! Student knows NOTHING about programming\n- DO NOT use terms that haven\'t been studied yet\n- Only the most basic concepts of "${dayTopic}"' : ''}
${day <= 10 ? '- Days 1-10: only BASIC syntax, NO complex constructs\n- Student is just starting, doesn\'t know loops, functions, classes, lists\n- FORBIDDEN: loops (for, while), functions (def), lists ([]), dictionaries ({}), conditions (if)' : ''}
${day <= 30 ? '- Days 11-30: can use basic constructs from previous days' : ''}
- Tasks STRICTLY on topic "${dayTopic}", no jumping ahead
- If topic is "Variables" — ONLY variables, data types, print(), input(), basic operations (+, -, *, /)
- If topic is "Variables" — FORBIDDEN: functions, loops, lists, dictionaries, if conditions
- If topic is "Loops" — can use variables, but NOT functions, classes

TASK:
Create JSON with fields theory, recap, and tasks (array of 5 tasks).

THEORY REQUIREMENTS (theory):
Create DETAILED and STRUCTURED theory on topic "${dayTopic}" for language ${languageId}.

THEORY FORMAT (must follow this structure):

1. INTRODUCTION (2-3 sentences):
   - What is "${dayTopic}"
   - Why it's needed
   - Where it's used

2. KEY CONCEPTS:
   - List key concepts of the topic
   - Give brief explanation for each
   - Example: if topic is "Variables", describe data types (int, float, str, bool)

3. CODE EXAMPLES (3-5 examples):
   - Each example with comments
   - Examples from simple to complex
   - All code in ${languageId}
   - Format: description first, then code
   - IMPORTANT: Code must be working!

4. IMPORTANT NOTES:
   - 1-2 important points to remember
   - Common beginner mistakes

SAMPLE GOOD THEORY (for topic "Variables and Data Types" in Python):

"Python is a popular programming language suitable for beginners and professionals. Programs are written as plain text, then the Python interpreter executes them line by line.

Data types:
• int: integer number, e.g. 5, -3, 100
• float: decimal number, e.g. 3.14, -0.5
• str: string, e.g. 'Hello!', 'Python'
• bool: boolean value True or False

Variables:
A variable is a name for storing a value:

x = 10       # int
y = 3.5      # float
name = 'John'  # str
flag = True    # bool

Input and Output:
To output something, use the print function:

print('Hello, Python!')

To get keyboard input, use the input function:

user_input = input('Enter a number: ')

All input is returned as a string. To convert input to a number:

num = int(input('Enter an integer: '))

Important: Variable names should be clear. Use snake_case for ${languageId}."

CREATE SIMILAR DETAILED THEORY for topic "${dayTopic}"

RECAP QUESTION REQUIREMENTS (recap):
- Question about previous day's topic: "${previousDaySummary ?? 'motivation to learn'}"
- Should test understanding of the concept

${day > 1 ? `RECAP TASK FROM PREVIOUS DAY (recapTask):
Create ONE additional task to review previous day's material.

Recap task requirements:
- Topic: "${previousDaySummary ?? 'previous day'}"
- Difficulty: EASY or MEDIUM (not complex, for reinforcement)
- Task should test understanding of MAIN concept from previous day
- id: "day${day}_recap"
- difficulty: "easy" or "medium"
- prompt: specific task on previous day's topic
- solutionHint: brief hint

Example for day 2 (previous day "First Program"):
{
  "id": "day2_recap",
  "difficulty": "easy",
  "prompt": "Write a program that outputs 3 lines: greeting, your name, and your city",
  "solutionHint": "Use print() three times"
}` : ''}

TASK REQUIREMENTS (tasks):
Create EXACTLY 5 tasks with GRADUAL DIFFICULTY INCREASE on topic "${dayTopic}" in language ${languageId}.
Each next task adds 1-2 new actions to the previous one.

SAMPLE CORRECT GRADATION (for topic "Dictionaries" on ~day 14):
1. EASY: "Create a dictionary with book info: title, author, year. Print author by key."
2. EASY: "Add a 'genre' key with value, e.g., 'novel', to this dictionary."
3. MEDIUM: "Ask user for name and city, save to dictionary, and print phrase: Name: .., city: .."
4. HARD: "Given dictionary nums = {'a': 1, 'b': 3, 'c': 5}. Print sum of all values in this dictionary."
5. CHALLENGE: "Create empty dictionary, ask user for 2 items and their scores, add them as key-value, then print entire dictionary."

${day === 1 ? 'SAMPLE FOR DAY 1 (topic "First Program"):\n1. EASY: "Print the phrase: Hello, world!"\n2. EASY: "Print your name to the screen"\n3. MEDIUM: "Print two lines: your name and your age"\n4. HARD: "Print the phrase: My name is [your name] and I am [your age] years old"\n5. CHALLENGE: "Print 3 lines: greeting, your name, and city"\n' : ''}
${day === 2 ? 'SAMPLE FOR DAY 2 (topic "Variables and Data Types"):\n1. EASY: "Create variable x with number 10 and print its value"\n2. EASY: "Create two variables: name with string and age with number. Print them"\n3. MEDIUM: "Ask user for name using input(), save to variable and print greeting"\n4. HARD: "Create two numeric variables a=5 and b=3. Calculate their sum, save to variable result and print"\n5. CHALLENGE: "Ask user for name and age using input(), save to variables and print phrase: My name is [name], I am [age] years old"\n\n⚠️ FORBIDDEN for day 2: functions (def), loops (for/while), conditions (if), lists ([]), dictionaries ({}), comparison operators (==, >, <)\n✅ ALLOWED for day 2: variables, types (int, float, str, bool), print(), input(), arithmetic (+, -, *, /), string concatenation\n' : ''}

CREATE SIMILAR TASKS FOR TOPIC "${dayTopic}" CONSIDERING DAY ${day}:

1. EASY #1 (id: "day${day}_task1"):
   - Basic action with "${dayTopic}"
   - One simple operation
   - Example: create/declare + print

2. EASY #2 (id: "day${day}_task2"):
   - Basic action + one additional
   - Example: create + modify/add

3. MEDIUM (id: "day${day}_task3"):
   - User input + processing + output
   - Combination of 2-3 operations

4. HARD (id: "day${day}_task4"):
   - Work with given data + calculations/processing
   - May include loop or condition for processing

5. CHALLENGE (id: "day${day}_task5"):
   - Create from scratch + user input + processing + output
   - Most complex task, but NOT a mini-project

RESPONSE FORMAT (JSON only, no markdown):
{
  "theory": "theory text here",
  "recap": "recap question here",
  ${day > 1 ? '"recapTask": {"id": "day' + day + '_recap", "difficulty": "easy", "prompt": "task from previous day", "solutionHint": "hint"},' : ''}
  "tasks": [
    {"id": "day${day}_task1", "difficulty": "easy", "prompt": "specific task", "solutionHint": "hint"},
    {"id": "day${day}_task2", "difficulty": "easy", "prompt": "specific task", "solutionHint": "hint"},
    {"id": "day${day}_task3", "difficulty": "medium", "prompt": "specific task", "solutionHint": "hint"},
    {"id": "day${day}_task4", "difficulty": "hard", "prompt": "specific task", "solutionHint": "hint"},
    {"id": "day${day}_task5", "difficulty": "challenge", "prompt": "specific task", "solutionHint": "hint"}
  ]
}

⚠️ CRITICALLY IMPORTANT:
- DO NOT deviate from topic "${dayTopic}"
- All tasks ONLY on this topic
- Follow SAMPLE gradation above
- Each task 1-2 actions more complex than previous
- Tasks should be SPECIFIC and PRACTICAL
- Simple and clear wording, like in example
- EASY #1: create + print (1 action)
- EASY #2: create + modify (2 actions)
- MEDIUM: input + processing + output (3 actions)
- HARD: work with data + calculations (3-4 actions, NO loops for days 1-8)
- CHALLENGE: create + input + processing + output (4-5 actions)
- NO complex algorithms, optimizations, mini-projects
- Tasks like in example: simple, clear, practical
${day <= 8 ? '\n⚠️ DAYS 1-8: FORBIDDEN to use loops (for, while), functions (def), conditions (if), lists ([]), dictionaries ({})\n⚠️ ALLOWED: variables, print(), input(), arithmetic, strings, basic operations' : ''}
${day === 2 ? '\n⚠️ DAY 2 "Variables": Tasks ONLY about creating variables, assigning values, output, input, simple calculations\n⚠️ DO NOT use: type checks (isinstance, type), comparison operators, conditions, loops, functions' : ''}
- Return ONLY valid JSON without comments
- ALL TEXT IN ENGLISH (theory, tasks, hints)`;

