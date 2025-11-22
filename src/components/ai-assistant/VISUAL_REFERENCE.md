# Visual Reference - AI Assistant Paywall Components

This document provides a visual reference for the three paywall/upgrade components.

## 1. PaywallModal

**When shown**: Free users attempt to access AI assistant

**Visual Structure**:
```
┌─────────────────────────────────────────┐
│                                    [×]  │
│         ┌─────────────┐                 │
│         │   ✨ Icon   │                 │
│         └─────────────┘                 │
│                                         │
│   AI Ассистент доступен в Premium      │
│   Разблокируй безлимитный доступ       │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ⚡ Безлимитные запросы            │ │
│  │   Задавай вопросы без ограничений │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ✨ Лучшие AI модели               │ │
│  │   GPT-4o и Claude 3.5 Sonnet      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 👑 Персональная помощь            │ │
│  │   Индивидуальные рекомендации     │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Бесплатный план: 5 запросов в день│ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │    Перейти на Premium    [gradient]│ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Key Features**:
- Sparkles icon in gradient circle
- Three feature cards with icons
- Free tier info box
- Prominent CTA button with gradient

**Colors**:
- Background: `#1a1a1a`
- Cards: `#2a2a2a`
- Gradient: `#ff4bc1` → `#ffd34f`
- Icons: Accent colors

---

## 2. UpgradePrompt

**When shown**: Users with expired subscriptions

**Visual Structure**:
```
┌─────────────────────────────────────────┐
│                                    [×]  │
│         ┌─────────────┐                 │
│         │   ⚠️ Icon   │                 │
│         └─────────────┘                 │
│                                         │
│         Подписка истекла                │
│   Продли подписку, чтобы продолжить    │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🕐 Истекла: 15 января 2024        │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ЧТО ВЫ ПОЛУЧИТЕ:                      │
│  ✨ Безлимитные AI-запросы             │
│  ✨ Доступ к лучшим моделям            │
│  ✨ Персональные рекомендации          │
│  ✨ Приоритетная поддержка             │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Ваш прогресс и достижения сохранены│ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Продлить подписку    [gradient] │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Key Features**:
- Alert icon in orange circle
- Expiration date with clock icon
- Bullet list of benefits
- Reassurance message
- Prominent CTA button

**Colors**:
- Background: `#1a1a1a`
- Alert icon: Orange (`#f97316`)
- Expiration box: Orange tint
- Benefits: Sparkles icons in accent color

---

## 3. LimitReachedNotification

**When shown**: User reaches daily request limit

**Visual Structure**:
```
┌─────────────────────────────────────────┐
│                                    [×]  │
│         ┌─────────────┐                 │
│         │   ⚠️ Icon   │                 │
│         └─────────────┘                 │
│                                         │
│      Лимит запросов исчерпан           │
│   Вы использовали все доступные        │
│         запросы на сегодня             │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Использовано            5/5       │ │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%        │ │
│  │ Лимит обновится завтра            │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📈 Хотите больше?                 │ │
│  │ Обновитесь до Premium для         │ │
│  │ безлимитного доступа              │ │
│  │                                   │ │
│  │ • Безлимитные AI-запросы          │ │
│  │ • Продвинутые AI модели           │ │
│  │ • Приоритетная генерация          │ │
│  │                                   │ │
│  │ ┌─────────────────────────────┐   │ │
│  │ │ Перейти на Premium [gradient]│   │ │
│  │ └─────────────────────────────┘   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │          Понятно                  │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Key Features**:
- Warning icon in yellow circle
- Usage progress bar (animated)
- Reset time information
- Upgrade section with benefits
- Two buttons: Upgrade (gradient) and Close (gray)

**Colors**:
- Background: `#1a1a1a`
- Warning icon: Yellow (`#eab308`)
- Progress bar: Gradient fill
- Upgrade box: Gradient tint with border

---

## Responsive Behavior

All components are responsive:

### Desktop (>768px)
- Max width: 28rem (448px)
- Centered on screen
- Full padding and spacing

### Mobile (<768px)
- Full width with margin
- Adjusted padding
- Touch-friendly buttons (min 44px height)
- Optimized text sizes

---

## Animations

All components include smooth animations:

1. **Mount Animation**: Fade-in with scale
   ```css
   animate-fade-in
   ```

2. **Button Hover**: Opacity change
   ```css
   hover:opacity-90
   ```

3. **Progress Bar**: Smooth width transition
   ```css
   transition-all duration-300
   ```

4. **Close Button**: Background color transition
   ```css
   transition-colors
   ```

---

## Accessibility Features

All components include:

- ✅ **ARIA Labels**: All interactive elements labeled
- ✅ **Keyboard Navigation**: ESC to close, Tab to navigate
- ✅ **Focus Management**: Proper focus indicators
- ✅ **Screen Reader**: Semantic HTML and descriptive text
- ✅ **Click Outside**: Close on backdrop click
- ✅ **Color Contrast**: WCAG AA compliant

---

## Common Patterns

All three components share:

1. **Modal Structure**:
   - Fixed overlay with backdrop blur
   - Centered modal with rounded corners
   - Close button in top-right
   - Gradient CTA button

2. **Icon Usage**:
   - Large icon in colored circle at top
   - Smaller icons for features/benefits
   - Consistent icon sizing

3. **Typography**:
   - Large bold title (text-2xl)
   - Gray subtitle (text-gray-400)
   - White body text
   - Small gray helper text

4. **Spacing**:
   - Consistent padding (p-4, p-6)
   - Vertical spacing (space-y-4, space-y-6)
   - Gap between elements (gap-2, gap-3)

---

## Testing Checklist

When testing these components:

- [ ] Modal opens smoothly
- [ ] Modal closes on X button click
- [ ] Modal closes on ESC key
- [ ] Modal closes on backdrop click
- [ ] Link to pricing page works
- [ ] Text is readable in both languages
- [ ] Icons display correctly
- [ ] Gradients render properly
- [ ] Progress bar animates (LimitReached)
- [ ] Date formats correctly (UpgradePrompt)
- [ ] Responsive on mobile
- [ ] Touch targets are adequate (44px min)
- [ ] Keyboard navigation works
- [ ] Screen reader announces content

---

## Demo Page

Visit `/demo/ai-assistant-paywall` to see all components in action with:
- Language switcher (Russian/English)
- Individual trigger buttons
- Live preview of all states
- Implementation notes
