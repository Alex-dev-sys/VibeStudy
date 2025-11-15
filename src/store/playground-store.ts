import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CodeSnippet {
  id: string;
  name: string;
  language: string;
  code: string;
  createdAt: number;
  updatedAt: number;
  collectionId?: string;
}

export interface SnippetCollection {
  id: string;
  name: string;
  description: string;
  snippetIds: string[];
}

export interface ConsoleMessage {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
  stack?: string;
}

interface PlaygroundStore {
  snippets: Record<string, CodeSnippet>;
  collections: Record<string, SnippetCollection>;
  activeSnippetId: string | null;
  consoleOutput: ConsoleMessage[];
  
  saveSnippet: (snippet: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateSnippet: (id: string, updates: Partial<CodeSnippet>) => void;
  deleteSnippet: (id: string) => void;
  loadSnippet: (id: string) => CodeSnippet | null;
  createCollection: (name: string, description: string) => string;
  addToCollection: (snippetId: string, collectionId: string) => void;
  removeFromCollection: (snippetId: string, collectionId: string) => void;
  generateShareUrl: (snippetId: string) => Promise<string>;
  exportSnippet: (snippetId: string) => void;
  clearConsole: () => void;
  addConsoleMessage: (message: Omit<ConsoleMessage, 'id' | 'timestamp'>) => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export const usePlaygroundStore = create<PlaygroundStore>()(
  persist(
    (set, get) => ({
      snippets: {},
      collections: {},
      activeSnippetId: null,
      consoleOutput: [],
      
      saveSnippet: (snippet) => {
        const id = generateId();
        const now = Date.now();
        
        const newSnippet: CodeSnippet = {
          ...snippet,
          id,
          createdAt: now,
          updatedAt: now
        };
        
        set((state) => ({
          snippets: {
            ...state.snippets,
            [id]: newSnippet
          },
          activeSnippetId: id
        }));
        
        return id;
      },
      
      updateSnippet: (id, updates) => {
        set((state) => {
          const snippet = state.snippets[id];
          if (!snippet) return state;
          
          return {
            snippets: {
              ...state.snippets,
              [id]: {
                ...snippet,
                ...updates,
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      deleteSnippet: (id) => {
        set((state) => {
          const newSnippets = { ...state.snippets };
          delete newSnippets[id];
          
          // Remove from collections
          const newCollections = { ...state.collections };
          Object.keys(newCollections).forEach((collectionId) => {
            newCollections[collectionId] = {
              ...newCollections[collectionId],
              snippetIds: newCollections[collectionId].snippetIds.filter((sid) => sid !== id)
            };
          });
          
          return {
            snippets: newSnippets,
            collections: newCollections,
            activeSnippetId: state.activeSnippetId === id ? null : state.activeSnippetId
          };
        });
      },
      
      loadSnippet: (id) => {
        const snippet = get().snippets[id];
        if (snippet) {
          set({ activeSnippetId: id });
          return snippet;
        }
        return null;
      },
      
      createCollection: (name, description) => {
        const id = generateId();
        
        const newCollection: SnippetCollection = {
          id,
          name,
          description,
          snippetIds: []
        };
        
        set((state) => ({
          collections: {
            ...state.collections,
            [id]: newCollection
          }
        }));
        
        return id;
      },
      
      addToCollection: (snippetId, collectionId) => {
        set((state) => {
          const collection = state.collections[collectionId];
          if (!collection || !state.snippets[snippetId]) return state;
          
          if (collection.snippetIds.includes(snippetId)) return state;
          
          return {
            collections: {
              ...state.collections,
              [collectionId]: {
                ...collection,
                snippetIds: [...collection.snippetIds, snippetId]
              }
            },
            snippets: {
              ...state.snippets,
              [snippetId]: {
                ...state.snippets[snippetId],
                collectionId
              }
            }
          };
        });
      },
      
      removeFromCollection: (snippetId, collectionId) => {
        set((state) => {
          const collection = state.collections[collectionId];
          if (!collection) return state;
          
          return {
            collections: {
              ...state.collections,
              [collectionId]: {
                ...collection,
                snippetIds: collection.snippetIds.filter((id) => id !== snippetId)
              }
            },
            snippets: {
              ...state.snippets,
              [snippetId]: {
                ...state.snippets[snippetId],
                collectionId: undefined
              }
            }
          };
        });
      },
      
      generateShareUrl: async (snippetId) => {
        const snippet = get().snippets[snippetId];
        if (!snippet) throw new Error('Snippet not found');
        
        // Call API to create shared snippet
        const response = await fetch('/api/snippets/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: snippet.code,
            language: snippet.language,
            name: snippet.name
          })
        });
        
        if (!response.ok) throw new Error('Failed to share snippet');
        
        const data = await response.json();
        return `${window.location.origin}/snippets/${data.id}`;
      },
      
      exportSnippet: (snippetId) => {
        const snippet = get().snippets[snippetId];
        if (!snippet) return;
        
        const extensions: Record<string, string> = {
          python: 'py',
          javascript: 'js',
          typescript: 'ts',
          java: 'java',
          cpp: 'cpp',
          csharp: 'cs',
          go: 'go'
        };
        
        const extension = extensions[snippet.language] || 'txt';
        const filename = `${snippet.name.replace(/[^a-z0-9]/gi, '_')}.${extension}`;
        
        const blob = new Blob([snippet.code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      },
      
      clearConsole: () => {
        set({ consoleOutput: [] });
      },
      
      addConsoleMessage: (message) => {
        const newMessage: ConsoleMessage = {
          ...message,
          id: generateId(),
          timestamp: Date.now()
        };
        
        set((state) => ({
          consoleOutput: [...state.consoleOutput, newMessage]
        }));
      }
    }),
    {
      name: 'vibestudy-playground',
      partialize: (state) => ({
        snippets: state.snippets,
        collections: state.collections,
        activeSnippetId: state.activeSnippetId
      })
    }
  )
);
