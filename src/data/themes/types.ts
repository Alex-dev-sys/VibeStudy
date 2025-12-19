export type DayCategory = 
  | 'basics'
  | 'oop'
  | 'data-structures'
  | 'web'
  | 'database'
  | 'devops'
  | 'testing'
  | 'security'
  | 'advanced'
  | 'ai-ml'
  | 'project';

export type PracticeType = 'theory' | 'coding' | 'project';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface DayTheme {
  day: number;
  topic: string;
  difficulty: Difficulty;
  category: DayCategory;
  practiceType: PracticeType;
}
