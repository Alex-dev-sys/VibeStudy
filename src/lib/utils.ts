export const formatDayLabel = (day: number) => `День ${day}`;

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const partition = <T>(array: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

export const safeJSONParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Не удалось распарсить JSON', error);
    return fallback;
  }
};

export const generateUID = () => crypto.randomUUID();

export const difficultyColorMap: Record<string, string> = {
  easy: 'text-emerald-300',
  medium: 'text-sky-300',
  hard: 'text-orange-300',
  advanced: 'text-fuchsia-300',
  challenge: 'text-rose-300'
};

export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}

