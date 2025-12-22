/**
 * Python Data Scientist Path Content
 * 60 days - from Python basics to data science
 */

import type { PathDayContent } from '@/types/learning-paths';
import { PYTHON_DATA_SCIENTIST } from '../index';

export const path = PYTHON_DATA_SCIENTIST;

const generateDays = (): PathDayContent[] => {
    const topics = [
        // Module 1: Python for Data (Days 1-10)
        { topic: 'Введение в Data Science', topicEn: 'Introduction to Data Science', category: 'intro' },
        { topic: 'NumPy: основы массивов', topicEn: 'NumPy: Array Basics', category: 'numpy' },
        { topic: 'NumPy: операции с массивами', topicEn: 'NumPy: Array Operations', category: 'numpy' },
        { topic: 'NumPy: индексация и срезы', topicEn: 'NumPy: Indexing and Slicing', category: 'numpy' },
        { topic: 'NumPy: агрегация и статистика', topicEn: 'NumPy: Aggregation and Statistics', category: 'numpy' },
        { topic: 'Pandas: Series и DataFrame', topicEn: 'Pandas: Series and DataFrame', category: 'pandas' },
        { topic: 'Pandas: загрузка данных', topicEn: 'Pandas: Loading Data', category: 'pandas' },
        { topic: 'Pandas: фильтрация и выборка', topicEn: 'Pandas: Filtering and Selection', category: 'pandas' },
        { topic: 'Pandas: работа с пропусками', topicEn: 'Pandas: Handling Missing Data', category: 'pandas' },
        { topic: 'Pandas: группировка и агрегация', topicEn: 'Pandas: Grouping and Aggregation', category: 'pandas' },

        // Module 2: Data Visualization (Days 11-20)
        { topic: 'Matplotlib: основы графиков', topicEn: 'Matplotlib: Chart Basics', category: 'visualization' },
        { topic: 'Matplotlib: настройка графиков', topicEn: 'Matplotlib: Chart Customization', category: 'visualization' },
        { topic: 'Matplotlib: множественные графики', topicEn: 'Matplotlib: Multiple Charts', category: 'visualization' },
        { topic: 'Seaborn: статистические графики', topicEn: 'Seaborn: Statistical Charts', category: 'visualization' },
        { topic: 'Seaborn: тепловые карты и распределения', topicEn: 'Seaborn: Heatmaps and Distributions', category: 'visualization' },
        { topic: 'Интерактивная визуализация: Plotly', topicEn: 'Interactive Visualization: Plotly', category: 'visualization' },
        { topic: 'Дашборды и отчёты', topicEn: 'Dashboards and Reports', category: 'visualization' },
        { topic: 'EDA: исследовательский анализ', topicEn: 'EDA: Exploratory Data Analysis', category: 'analysis' },
        { topic: 'Проект: анализ датасета', topicEn: 'Project: Dataset Analysis', category: 'project' },
        { topic: 'Презентация результатов', topicEn: 'Presenting Results', category: 'analysis' },

        // Module 3: Statistics & Probability (Days 21-30)
        { topic: 'Описательная статистика', topicEn: 'Descriptive Statistics', category: 'statistics' },
        { topic: 'Распределения вероятностей', topicEn: 'Probability Distributions', category: 'statistics' },
        { topic: 'Центральная предельная теорема', topicEn: 'Central Limit Theorem', category: 'statistics' },
        { topic: 'Доверительные интервалы', topicEn: 'Confidence Intervals', category: 'statistics' },
        { topic: 'Проверка гипотез', topicEn: 'Hypothesis Testing', category: 'statistics' },
        { topic: 'A/B тестирование', topicEn: 'A/B Testing', category: 'statistics' },
        { topic: 'Корреляция и причинность', topicEn: 'Correlation and Causation', category: 'statistics' },
        { topic: 'Регрессионный анализ', topicEn: 'Regression Analysis', category: 'statistics' },
        { topic: 'Практика статистики', topicEn: 'Statistics Practice', category: 'practice' },
        { topic: 'Проект: статистический анализ', topicEn: 'Project: Statistical Analysis', category: 'project' },

        // Module 4: Machine Learning Basics (Days 31-45)
        { topic: 'Введение в ML', topicEn: 'Introduction to ML', category: 'ml' },
        { topic: 'Scikit-learn: первые шаги', topicEn: 'Scikit-learn: First Steps', category: 'ml' },
        { topic: 'Подготовка данных для ML', topicEn: 'Data Preparation for ML', category: 'ml' },
        { topic: 'Линейная регрессия', topicEn: 'Linear Regression', category: 'ml' },
        { topic: 'Логистическая регрессия', topicEn: 'Logistic Regression', category: 'ml' },
        { topic: 'Деревья решений', topicEn: 'Decision Trees', category: 'ml' },
        { topic: 'Случайный лес', topicEn: 'Random Forest', category: 'ml' },
        { topic: 'Метрики качества моделей', topicEn: 'Model Evaluation Metrics', category: 'ml' },
        { topic: 'Кросс-валидация', topicEn: 'Cross-validation', category: 'ml' },
        { topic: 'Переобучение и регуляризация', topicEn: 'Overfitting and Regularization', category: 'ml' },
        { topic: 'Feature Engineering', topicEn: 'Feature Engineering', category: 'ml' },
        { topic: 'Кластеризация: K-means', topicEn: 'Clustering: K-means', category: 'ml' },
        { topic: 'Снижение размерности: PCA', topicEn: 'Dimensionality Reduction: PCA', category: 'ml' },
        { topic: 'Pipeline в sklearn', topicEn: 'Sklearn Pipeline', category: 'ml' },
        { topic: 'Проект: ML модель', topicEn: 'Project: ML Model', category: 'project' },

        // Module 5: Advanced & Projects (Days 46-60)
        { topic: 'SQL для Data Science', topicEn: 'SQL for Data Science', category: 'sql' },
        { topic: 'SQL: JOIN и подзапросы', topicEn: 'SQL: JOIN and Subqueries', category: 'sql' },
        { topic: 'SQL + Pandas интеграция', topicEn: 'SQL + Pandas Integration', category: 'sql' },
        { topic: 'Работа с большими данными', topicEn: 'Working with Big Data', category: 'advanced' },
        { topic: 'Временные ряды: основы', topicEn: 'Time Series: Basics', category: 'advanced' },
        { topic: 'Временные ряды: прогнозирование', topicEn: 'Time Series: Forecasting', category: 'advanced' },
        { topic: 'NLP: обработка текста', topicEn: 'NLP: Text Processing', category: 'advanced' },
        { topic: 'Веб-скрапинг для данных', topicEn: 'Web Scraping for Data', category: 'advanced' },
        { topic: 'API и сбор данных', topicEn: 'APIs and Data Collection', category: 'advanced' },
        { topic: 'Jupyter и Git для DS', topicEn: 'Jupyter and Git for DS', category: 'tools' },
        { topic: 'Проект: сбор и анализ данных', topicEn: 'Project: Data Collection and Analysis', category: 'project' },
        { topic: 'Проект: построение модели', topicEn: 'Project: Building a Model', category: 'project' },
        { topic: 'Проект: визуализация результатов', topicEn: 'Project: Results Visualization', category: 'project' },
        { topic: 'Портфолио Data Scientist', topicEn: 'Data Scientist Portfolio', category: 'career' },
        { topic: 'Карьера в Data Science', topicEn: 'Career in Data Science', category: 'career' },
    ];

    return topics.map((t, i) => ({
        day: i + 1,
        topic: t.topic,
        topicEn: t.topicEn,
        description: `Data Science: ${t.topic}`,
        theory: `# День ${i + 1}: ${t.topic}

Изучаем: **${t.topic}**

## Ключевые концепции

Подробная теория будет добавлена.

\`\`\`python
# Пример кода для дня ${i + 1}
import pandas as pd
import numpy as np
\`\`\``,
        recap: `Что ты узнал о "${t.topic}"?`,
        category: t.category,
        tasks: [
            { id: `py-ds-${i + 1}-1`, pathId: 'python-data-scientist', day: i + 1, difficulty: 'easy', prompt: `Базовое упражнение: ${t.topic}` },
            { id: `py-ds-${i + 1}-2`, pathId: 'python-data-scientist', day: i + 1, difficulty: 'easy', prompt: 'Закрепление концепции' },
            { id: `py-ds-${i + 1}-3`, pathId: 'python-data-scientist', day: i + 1, difficulty: 'medium', prompt: 'Практическая задача' },
            { id: `py-ds-${i + 1}-4`, pathId: 'python-data-scientist', day: i + 1, difficulty: 'medium', prompt: 'Анализ данных' },
            { id: `py-ds-${i + 1}-5`, pathId: 'python-data-scientist', day: i + 1, difficulty: 'hard', prompt: 'Комплексное задание' },
        ],
        estimatedMinutes: 45,
    }));
};

export const days: PathDayContent[] = generateDays();

export default { path, days };
