const collapseBlankLines = (text: string) => text.replace(/\n{3,}/g, '\n\n');

const normalizeBulletSymbols = (text: string) =>
  text
    .replace(/^[\t ]*•[\t ]*/gm, '- ')
    .replace(/^[\t ]*-\s{2,}/gm, '- ')
    .replace(/^[\t ]*[\u2013\u2014][\t ]*/gm, '- ');

const ensureCodeFenceLanguage = (text: string, languageId: string) =>
  text.replace(/```(\s*\n)/g, (_match, newline) => `\`\`\`${languageId}${newline}`);

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

