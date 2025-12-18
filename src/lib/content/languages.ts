import { ProgrammingLanguage } from '@/types';

export const LANGUAGES: ProgrammingLanguage[] = [
  {
    id: 'python',
    label: 'Python',
    description: 'Интуитивный синтаксис, подходит для быстрого старта и аналитики данных.',
    monacoLanguage: 'python',
    highlightColor: '#ffd166'
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    description: 'Язык для фронтенда и бэкенда, обязательный инструмент веб-разработчика.',
    monacoLanguage: 'javascript',
    highlightColor: '#f9a03f'
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    description: 'Строгая типизация поверх JavaScript — современный стандарт веба.',
    monacoLanguage: 'typescript',
    highlightColor: '#3178c6'
  },
  {
    id: 'java',
    label: 'Java',
    description: 'Надёжный индустриальный стандарт для корпоративных систем и Android.',
    monacoLanguage: 'java',
    highlightColor: '#f06543'
  },
  {
    id: 'cpp',
    label: 'C++',
    description: 'Высокая производительность и контроль над памятью для системного ПО и игр.',
    monacoLanguage: 'cpp',
    highlightColor: '#5e81ac'
  },
  {
    id: 'go',
    label: 'Go',
    description: 'Компактная и быстрая разработка микросервисов и высоконагруженных систем.',
    monacoLanguage: 'go',
    highlightColor: '#00add8'
  },
  {
    id: 'csharp',
    label: 'C#',
    description: 'Экосистема .NET для десктопа, веба, игр и облаков.',
    monacoLanguage: 'csharp',
    highlightColor: '#9b5de5'
  }
];

export const DEFAULT_LANGUAGE = LANGUAGES[0];

export const getLanguageById = (id: string) => LANGUAGES.find((lang) => lang.id === id) ?? DEFAULT_LANGUAGE;

