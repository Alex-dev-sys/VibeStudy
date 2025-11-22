# AI Assistant Components

This directory contains components for the AI Learning Assistant feature.

## Components

### ChatInterface

The main chat interface component that provides the UI for interacting with the AI assistant.

**Features:**
- Message history display
- User and assistant message bubbles
- Typing indicators
- Input field with send button
- Minimize/maximize functionality
- Auto-scroll to latest message
- Support for code blocks, suggestions, and related topics

**Usage:**
```tsx
import { ChatInterface } from '@/components/ai-assistant';

<ChatInterface
  isOpen={true}
  onClose={() => {}}
  userTier="premium"
  locale="ru"
/>
```

### QuickActions

A component that provides contextual quick action buttons for common AI assistant requests.

**Features:**
- Four contextual action buttons: Explain concept, Help with code, Give hint, Study advice
- Context-aware templates based on current day, language, and progress
- Adapts button labels and templates based on user's code and completed tasks
- Gradient button styling matching VibeStudy theme
- Bilingual support (Russian and English)
- Hover animations and visual feedback

**Usage:**
```tsx
import { QuickActions } from '@/components/ai-assistant';

<QuickActions
  onActionClick={(template) => console.log(template)}
  locale="ru"
/>
```

**Props:**
- `onActionClick` (function): Callback function that receives the template string when a button is clicked
- `locale` ('ru' | 'en', optional): The locale for UI text (default: 'ru')

**Contextual Behavior:**
- **Explain concept**: Always references the current day and programming language
- **Help with code**: Changes label and template based on whether user has written code
- **Give hint**: Adapts based on number of completed tasks
- **Study advice**: Provides context about current day progress

### CodeBlock

A component for rendering code blocks with syntax highlighting and copy-to-clipboard functionality.

**Features:**
- Syntax highlighting using Prism.js
- Support for 7 programming languages (Python, JavaScript, TypeScript, Java, C++, C#, Go)
- Language badge with color coding
- Copy-to-clipboard button with toast notification
- Dark theme styling
- Responsive design

**Supported Languages:**
- Python (`python`)
- JavaScript (`javascript`, `js`)
- TypeScript (`typescript`, `ts`)
- Java (`java`)
- C++ (`cpp`, `c++`)
- C# (`csharp`, `c#`)
- Go (`go`)

**Usage:**
```tsx
import { CodeBlock } from '@/components/ai-assistant';

<CodeBlock
  code="print('Hello, World!')"
  language="python"
  locale="ru"
/>
```

**Props:**
- `code` (string): The code to display
- `language` (string): The programming language identifier
- `locale` ('ru' | 'en', optional): The locale for UI text (default: 'ru')

**Styling:**
- Dark background: `#1e1e1e`
- Header background: `#2a2a2a`
- Language-specific badge colors matching the platform's language colors
- Prism Tomorrow theme for syntax highlighting

## Integration

The CodeBlock component is automatically integrated into the ChatInterface component. When a message contains code blocks in its metadata, they are rendered using the CodeBlock component.

**Message Structure:**
```typescript
interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    codeBlocks?: CodeBlock[];
    suggestions?: string[];
    relatedTopics?: string[];
  };
}
```

## Testing

Unit tests are available in `tests/unit/ai-assistant-codeblock.test.tsx`.

Run tests with:
```bash
npm run test:unit -- tests/unit/ai-assistant-codeblock.test.tsx --run
```

## Dependencies

- `prismjs`: Syntax highlighting library
- `@types/prismjs`: TypeScript types for Prism.js
- `lucide-react`: Icons (Copy, Check)
- `sonner`: Toast notifications (via `@/lib/toast`)

## Notes

- The component gracefully handles missing Prism.js in test environments
- Language identifiers are normalized (e.g., `js` → `javascript`, `c++` → `cpp`)
- Copy functionality uses the Clipboard API with fallback error handling
- The component is fully responsive and works on mobile devices
