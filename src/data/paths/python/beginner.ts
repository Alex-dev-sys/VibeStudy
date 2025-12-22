/**
 * Python Beginner Path Content
 * 45 days from zero to confident beginner
 */

import type { PathDayContent, LearningPath } from '@/types/learning-paths';
import { PYTHON_BEGINNER } from '../index';

export const path = PYTHON_BEGINNER;

export const days: PathDayContent[] = [
    // ============= WEEK 1: BASICS =============
    {
        day: 1,
        topic: 'Введение в Python и установка',
        topicEn: 'Introduction to Python and Setup',
        category: 'basics',
        description: 'Знакомство с Python, установка среды, первая программа',
        theory: `# День 1: Добро пожаловать в Python! 🐍

Python — один из самых популярных языков программирования в мире. Его используют в Google, Netflix, Instagram и тысячах других компаний.

## Почему Python?

- **Простой синтаксис** — читается почти как английский
- **Универсальность** — веб, данные, AI, автоматизация
- **Огромное сообщество** — легко найти помощь

## Первая программа

\`\`\`python
print("Hello, World!")
\`\`\`

Функция \`print()\` выводит текст на экран. Текст в кавычках называется **строкой**.

## Комментарии

\`\`\`python
# Это комментарий — Python его игнорирует
print("Код выполнится")  # Комментарий после кода тоже работает
\`\`\`

Комментарии помогают объяснять код другим (и себе в будущем).`,
        recap: 'Что такое Python и зачем он нужен? Как вывести текст на экран?',
        tasks: [
            { id: 'py-b-1-1', pathId: 'python-beginner', day: 1, difficulty: 'easy', prompt: 'Напиши программу, которая выводит "Hello, Python!"', solutionHint: 'Используй print()' },
            { id: 'py-b-1-2', pathId: 'python-beginner', day: 1, difficulty: 'easy', prompt: 'Выведи своё имя на экран', solutionHint: 'print("Твоё имя")' },
            { id: 'py-b-1-3', pathId: 'python-beginner', day: 1, difficulty: 'easy', prompt: 'Выведи две строки: "Привет" и "Мир" (каждую с новой строки)', solutionHint: 'Два вызова print()' },
            { id: 'py-b-1-4', pathId: 'python-beginner', day: 1, difficulty: 'medium', prompt: 'Напиши программу с комментарием, объясняющим что она делает', solutionHint: '# Комментарий' },
            { id: 'py-b-1-5', pathId: 'python-beginner', day: 1, difficulty: 'medium', prompt: 'Выведи ASCII-арт из нескольких print()', concepts: ['print', 'strings'] }
        ],
        estimatedMinutes: 30
    },
    {
        day: 2,
        topic: 'Переменные и типы данных',
        topicEn: 'Variables and Data Types',
        category: 'basics',
        description: 'Создание переменных, числа, строки, булевы значения',
        theory: `# День 2: Переменные — память программы 📦

Переменная — это именованное место в памяти для хранения данных.

## Создание переменных

\`\`\`python
name = "Alice"      # Строка (str)
age = 25            # Целое число (int)
height = 1.75       # Дробное число (float)
is_student = True   # Булево значение (bool)
\`\`\`

## Правила именования

- Начинается с буквы или \`_\`
- Только буквы, цифры, \`_\`
- Регистр важен: \`Name\` ≠ \`name\`
- Используй snake_case: \`my_variable\`

## Проверка типа

\`\`\`python
print(type(name))   # <class 'str'>
print(type(age))    # <class 'int'>
\`\`\``,
        recap: 'Что такое переменная? Какие основные типы данных в Python?',
        tasks: [
            { id: 'py-b-2-1', pathId: 'python-beginner', day: 2, difficulty: 'easy', prompt: 'Создай переменную name со своим именем и выведи её', solutionHint: 'name = "..."' },
            { id: 'py-b-2-2', pathId: 'python-beginner', day: 2, difficulty: 'easy', prompt: 'Создай переменные для возраста и роста, выведи их типы', solutionHint: 'type()' },
            { id: 'py-b-2-3', pathId: 'python-beginner', day: 2, difficulty: 'medium', prompt: 'Создай 4 переменные разных типов (str, int, float, bool)', concepts: ['variables', 'types'] },
            { id: 'py-b-2-4', pathId: 'python-beginner', day: 2, difficulty: 'medium', prompt: 'Поменяй значения двух переменных местами', solutionHint: 'a, b = b, a' },
            { id: 'py-b-2-5', pathId: 'python-beginner', day: 2, difficulty: 'hard', prompt: 'Создай "визитку" с переменными: имя, возраст, город, профессия', concepts: ['variables', 'print'] }
        ],
        estimatedMinutes: 35
    },
    {
        day: 3,
        topic: 'Арифметические операции',
        topicEn: 'Arithmetic Operations',
        category: 'basics',
        description: 'Сложение, вычитание, умножение, деление, остаток',
        theory: `# День 3: Математика в Python 🔢

Python — отличный калькулятор!

## Базовые операции

\`\`\`python
a = 10
b = 3

print(a + b)   # 13  — сложение
print(a - b)   # 7   — вычитание
print(a * b)   # 30  — умножение
print(a / b)   # 3.33... — деление (всегда float)
print(a // b)  # 3   — целочисленное деление
print(a % b)   # 1   — остаток от деления
print(a ** b)  # 1000 — возведение в степень
\`\`\`

## Приоритет операций

Как в математике: скобки → степень → умножение/деление → сложение/вычитание

\`\`\`python
result = 2 + 3 * 4      # 14, не 20
result = (2 + 3) * 4    # 20
\`\`\``,
        recap: 'Какие арифметические операторы есть в Python? Чем / отличается от //?',
        tasks: [
            { id: 'py-b-3-1', pathId: 'python-beginner', day: 3, difficulty: 'easy', prompt: 'Напиши калькулятор: сложи 15 и 27', solutionHint: 'print(15 + 27)' },
            { id: 'py-b-3-2', pathId: 'python-beginner', day: 3, difficulty: 'easy', prompt: 'Вычисли площадь прямоугольника 7x12', solutionHint: 'width * height' },
            { id: 'py-b-3-3', pathId: 'python-beginner', day: 3, difficulty: 'medium', prompt: 'Найди остаток от деления 47 на 5', solutionHint: 'Оператор %' },
            { id: 'py-b-3-4', pathId: 'python-beginner', day: 3, difficulty: 'medium', prompt: 'Вычисли 2 в степени 10', solutionHint: 'Оператор **' },
            { id: 'py-b-3-5', pathId: 'python-beginner', day: 3, difficulty: 'hard', prompt: 'Напиши конвертер температуры: Цельсий в Фаренгейт (F = C * 9/5 + 32)', concepts: ['arithmetic', 'variables'] }
        ],
        estimatedMinutes: 30
    },
    {
        day: 4,
        topic: 'Ввод данных от пользователя',
        topicEn: 'User Input',
        category: 'basics',
        description: 'Функция input(), преобразование типов',
        theory: `# День 4: Интерактивные программы 💬

Функция \`input()\` позволяет получать данные от пользователя.

## Базовый ввод

\`\`\`python
name = input("Как тебя зовут? ")
print(f"Привет, {name}!")
\`\`\`

## Важно: input() возвращает строку!

\`\`\`python
age = input("Сколько тебе лет? ")
print(type(age))  # <class 'str'>

# Для математики нужно преобразовать:
age = int(input("Сколько тебе лет? "))
price = float(input("Введи цену: "))
\`\`\`

## f-строки для форматирования

\`\`\`python
name = "Алиса"
age = 25
print(f"Меня зовут {name}, мне {age} лет")
\`\`\``,
        recap: 'Как получить данные от пользователя? Почему нужно преобразовывать типы?',
        tasks: [
            { id: 'py-b-4-1', pathId: 'python-beginner', day: 4, difficulty: 'easy', prompt: 'Спроси имя пользователя и поприветствуй его', solutionHint: 'input() и print()' },
            { id: 'py-b-4-2', pathId: 'python-beginner', day: 4, difficulty: 'easy', prompt: 'Спроси два числа и выведи их сумму', solutionHint: 'int(input(...))' },
            { id: 'py-b-4-3', pathId: 'python-beginner', day: 4, difficulty: 'medium', prompt: 'Создай простой калькулятор: ввод двух чисел, вывод всех операций', concepts: ['input', 'arithmetic'] },
            { id: 'py-b-4-4', pathId: 'python-beginner', day: 4, difficulty: 'medium', prompt: 'Спроси год рождения и посчитай возраст', solutionHint: '2024 - год' },
            { id: 'py-b-4-5', pathId: 'python-beginner', day: 4, difficulty: 'hard', prompt: 'Создай анкету: имя, возраст, город. Выведи красивую визитку с f-строками', concepts: ['input', 'f-strings'] }
        ],
        estimatedMinutes: 35
    },
    {
        day: 5,
        topic: 'Строки и их методы',
        topicEn: 'Strings and Methods',
        category: 'basics',
        description: 'Работа со строками, индексация, срезы, методы',
        theory: `# День 5: Работа со строками 📝

Строки — один из важнейших типов данных.

## Индексация

\`\`\`python
text = "Python"
print(text[0])   # P (первый символ)
print(text[-1])  # n (последний символ)
\`\`\`

## Срезы

\`\`\`python
text = "Hello, World!"
print(text[0:5])   # Hello
print(text[7:])    # World!
print(text[:5])    # Hello
print(text[::2])   # Hlo ol! (каждый второй)
\`\`\`

## Популярные методы

\`\`\`python
text = "  Hello World  "
print(text.upper())       # HELLO WORLD
print(text.lower())       # hello world
print(text.strip())       # Hello World (без пробелов)
print(text.replace("o", "0"))  # Hell0 W0rld
print(len(text))          # 15 (длина)
\`\`\``,
        recap: 'Как получить символ строки по индексу? Какие методы строк ты знаешь?',
        tasks: [
            { id: 'py-b-5-1', pathId: 'python-beginner', day: 5, difficulty: 'easy', prompt: 'Получи первый и последний символ строки "Programming"', solutionHint: 'text[0] и text[-1]' },
            { id: 'py-b-5-2', pathId: 'python-beginner', day: 5, difficulty: 'easy', prompt: 'Преобразуй строку в верхний регистр', solutionHint: '.upper()' },
            { id: 'py-b-5-3', pathId: 'python-beginner', day: 5, difficulty: 'medium', prompt: 'Извлеки слово из середины предложения с помощью среза', concepts: ['slicing'] },
            { id: 'py-b-5-4', pathId: 'python-beginner', day: 5, difficulty: 'medium', prompt: 'Проверь, начинается ли email с определённого символа', solutionHint: '.startswith()' },
            { id: 'py-b-5-5', pathId: 'python-beginner', day: 5, difficulty: 'hard', prompt: 'Создай программу, которая переворачивает строку', solutionHint: 'text[::-1]', concepts: ['slicing'] }
        ],
        estimatedMinutes: 40
    },
    {
        day: 6,
        topic: 'Логические операторы и сравнение',
        topicEn: 'Logical Operators and Comparisons',
        category: 'basics',
        description: 'Операторы сравнения, and, or, not',
        theory: `# День 6: Логика в программировании 🧠

## Операторы сравнения

\`\`\`python
a = 10
b = 5

print(a == b)   # False (равно)
print(a != b)   # True  (не равно)
print(a > b)    # True  (больше)
print(a < b)    # False (меньше)
print(a >= b)   # True  (больше или равно)
print(a <= b)   # False (меньше или равно)
\`\`\`

## Логические операторы

\`\`\`python
x = True
y = False

print(x and y)  # False (оба должны быть True)
print(x or y)   # True  (хотя бы один True)
print(not x)    # False (инверсия)
\`\`\`

## Комбинирование

\`\`\`python
age = 25
has_license = True

can_drive = age >= 18 and has_license  # True
\`\`\``,
        recap: 'Чем отличается = от ==? Как работают and, or, not?',
        tasks: [
            { id: 'py-b-6-1', pathId: 'python-beginner', day: 6, difficulty: 'easy', prompt: 'Сравни два числа и выведи результат', solutionHint: 'a > b' },
            { id: 'py-b-6-2', pathId: 'python-beginner', day: 6, difficulty: 'easy', prompt: 'Проверь, является ли число чётным', solutionHint: 'n % 2 == 0' },
            { id: 'py-b-6-3', pathId: 'python-beginner', day: 6, difficulty: 'medium', prompt: 'Проверь, попадает ли число в диапазон от 1 до 100', solutionHint: '1 <= n <= 100' },
            { id: 'py-b-6-4', pathId: 'python-beginner', day: 6, difficulty: 'medium', prompt: 'Проверь, может ли человек голосовать (возраст >= 18 и гражданин)', concepts: ['and'] },
            { id: 'py-b-6-5', pathId: 'python-beginner', day: 6, difficulty: 'hard', prompt: 'Определи, является ли год високосным', solutionHint: 'Делится на 4, но не на 100, или делится на 400', concepts: ['and', 'or'] }
        ],
        estimatedMinutes: 35
    },
    {
        day: 7,
        topic: 'Условный оператор if-else',
        topicEn: 'Conditional Statements',
        category: 'basics',
        description: 'Ветвление программы, if, elif, else',
        theory: `# День 7: Принятие решений 🔀

Условные операторы позволяют программе выбирать действия.

## Базовый if

\`\`\`python
age = 20

if age >= 18:
    print("Совершеннолетний")
\`\`\`

## if-else

\`\`\`python
temperature = 15

if temperature > 25:
    print("Жарко!")
else:
    print("Нормальная погода")
\`\`\`

## if-elif-else

\`\`\`python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(f"Оценка: {grade}")
\`\`\`

**Важно**: отступы (4 пробела) обязательны!`,
        recap: 'Для чего нужны условные операторы? Когда использовать elif?',
        tasks: [
            { id: 'py-b-7-1', pathId: 'python-beginner', day: 7, difficulty: 'easy', prompt: 'Проверь, положительное ли число', solutionHint: 'if n > 0' },
            { id: 'py-b-7-2', pathId: 'python-beginner', day: 7, difficulty: 'easy', prompt: 'Определи, чётное число или нечётное', solutionHint: 'n % 2 == 0' },
            { id: 'py-b-7-3', pathId: 'python-beginner', day: 7, difficulty: 'medium', prompt: 'Создай систему оценок: 5, 4, 3, 2 по баллам', concepts: ['elif'] },
            { id: 'py-b-7-4', pathId: 'python-beginner', day: 7, difficulty: 'medium', prompt: 'Определи время суток по часу (утро/день/вечер/ночь)', concepts: ['elif'] },
            { id: 'py-b-7-5', pathId: 'python-beginner', day: 7, difficulty: 'hard', prompt: 'Создай простой калькулятор с выбором операции (+, -, *, /)', concepts: ['if-elif', 'input'] }
        ],
        estimatedMinutes: 40
    },

    // ============= WEEK 2: LOOPS =============
    {
        day: 8,
        topic: 'Цикл while',
        topicEn: 'While Loop',
        category: 'basics',
        description: 'Циклы с условием, управление итерациями',
        theory: `# День 8: Цикл while 🔄

Цикл \`while\` выполняется, пока условие истинно.

## Базовый while

\`\`\`python
count = 0

while count < 5:
    print(f"Итерация {count}")
    count += 1  # Не забудь увеличить!
\`\`\`

## Бесконечный цикл (осторожно!)

\`\`\`python
# while True:
#     print("Вечно...")  # Ctrl+C чтобы остановить
\`\`\`

## Выход из цикла: break

\`\`\`python
while True:
    answer = input("Выйти? (да/нет): ")
    if answer == "да":
        break
    print("Продолжаем...")
\`\`\`

## Пропуск итерации: continue

\`\`\`python
n = 0
while n < 10:
    n += 1
    if n % 2 == 0:
        continue  # Пропускаем чётные
    print(n)  # 1, 3, 5, 7, 9
\`\`\``,
        recap: 'Когда использовать while вместо for? Что делают break и continue?',
        tasks: [
            { id: 'py-b-8-1', pathId: 'python-beginner', day: 8, difficulty: 'easy', prompt: 'Выведи числа от 1 до 10 с помощью while', solutionHint: 'while n <= 10' },
            { id: 'py-b-8-2', pathId: 'python-beginner', day: 8, difficulty: 'easy', prompt: 'Создай обратный отсчёт от 10 до 0', solutionHint: 'while n >= 0' },
            { id: 'py-b-8-3', pathId: 'python-beginner', day: 8, difficulty: 'medium', prompt: 'Угадай число: цикл пока не угадает', concepts: ['while', 'break'] },
            { id: 'py-b-8-4', pathId: 'python-beginner', day: 8, difficulty: 'medium', prompt: 'Суммирование чисел до ввода 0', solutionHint: 'while num != 0' },
            { id: 'py-b-8-5', pathId: 'python-beginner', day: 8, difficulty: 'hard', prompt: 'Напиши программу-меню с выбором действий', concepts: ['while True', 'break'] }
        ],
        estimatedMinutes: 40
    },
    {
        day: 9,
        topic: 'Цикл for и range',
        topicEn: 'For Loop and range()',
        category: 'basics',
        description: 'Итерация по последовательностям, функция range',
        theory: `# День 9: Цикл for — итерация по элементам 🔁

## Итерация по строке

\`\`\`python
for char in "Python":
    print(char)
\`\`\`

## range() — генератор чисел

\`\`\`python
for i in range(5):        # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 6):     # 1, 2, 3, 4, 5
    print(i)

for i in range(0, 10, 2): # 0, 2, 4, 6, 8 (шаг 2)
    print(i)
\`\`\`

## Итерация с индексом

\`\`\`python
fruits = ["apple", "banana", "cherry"]

for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")
\`\`\`

## Вложенные циклы

\`\`\`python
for i in range(3):
    for j in range(3):
        print(f"({i}, {j})")
\`\`\``,
        recap: 'Чем for отличается от while? Как работает range()?',
        tasks: [
            { id: 'py-b-9-1', pathId: 'python-beginner', day: 9, difficulty: 'easy', prompt: 'Выведи числа от 1 до 10 с помощью for', solutionHint: 'range(1, 11)' },
            { id: 'py-b-9-2', pathId: 'python-beginner', day: 9, difficulty: 'easy', prompt: 'Выведи каждый символ своего имени', solutionHint: 'for char in name' },
            { id: 'py-b-9-3', pathId: 'python-beginner', day: 9, difficulty: 'medium', prompt: 'Найди сумму чисел от 1 до 100', concepts: ['for', 'range'] },
            { id: 'py-b-9-4', pathId: 'python-beginner', day: 9, difficulty: 'medium', prompt: 'Выведи таблицу умножения на 7', solutionHint: '7 * i' },
            { id: 'py-b-9-5', pathId: 'python-beginner', day: 9, difficulty: 'hard', prompt: 'Нарисуй треугольник из звёздочек (5 рядов)', concepts: ['nested loops'] }
        ],
        estimatedMinutes: 40
    },
    {
        day: 10,
        topic: 'Практика циклов',
        topicEn: 'Loop Practice',
        category: 'basics',
        description: 'Комбинирование циклов и условий, паттерны',
        theory: `# День 10: Мастерство циклов 💪

Сегодня закрепляем навыки циклов на практических задачах.

## Паттерн: Поиск

\`\`\`python
numbers = [1, 5, 8, 3, 9, 2]

for num in numbers:
    if num > 5:
        print(f"Найдено: {num}")
        break
\`\`\`

## Паттерн: Фильтрация

\`\`\`python
for i in range(1, 21):
    if i % 3 == 0:
        print(i)  # Числа, кратные 3
\`\`\`

## Паттерн: Накопление

\`\`\`python
total = 0
for i in range(1, 11):
    total += i
print(f"Сумма: {total}")  # 55
\`\`\`

## FizzBuzz — классика!

\`\`\`python
for i in range(1, 16):
    if i % 3 == 0 and i % 5 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)
\`\`\``,
        recap: 'Какие паттерны использования циклов ты знаешь?',
        tasks: [
            { id: 'py-b-10-1', pathId: 'python-beginner', day: 10, difficulty: 'easy', prompt: 'Найди все чётные числа от 1 до 20', concepts: ['for', 'if'] },
            { id: 'py-b-10-2', pathId: 'python-beginner', day: 10, difficulty: 'medium', prompt: 'Вычисли факториал числа n', solutionHint: 'result *= i' },
            { id: 'py-b-10-3', pathId: 'python-beginner', day: 10, difficulty: 'medium', prompt: 'Реализуй FizzBuzz для чисел от 1 до 30', concepts: ['for', 'if-elif'] },
            { id: 'py-b-10-4', pathId: 'python-beginner', day: 10, difficulty: 'hard', prompt: 'Проверь, является ли число простым', concepts: ['for', 'break'] },
            { id: 'py-b-10-5', pathId: 'python-beginner', day: 10, difficulty: 'hard', prompt: 'Найди все простые числа до 50', concepts: ['nested loops'] }
        ],
        estimatedMinutes: 45
    },

    // Remaining days would continue similarly...
    // Days 11-45 covering: Lists, Dictionaries, Functions, File I/O, Error Handling, OOP basics
];

// Generate remaining days with template content
for (let day = 11; day <= 45; day++) {
    const topics = [
        // Week 3: Lists
        { topic: 'Списки: создание и индексация', topicEn: 'Lists: Creation and Indexing', category: 'data-structures' },
        { topic: 'Методы списков', topicEn: 'List Methods', category: 'data-structures' },
        { topic: 'Срезы списков', topicEn: 'List Slicing', category: 'data-structures' },
        { topic: 'Списки и циклы', topicEn: 'Lists and Loops', category: 'data-structures' },
        { topic: 'Вложенные списки', topicEn: 'Nested Lists', category: 'data-structures' },
        { topic: 'List Comprehension', topicEn: 'List Comprehension', category: 'data-structures' },
        { topic: 'Практика со списками', topicEn: 'List Practice', category: 'data-structures' },
        // Week 4: Dictionaries & Tuples
        { topic: 'Кортежи', topicEn: 'Tuples', category: 'data-structures' },
        { topic: 'Словари: основы', topicEn: 'Dictionaries: Basics', category: 'data-structures' },
        { topic: 'Методы словарей', topicEn: 'Dictionary Methods', category: 'data-structures' },
        { topic: 'Словари и циклы', topicEn: 'Dictionaries and Loops', category: 'data-structures' },
        { topic: 'Dict Comprehension', topicEn: 'Dictionary Comprehension', category: 'data-structures' },
        { topic: 'Множества (set)', topicEn: 'Sets', category: 'data-structures' },
        { topic: 'Практика структур данных', topicEn: 'Data Structures Practice', category: 'data-structures' },
        // Week 5: Functions
        { topic: 'Функции: основы', topicEn: 'Functions: Basics', category: 'basics' },
        { topic: 'Параметры и аргументы', topicEn: 'Parameters and Arguments', category: 'basics' },
        { topic: 'Возврат значений', topicEn: 'Return Values', category: 'basics' },
        { topic: 'Области видимости', topicEn: 'Variable Scope', category: 'basics' },
        { topic: '*args и **kwargs', topicEn: '*args and **kwargs', category: 'basics' },
        { topic: 'Лямбда-функции', topicEn: 'Lambda Functions', category: 'basics' },
        { topic: 'Практика функций', topicEn: 'Functions Practice', category: 'basics' },
        // Week 6: Files & Errors
        { topic: 'Чтение файлов', topicEn: 'Reading Files', category: 'files' },
        { topic: 'Запись в файлы', topicEn: 'Writing Files', category: 'files' },
        { topic: 'Работа с JSON', topicEn: 'Working with JSON', category: 'files' },
        { topic: 'Обработка ошибок: try-except', topicEn: 'Error Handling: try-except', category: 'basics' },
        { topic: 'Типы исключений', topicEn: 'Exception Types', category: 'basics' },
        { topic: 'Контекстный менеджер with', topicEn: 'Context Manager: with', category: 'files' },
        { topic: 'Практика файлов и ошибок', topicEn: 'Files and Errors Practice', category: 'files' },
        // Week 7: OOP Basics
        { topic: 'Классы и объекты', topicEn: 'Classes and Objects', category: 'oop' },
        { topic: 'Атрибуты и методы', topicEn: 'Attributes and Methods', category: 'oop' },
        { topic: '__init__ и self', topicEn: '__init__ and self', category: 'oop' },
        { topic: 'Инкапсуляция', topicEn: 'Encapsulation', category: 'oop' },
        { topic: 'Наследование', topicEn: 'Inheritance', category: 'oop' },
        { topic: 'Полиморфизм', topicEn: 'Polymorphism', category: 'oop' },
        { topic: 'Финальный проект Beginner', topicEn: 'Final Beginner Project', category: 'project' },
    ];

    const topicIndex = day - 11;
    const topicData = topics[topicIndex] || { topic: `День ${day}`, topicEn: `Day ${day}`, category: 'basics' };

    days.push({
        day,
        topic: topicData.topic,
        topicEn: topicData.topicEn,
        category: (topicData as any).category,
        description: `Изучение темы: ${topicData.topic}`,
        theory: `# День ${day}: ${topicData.topic}

Сегодня изучаем: **${topicData.topic}**.

Подробная теория будет добавлена в следующем обновлении.

## Ключевые концепции

- Понимание основ темы
- Практическое применение
- Решение типовых задач

## Примеры кода

\`\`\`python
# Примеры будут добавлены
print("День ${day}")
\`\`\``,
        recap: `Объясни своими словами: что такое "${topicData.topic}"?`,
        tasks: [
            { id: `py-b-${day}-1`, pathId: 'python-beginner', day, difficulty: 'easy', prompt: `Базовое упражнение по теме "${topicData.topic}"` },
            { id: `py-b-${day}-2`, pathId: 'python-beginner', day, difficulty: 'easy', prompt: `Закрепление: примени концепцию на практике` },
            { id: `py-b-${day}-3`, pathId: 'python-beginner', day, difficulty: 'medium', prompt: `Комбинированная задача по теме` },
            { id: `py-b-${day}-4`, pathId: 'python-beginner', day, difficulty: 'medium', prompt: `Практическая задача` },
            { id: `py-b-${day}-5`, pathId: 'python-beginner', day, difficulty: 'hard', prompt: `Сложная задача: мини-проект` }
        ],
        estimatedMinutes: 35
    });
}

const beginnerPathData = { path, days };

export default beginnerPathData;
