/**
 * Python ML Engineer Path Content
 * 70 days - from Python to production ML
 */

import type { PathDayContent } from '@/types/learning-paths';
import { PYTHON_ML_ENGINEER } from '../index';

export const path = PYTHON_ML_ENGINEER;

const generateDays = (): PathDayContent[] => {
    const topics = [
        // Module 1: ML Foundations (Days 1-15)
        { topic: 'Обзор ML Engineer профессии', topicEn: 'ML Engineer Career Overview' },
        { topic: 'Математика для ML: линейная алгебра', topicEn: 'Math for ML: Linear Algebra' },
        { topic: 'Математика для ML: матрицы', topicEn: 'Math for ML: Matrices' },
        { topic: 'Математика для ML: производные', topicEn: 'Math for ML: Derivatives' },
        { topic: 'Математика для ML: градиентный спуск', topicEn: 'Math for ML: Gradient Descent' },
        { topic: 'NumPy для ML', topicEn: 'NumPy for ML' },
        { topic: 'Pandas для ML', topicEn: 'Pandas for ML' },
        { topic: 'Визуализация для ML', topicEn: 'Visualization for ML' },
        { topic: 'Scikit-learn: повторение', topicEn: 'Scikit-learn: Review' },
        { topic: 'Feature Engineering продвинутый', topicEn: 'Advanced Feature Engineering' },
        { topic: 'Выбор и валидация моделей', topicEn: 'Model Selection and Validation' },
        { topic: 'Гиперпараметры и Grid Search', topicEn: 'Hyperparameters and Grid Search' },
        { topic: 'Ensemble методы', topicEn: 'Ensemble Methods' },
        { topic: 'XGBoost и LightGBM', topicEn: 'XGBoost and LightGBM' },
        { topic: 'Проект: классический ML', topicEn: 'Project: Classical ML' },

        // Module 2: Deep Learning (Days 16-35)
        { topic: 'Введение в нейронные сети', topicEn: 'Introduction to Neural Networks' },
        { topic: 'Персептрон и активации', topicEn: 'Perceptron and Activations' },
        { topic: 'Backpropagation', topicEn: 'Backpropagation' },
        { topic: 'TensorFlow/Keras: установка', topicEn: 'TensorFlow/Keras: Setup' },
        { topic: 'Keras: первая модель', topicEn: 'Keras: First Model' },
        { topic: 'Keras: слои и архитектуры', topicEn: 'Keras: Layers and Architectures' },
        { topic: 'Регуляризация в DL', topicEn: 'Regularization in DL' },
        { topic: 'Оптимизаторы: Adam, SGD', topicEn: 'Optimizers: Adam, SGD' },
        { topic: 'CNN: свёрточные сети', topicEn: 'CNN: Convolutional Networks' },
        { topic: 'CNN: архитектуры (VGG, ResNet)', topicEn: 'CNN: Architectures' },
        { topic: 'Transfer Learning', topicEn: 'Transfer Learning' },
        { topic: 'Аугментация изображений', topicEn: 'Image Augmentation' },
        { topic: 'RNN и LSTM', topicEn: 'RNN and LSTM' },
        { topic: 'Обработка последовательностей', topicEn: 'Sequence Processing' },
        { topic: 'Attention механизм', topicEn: 'Attention Mechanism' },
        { topic: 'Transformers основы', topicEn: 'Transformers Basics' },
        { topic: 'BERT и GPT обзор', topicEn: 'BERT and GPT Overview' },
        { topic: 'Fine-tuning LLM', topicEn: 'Fine-tuning LLM' },
        { topic: 'PyTorch: основы', topicEn: 'PyTorch: Basics' },
        { topic: 'Проект: Computer Vision', topicEn: 'Project: Computer Vision' },

        // Module 3: MLOps (Days 36-50)
        { topic: 'MLOps: обзор практик', topicEn: 'MLOps: Overview' },
        { topic: 'Версионирование данных: DVC', topicEn: 'Data Versioning: DVC' },
        { topic: 'Эксперименты: MLflow', topicEn: 'Experiments: MLflow' },
        { topic: 'Трекинг метрик', topicEn: 'Metrics Tracking' },
        { topic: 'Сериализация моделей', topicEn: 'Model Serialization' },
        { topic: 'Model Registry', topicEn: 'Model Registry' },
        { topic: 'Docker для ML', topicEn: 'Docker for ML' },
        { topic: 'FastAPI для ML моделей', topicEn: 'FastAPI for ML Models' },
        { topic: 'Batch vs Real-time Inference', topicEn: 'Batch vs Real-time Inference' },
        { topic: 'GPU и оптимизация', topicEn: 'GPU and Optimization' },
        { topic: 'ONNX и TensorRT', topicEn: 'ONNX and TensorRT' },
        { topic: 'A/B тестирование моделей', topicEn: 'A/B Testing Models' },
        { topic: 'Мониторинг моделей', topicEn: 'Model Monitoring' },
        { topic: 'Data Drift и Model Drift', topicEn: 'Data and Model Drift' },
        { topic: 'Проект: ML Pipeline', topicEn: 'Project: ML Pipeline' },

        // Module 4: Specialization (Days 51-65)
        { topic: 'NLP: токенизация', topicEn: 'NLP: Tokenization' },
        { topic: 'NLP: Word Embeddings', topicEn: 'NLP: Word Embeddings' },
        { topic: 'NLP: Hugging Face', topicEn: 'NLP: Hugging Face' },
        { topic: 'NLP: Text Classification', topicEn: 'NLP: Text Classification' },
        { topic: 'NLP: Named Entity Recognition', topicEn: 'NLP: NER' },
        { topic: 'Computer Vision: Object Detection', topicEn: 'CV: Object Detection' },
        { topic: 'Computer Vision: Segmentation', topicEn: 'CV: Segmentation' },
        { topic: 'Генеративные модели: GAN', topicEn: 'Generative Models: GAN' },
        { topic: 'Diffusion Models обзор', topicEn: 'Diffusion Models Overview' },
        { topic: 'Reinforcement Learning основы', topicEn: 'RL Basics' },
        { topic: 'Time Series с DL', topicEn: 'Time Series with DL' },
        { topic: 'Recommender Systems', topicEn: 'Recommender Systems' },
        { topic: 'Graph Neural Networks обзор', topicEn: 'Graph Neural Networks Overview' },
        { topic: 'AutoML и Neural Architecture Search', topicEn: 'AutoML and NAS' },
        { topic: 'Проект: специализация', topicEn: 'Project: Specialization' },

        // Module 5: Production & Career (Days 66-70)
        { topic: 'Cloud ML: AWS/GCP/Azure', topicEn: 'Cloud ML: AWS/GCP/Azure' },
        { topic: 'Kubernetes для ML', topicEn: 'Kubernetes for ML' },
        { topic: 'Финальный проект: часть 1', topicEn: 'Final Project: Part 1' },
        { topic: 'Финальный проект: часть 2', topicEn: 'Final Project: Part 2' },
        { topic: 'Карьера ML Engineer', topicEn: 'ML Engineer Career' },
    ];

    return topics.map((t, i) => ({
        day: i + 1,
        topic: t.topic,
        topicEn: t.topicEn,
        description: `ML Engineering: ${t.topic}`,
        theory: `# День ${i + 1}: ${t.topic}\n\nИзучаем: **${t.topic}**`,
        recap: `Что ты узнал о "${t.topic}"?`,
        tasks: [
            { id: `py-ml-${i + 1}-1`, pathId: 'python-ml-engineer', day: i + 1, difficulty: 'easy', prompt: `Упражнение: ${t.topic}` },
            { id: `py-ml-${i + 1}-2`, pathId: 'python-ml-engineer', day: i + 1, difficulty: 'easy', prompt: 'Закрепление' },
            { id: `py-ml-${i + 1}-3`, pathId: 'python-ml-engineer', day: i + 1, difficulty: 'medium', prompt: 'Практика' },
            { id: `py-ml-${i + 1}-4`, pathId: 'python-ml-engineer', day: i + 1, difficulty: 'medium', prompt: 'Задача' },
            { id: `py-ml-${i + 1}-5`, pathId: 'python-ml-engineer', day: i + 1, difficulty: 'hard', prompt: 'Проект' },
        ],
        estimatedMinutes: 50,
    }));
};

export const days: PathDayContent[] = generateDays();
const mlEngineerPathData = { path, days };

export default mlEngineerPathData;
