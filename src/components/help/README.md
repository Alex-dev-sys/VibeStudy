# Contextual Help System

A comprehensive help system providing multiple layers of assistance to users throughout the platform.

## Components

### HelpTooltip

Inline help icons that display tooltips on hover/focus.

```tsx
import { HelpTooltip } from '@/components/help/HelpTooltip';

<HelpTooltip 
  content="Your explanation here"
  side="top" // top | bottom | left | right
/>
```

**When to use:**
- Next to complex terminology
- Beside form fields that need explanation
- Near statistics or metrics
- Anywhere users might need quick clarification

**Best practices:**
- Keep content to 2-3 sentences max
- Use plain language
- Focus on "what" and "why", not "how"
- Position tooltip to avoid covering important content

### FloatingHelpButton

Context-aware floating button that appears on app pages.

**Automatic behavior:**
- Shows on `/learn`, `/playground`, `/analytics`, `/profile`
- Hidden on landing page and public pages
- Displays different FAQ items based on current page
- Tracks clicks and topic views

**No manual integration needed** - automatically added to layout.

### Help Page (`/help`)

Full-featured help center with:
- Search functionality
- Category filtering
- Expandable FAQ items
- Topic tracking
- Links to additional resources

**Link to help page:**
```tsx
<Link href="/help">Help Center</Link>
```

## Help Store

Tracks help usage for analytics.

```tsx
import { useHelpStore } from '@/store/help-store';

const { 
  trackTopicAccess,
  trackHelpButtonClick,
  getMostAccessedTopics,
  getTopicAccessCount 
} = useHelpStore();

// Track when user views a help topic
trackTopicAccess('topic-id');

// Get analytics
const topTopics = getMostAccessedTopics(5);
const count = getTopicAccessCount('topic-id');
```

## Adding New Help Content

### 1. Add to FloatingHelpButton

Edit `src/components/help/FloatingHelpButton.tsx`:

```tsx
if (pathname?.startsWith('/your-page')) {
  return {
    title: 'Your Page Help',
    items: [
      {
        q: 'Question?',
        a: 'Answer with helpful information.',
      },
      // ... more items
    ],
  };
}
```

### 2. Add to Help Page

Edit `src/app/help/page.tsx`:

```tsx
const faqItems: FAQItem[] = [
  // ... existing items
  {
    id: 'unique-id',
    category: 'Category Name',
    question: 'Your question?',
    answer: 'Detailed answer with helpful information.',
    icon: IconComponent,
  },
];
```

### 3. Add Translations

Edit `src/lib/i18n/locales/ru.ts`:

```typescript
help: {
  // ... existing translations
  yourNewSection: {
    title: 'Title',
    description: 'Description'
  }
}
```

## Design Guidelines

### Tooltip Content
- **Length:** 1-3 sentences
- **Tone:** Friendly and conversational
- **Language:** Simple, avoid jargon
- **Focus:** What it is and why it matters

### FAQ Items
- **Question:** Clear, specific, user-focused
- **Answer:** Comprehensive but concise
- **Structure:** Problem → Solution → Benefit
- **Examples:** Include when helpful

### Icons
- Use consistent icon set (Lucide React)
- Match icon to content category
- Keep size consistent (w-5 h-5 for tooltips)

## Accessibility

All help components follow accessibility best practices:

- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ ARIA labels
- ✅ Screen reader support
- ✅ Semantic HTML

## Analytics

Help usage is tracked automatically:

- **Topic views:** Every time a help topic is accessed
- **Button clicks:** Per-page tracking of help button usage
- **Search queries:** (Future enhancement)
- **Most accessed:** Available in settings

Use analytics to:
- Identify confusing features
- Improve UX based on help usage
- Prioritize documentation efforts
- Measure help effectiveness

## Examples

### Example 1: Form Field Help

```tsx
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <label>Language</label>
    <HelpTooltip 
      content="Choose the programming language you want to learn. You can switch anytime."
      side="right"
    />
  </div>
  <select>...</select>
</div>
```

### Example 2: Stat Card Help

```tsx
<div className="stat-card">
  <div className="flex items-center gap-2">
    <span>Streak</span>
    <HelpTooltip 
      content="Days in a row you've completed at least one task. Keep it going!"
      side="top"
    />
  </div>
  <div className="value">7 days</div>
</div>
```

### Example 3: Custom Help Tracking

```tsx
function MyFeature() {
  const { trackTopicAccess } = useHelpStore();
  
  const showCustomHelp = () => {
    trackTopicAccess('my-feature-help');
    // Show your custom help UI
  };
  
  return (
    <button onClick={showCustomHelp}>
      Need help?
    </button>
  );
}
```

## Testing

### Manual Testing Checklist

- [ ] HelpTooltip appears on hover
- [ ] HelpTooltip appears on focus (keyboard)
- [ ] HelpTooltip dismisses on blur
- [ ] FloatingHelpButton shows on app pages
- [ ] FloatingHelpButton hidden on landing
- [ ] Context changes per page
- [ ] Help page search works
- [ ] Help page filters work
- [ ] FAQ items expand/collapse
- [ ] Settings integration works
- [ ] Replay tutorial resets onboarding
- [ ] Help statistics show data

### Accessibility Testing

- [ ] Tab navigation works
- [ ] Focus indicators visible
- [ ] Screen reader announces content
- [ ] ARIA labels present
- [ ] Keyboard shortcuts work

## Demo

Visit `/demo/help` to see all help components in action with examples and documentation.

## Future Enhancements

- [ ] Video tutorials
- [ ] Interactive walkthroughs
- [ ] Search suggestions
- [ ] Help recommendations based on behavior
- [ ] Multi-language support
- [ ] Help content versioning
- [ ] User feedback on help articles
- [ ] AI-powered help search

## Support

For questions about the help system:
1. Check this README
2. Visit `/demo/help` for examples
3. Review implementation summary in `.kiro/specs/professional-ux-redesign/task-8-implementation-summary.md`
