'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { FeedbackButtons } from '@/components/ai/FeedbackButtons';
import { BookOpen, Lightbulb, Code2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';

interface TheoryBlockProps {
  theory: string;
  dayNumber: number;
  topic: string;
  languageId?: string;
}

// Парсинг markdown для улучшенного отображения
function parseTheory(content: string) {
  const lines = content.split('\n');
  const blocks: Array<{ type: string; content: string; metadata?: any }> = [];
  let currentCodeBlock: string[] = [];
  let inCodeBlock = false;
  let codeLanguage = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Обработка блоков кода
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          type: 'code',
          content: currentCodeBlock.join('\n'),
          metadata: { language: codeLanguage }
        });
        currentCodeBlock = [];
        inCodeBlock = false;
        codeLanguage = '';
      } else {
        codeLanguage = trimmed.slice(3).trim();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      currentCodeBlock.push(line);
      continue;
    }

    // Заголовки H2
    if (trimmed.startsWith('## ')) {
      blocks.push({
        type: 'h2',
        content: trimmed.slice(3).trim()
      });
      continue;
    }

    // Заголовки H3
    if (trimmed.startsWith('### ')) {
      blocks.push({
        type: 'h3',
        content: trimmed.slice(4).trim()
      });
      continue;
    }

    // Важные блоки (Важно, Совет и т.д.)
    if (trimmed.match(/^(Важно|Важно:|⚠️|💡|Совет|Совет:)/i)) {
      const restOfBlock: string[] = [trimmed];
      let j = i + 1;
      while (j < lines.length && lines[j].trim() && !lines[j].trim().startsWith('##') && !lines[j].trim().startsWith('###')) {
        restOfBlock.push(lines[j]);
        j++;
      }
      i = j - 1;
      blocks.push({
        type: 'important',
        content: restOfBlock.join('\n')
      });
      continue;
    }

    // Списки
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.match(/^\d+\.\s/)) {
      const listItems: string[] = [];
      let j = i;
      while (j < lines.length && (lines[j].trim().startsWith('- ') || lines[j].trim().startsWith('* ') || lines[j].trim().match(/^\d+\.\s/))) {
        listItems.push(lines[j].trim().replace(/^[-*]\s|^\d+\.\s/, ''));
        j++;
      }
      i = j - 1;
      blocks.push({
        type: 'list',
        content: listItems.join('\n')
      });
      continue;
    }

    // Выделенный текст (жирный)
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      blocks.push({
        type: 'bold',
        content: trimmed.slice(2, -2).trim()
      });
      continue;
    }

    // Код inline
    if (trimmed.includes('`') && trimmed.match(/`[^`]+`/)) {
      const codeMatches = trimmed.match(/`([^`]+)`/g);
      if (codeMatches) {
        let processed = trimmed;
        codeMatches.forEach(match => {
          processed = processed.replace(match, `\u0001CODE\u0001${match.slice(1, -1)}\u0001/CODE\u0001`);
        });
        blocks.push({
          type: 'paragraph',
          content: processed
        });
        continue;
      }
    }

    // Обычные параграфы
    if (trimmed) {
      // Проверка на строки с кодом (содержат = или вызовы функций)
      if (
        (trimmed.includes('=') && trimmed.length < 120 && !trimmed.startsWith('**')) ||
        (trimmed.includes('(') && trimmed.includes(')') && trimmed.length < 120 && !trimmed.startsWith('**'))
      ) {
        blocks.push({
          type: 'inline-code',
          content: trimmed
        });
      } 
      // Проверка на заголовки с двоеточием
      else if (trimmed.endsWith(':') && trimmed.length < 60 && !trimmed.includes('=') && !trimmed.includes('(')) {
        blocks.push({
          type: 'h3',
          content: trimmed.slice(0, -1)
        });
      } else {
        blocks.push({
          type: 'paragraph',
          content: trimmed
        });
      }
    } else if (blocks.length > 0 && blocks[blocks.length - 1].type !== 'spacer') {
      blocks.push({ type: 'spacer', content: '' });
    }
  }

  return blocks;
}

export function TheoryBlock({ theory, dayNumber, topic, languageId = 'unknown' }: TheoryBlockProps) {
  const parsedBlocks = useMemo(() => parseTheory(theory), [theory]);

  const renderBlock = (block: { type: string; content: string; metadata?: any }, index: number) => {
    switch (block.type) {
      case 'h2':
        return (
          <h2
            key={index}
            className="mt-6 mb-4 text-xl font-semibold text-white/90 sm:text-2xl"
          >
            {block.content}
          </h2>
        );

      case 'h3':
        return (
          <h3
            key={index}
            className="mt-5 mb-3 text-lg font-medium text-white/85 sm:text-xl"
          >
            {block.content}
          </h3>
        );

      case 'code':
        const codeLines = block.content.split('\n');
        return (
          <div
            key={index}
            className="my-4 rounded-lg overflow-hidden bg-[#1a1a1a] border border-white/10"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#252525] border-b border-white/5">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-white/60" />
                <span className="text-xs font-medium text-white/60">
                  {block.metadata?.language || languageId}
                </span>
              </div>
            </div>
            <pre className="overflow-x-auto p-3">
              <code className="text-sm font-mono text-[#7dd3fc] leading-relaxed">
                {codeLines.map((line, i) => (
                  <div key={i} className="whitespace-pre">
                    {line || '\u00A0'}
                  </div>
                ))}
              </code>
            </pre>
          </div>
        );

      case 'important':
        const isWarning = block.content.includes('Важно') || block.content.includes('⚠️');
        const isTip = block.content.includes('Совет') || block.content.includes('💡');
        const icon = isWarning ? AlertCircle : isTip ? Lightbulb : CheckCircle2;
        const IconComponent = icon;
        
        return (
          <div
            key={index}
            className={`my-4 rounded-lg border p-4 ${
              isWarning
                ? 'bg-amber-500/10 border-amber-500/20'
                : isTip
                ? 'bg-blue-500/10 border-blue-500/20'
                : 'bg-green-500/10 border-green-500/20'
            }`}
          >
            <div className="flex gap-3">
              <IconComponent
                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  isWarning ? 'text-amber-400/80' : isTip ? 'text-blue-400/80' : 'text-green-400/80'
                }`}
              />
              <div className="flex-1 text-sm sm:text-base leading-relaxed text-white/85">
                {block.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>
                    {line.replace(/^(Важно|Важно:|⚠️|💡|Совет|Совет:)\s*/i, '')}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );

      case 'list':
        const items = block.content.split('\n').filter(Boolean);
        return (
          <ul key={index} className="my-3 space-y-2 list-none">
            {items.map((item, i) => {
              // Обработка жирного текста в начале пункта
              const boldMatch = item.match(/^\*\*([^*]+)\*\*:\s*(.+)/);
              if (boldMatch) {
                return (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white/40 mt-2.5" />
                    <span className="text-sm sm:text-base text-white/85 leading-relaxed flex-1">
                      <strong className="text-white/95 font-medium">{boldMatch[1]}:</strong> {boldMatch[2]}
                    </span>
                  </li>
                );
              }
              return (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white/40 mt-2.5" />
                  <span className="text-sm sm:text-base text-white/85 leading-relaxed flex-1">{item}</span>
                </li>
              );
            })}
          </ul>
        );

      case 'bold':
        return (
          <p key={index} className="my-3 text-base font-medium text-white/85 sm:text-lg">
            {block.content}
          </p>
        );

      case 'inline-code':
        return (
          <pre
            key={index}
            className="my-2 rounded-md bg-[#1a1a1a] border border-white/10 px-3 py-2 overflow-x-auto"
          >
            <code className="text-xs sm:text-sm font-mono text-[#7dd3fc] leading-relaxed">
              {block.content}
            </code>
          </pre>
        );

      case 'paragraph':
        // Обработка inline кода
        const parts = block.content.split(/\u0001CODE\u0001([^\u0001]+)\u0001\/CODE\u0001/);
        return (
          <p key={index} className="my-3 text-sm sm:text-base leading-relaxed text-white/80">
            {parts.map((part, i) => {
              if (i % 2 === 1) {
                // Это код
                return (
                  <code
                    key={i}
                    className="px-2 py-0.5 rounded bg-[#1a1a1a] text-[#7dd3fc] font-mono text-xs sm:text-sm border border-white/10"
                  >
                    {part}
                  </code>
                );
              }
              return <span key={i}>{part}</span>;
            })}
          </p>
        );

      case 'spacer':
        return <div key={index} className="h-3" />;

      default:
        return (
          <p key={index} className="my-3 text-sm sm:text-base leading-relaxed text-white/80">
            {block.content}
          </p>
        );
    }
  };

  return (
    <Card className="border border-white/10 overflow-hidden">
      <CardHeader className="bg-white/5">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xl text-white sm:h-10 sm:w-10 sm:text-2xl">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base text-white/95">
                Теория дня {dayNumber}
              </CardTitle>
              <p className="text-xs text-white/70 sm:text-sm">{topic}</p>
            </div>
          </div>
          <FeedbackButtons
            contentType="theory"
            contentKey={`${languageId}-day-${dayNumber}-theory`}
            metadata={{ language: languageId, day: dayNumber, topic }}
            className="hidden sm:flex"
          />
        </div>
      </CardHeader>
      
      <div className="space-y-4 px-4 pb-4 sm:space-y-5 sm:px-6 sm:pb-6 pt-4 sm:pt-6">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <div className="prose prose-invert max-w-none">
            {parsedBlocks.map((block, index) => renderBlock(block, index))}
          </div>
        </div>
        
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex gap-3">
            <Lightbulb className="w-4 h-4 text-white/50 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/70 font-normal sm:text-sm flex-1 leading-relaxed">
              <strong className="text-white/80">Совет:</strong> Внимательно изучи теорию перед выполнением заданий. Все задачи можно решить, используя только материал из этой теории.
            </p>
          </div>
        </div>
        
        <div className="flex sm:hidden justify-center">
          <FeedbackButtons
            contentType="theory"
            contentKey={`${languageId}-day-${dayNumber}-theory`}
            metadata={{ language: languageId, day: dayNumber, topic }}
          />
        </div>
      </div>
    </Card>
  );
}
