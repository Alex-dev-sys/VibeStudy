/**
 * TaskModalEditor Component
 * Monaco editor wrapper with loading and error states
 */

import { useState } from 'react';
import { LazyMonacoEditor } from '@/lib/performance/lazy-components';
import { useTranslations } from '@/store/locale-store';

interface TaskModalEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: string;
  monacoLanguage: string;
  isViewMode: boolean;
}

export function TaskModalEditor({
  code,
  onChange,
  language,
  monacoLanguage,
  isViewMode
}: TaskModalEditorProps) {
  const [editorLoading, setEditorLoading] = useState(true);
  const [editorError, setEditorError] = useState(false);
  const t = useTranslations();

  return (
    <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm min-h-[350px]">
      {editorError ? (
        <div className="flex h-[350px] flex-col items-center justify-center gap-4 bg-black/60 p-6">
          <span className="text-4xl">⚠️</span>
          <p className="text-center text-sm text-white/70">
            {t.editor.editorLoadError}
            <br />
            {t.editor.useTextarea}
          </p>
          <textarea
            value={code}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`${t.editor.placeholder} ${language}...`}
            className="h-40 w-full resize-none rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-sm text-white placeholder-white/40 focus:border-accent/50 focus:outline-none"
          />
        </div>
      ) : (
        <>
          {editorLoading && (
            <div className="absolute inset-0 flex h-[350px] items-center justify-center bg-black/60 rounded-2xl z-10">
              <div className="text-center">
                <div className="mb-3 text-2xl animate-pulse">⏳</div>
                <p className="text-sm text-white/60">{t.editor.loading}</p>
              </div>
            </div>
          )}
          <LazyMonacoEditor
            height="350px"
            language={monacoLanguage}
            theme="vs-dark"
            value={code}
            onChange={(val) => onChange(val ?? '')}
            onMount={() => setEditorLoading(false)}
            loading={<div />}
            options={{
              fontSize: 14,
              fontLigatures: true,
              fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Consolas', monospace",
              automaticLayout: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              wordWrap: 'on',
              readOnly: isViewMode,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              tabCompletion: 'on',
              wordBasedSuggestions: 'allDocuments',
              renderValidationDecorations: 'off',
              renderLineHighlight: 'gutter',
              renderWhitespace: 'none',
              padding: { top: 16, bottom: 16 },
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on'
            }}
          />
        </>
      )}
    </div>
  );
}
