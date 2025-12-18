const collapseBlankLines = (text: string) => text.replace(/\n{3,}/g, '\n\n');

const normalizeBulletSymbols = (text: string) =>
  text
    .replace(/^[\t ]*•[\t ]*/gm, '- ')
    .replace(/^[\t ]*-\s{2,}/gm, '- ')
    .replace(/^[\t ]*[\u2013\u2014][\t ]*/gm, '- ');

const ensureCodeFenceLanguage = (text: string, languageId: string) =>
  text.replace(/```(\s*\n)/g, (_match, newline) => `\`\`\`${languageId}${newline}`);

/**
 * Фильтрует термины из других языков программирования
 */
const filterLanguageSpecificTerms = (text: string, languageId: string): string => {
  const lang = languageId.toLowerCase();
  
  // Для Python убираем JavaScript-специфичные термины
  if (lang === 'python' || lang === 'py') {
    // Убираем целые строки со списками, содержащие undefined
    text = text.replace(/^[-•*]\s*[Uu]ndefined[^:\n]*:?\s*[^`\n]*`?undefined`?[^\n]*$/gim, '');
    text = text.replace(/^[-•*]\s*undefined[^:\n]*:?\s*[^`\n]*`?undefined`?[^\n]*$/gim, '');
    
    // Убираем упоминания undefined в тексте, заменяя на None
    text = text.replace(/\bundefined\b/gi, 'None');
    
    // Убираем строки со списками, содержащие null (заменяем на None)
    text = text.replace(/^[-•*]\s*[Nn]ull[^:\n]*:?\s*`?null`?[^\n]*$/gim, '');
    text = text.replace(/\bnull\b/gi, 'None');
    
    // Очищаем лишние пустые строки
    text = text.replace(/\n{3,}/g, '\n\n');
  }
  
  // Для JavaScript можно оставить undefined и null, но убираем Python-специфичные
  if (lang === 'javascript' || lang === 'js' || lang === 'typescript' || lang === 'ts') {
    // Убираем упоминания Python-специфичных типов
    text = text.replace(/\bint\s*\(/gi, 'parseInt(');
    text = text.replace(/тип данных[^.]*int[^.]*\./gi, (match) => {
      if (match.includes('int') && !match.includes('number')) {
        return match.replace(/\bint\b/gi, 'number');
      }
      return match;
    });
  }
  
  return text;
};

interface FormatTheoryOptions {
  topic: string;
  languageId: string;
}

export const formatTheoryContent = (rawTheory: string | undefined | any, { topic, languageId }: FormatTheoryOptions) => {
  // Handle case when theory is an object (from new AI format)
  if (typeof rawTheory === 'object' && rawTheory !== null) {
    // Convert object to markdown string
    const parts: string[] = [];
    if (rawTheory.introduction) parts.push(rawTheory.introduction);
    if (rawTheory.main_concepts) {
      parts.push('\n## Основные концепции\n');
      if (typeof rawTheory.main_concepts === 'object') {
        Object.entries(rawTheory.main_concepts).forEach(([key, value]) => {
          parts.push(`\n**${key}**: ${value}`);
        });
      } else {
        parts.push(String(rawTheory.main_concepts));
      }
    }
    if (rawTheory.examples) parts.push('\n## Примеры\n' + String(rawTheory.examples));
    if (rawTheory.notes) parts.push('\n## Важные замечания\n' + String(rawTheory.notes));
    rawTheory = parts.join('\n');
  }
  
  let theory = (rawTheory ?? '').toString().replace(/\r\n/g, '\n').replace(/\t/g, '  ').trim();

  if (!theory) {
    return `## Тема дня: ${topic}\n\nНе удалось получить развёрнутую теорию. Попробуйте обновить генерацию позже.`;
  }

  theory = collapseBlankLines(theory);
  theory = normalizeBulletSymbols(theory);
  theory = ensureCodeFenceLanguage(theory, languageId);
  
  // Фильтруем недопустимые термины для разных языков
  theory = filterLanguageSpecificTerms(theory, languageId);

  if (!/^#{1,6}\s/.test(theory)) {
    theory = `## Тема дня: ${topic}\n\n${theory}`;
  }

  return theory;
};

export const trimPrompt = <T extends { prompt: string; solutionHint?: string | null }>(task: T): T => ({
  ...task,
  prompt: task.prompt.trim(),
  solutionHint: task.solutionHint?.trim()
});

