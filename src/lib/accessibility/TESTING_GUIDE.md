# Accessibility Testing Guide

## Overview

This guide provides comprehensive instructions for testing accessibility compliance across the VibeStudy platform.

## Automated Testing

### Tools

1. **axe DevTools** (Browser Extension)
   - Install: [Chrome](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd) | [Firefox](https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/)
   - Run on each page
   - Fix all critical and serious issues

2. **WAVE** (Browser Extension)
   - Install: [Chrome](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh) | [Firefox](https://addons.mozilla.org/en-US/firefox/addon/wave-accessibility-tool/)
   - Check for errors and alerts
   - Review contrast issues

3. **Lighthouse** (Built into Chrome DevTools)
   - Open DevTools → Lighthouse tab
   - Run accessibility audit
   - Target score: 95+

### Running Tests

```bash
# Install testing dependencies
npm install --save-dev @axe-core/playwright

# Run accessibility tests
npm run test:a11y
```

## Manual Testing

### Keyboard Navigation

Test all functionality using only keyboard:

#### Essential Keys
- **Tab**: Move forward through interactive elements
- **Shift + Tab**: Move backward
- **Enter**: Activate buttons and links
- **Space**: Toggle checkboxes, activate buttons
- **Escape**: Close modals and dialogs
- **Arrow Keys**: Navigate within components (lists, menus)

#### Test Checklist

- [ ] All interactive elements are reachable via Tab
- [ ] Focus order is logical and follows visual layout
- [ ] Focus indicator is clearly visible (2px outline)
- [ ] No keyboard traps (can always Tab out)
- [ ] Skip links work (Tab from page load)
- [ ] Modals trap focus correctly
- [ ] Escape closes modals and dropdowns
- [ ] Enter/Space activates buttons
- [ ] Arrow keys work in lists and menus

### Screen Reader Testing

#### Windows - NVDA (Free)

1. Download: https://www.nvaccess.org/download/
2. Install and launch NVDA
3. Navigate with:
   - **NVDA + Down Arrow**: Read next item
   - **NVDA + Up Arrow**: Read previous item
   - **Insert + F7**: List all headings
   - **Insert + F5**: List all form fields
   - **Insert + F6**: List all links

#### Windows - JAWS (Commercial)

1. Download trial: https://www.freedomscientific.com/downloads/jaws/
2. Navigate with:
   - **Down Arrow**: Read next item
   - **Up Arrow**: Read previous item
   - **Insert + F6**: List headings
   - **Insert + F5**: List form fields

#### macOS - VoiceOver (Built-in)

1. Enable: System Preferences → Accessibility → VoiceOver
2. Shortcut: **Cmd + F5**
3. Navigate with:
   - **VO + Right Arrow**: Next item (VO = Ctrl + Option)
   - **VO + Left Arrow**: Previous item
   - **VO + U**: Open rotor (lists)
   - **VO + A**: Read all

#### Test Checklist

- [ ] All images have alt text
- [ ] Headings are properly structured (h1 → h2 → h3)
- [ ] Form inputs have associated labels
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Success messages are announced
- [ ] Modal opening/closing is announced
- [ ] Dynamic content updates are announced
- [ ] Buttons have descriptive labels
- [ ] Links have meaningful text (not "click here")

### Visual Testing

#### Color Contrast

Use browser DevTools or online tools:

1. **Chrome DevTools**
   - Inspect element
   - Check "Accessibility" panel
   - View contrast ratio

2. **Online Tool**: https://webaim.org/resources/contrastchecker/

**Requirements:**
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

#### Zoom Testing

Test at different zoom levels:

- [ ] 100% (default)
- [ ] 150%
- [ ] 200% (WCAG requirement)
- [ ] 400% (extreme case)

**Check:**
- No horizontal scrolling
- Text doesn't overlap
- All content remains accessible
- Touch targets remain 44x44px minimum

#### High Contrast Mode

**Windows:**
1. Settings → Ease of Access → High Contrast
2. Enable high contrast theme
3. Test all pages

**Check:**
- All text is readable
- Borders are visible
- Focus indicators are clear
- Icons are distinguishable

### Motion Testing

#### Reduced Motion

**Enable:**
- **Windows**: Settings → Ease of Access → Display → Show animations
- **macOS**: System Preferences → Accessibility → Display → Reduce motion
- **Browser**: DevTools → Rendering → Emulate CSS media feature prefers-reduced-motion

**Check:**
- [ ] Animations are disabled or minimal
- [ ] Transitions are instant or very short
- [ ] No parallax effects
- [ ] Auto-playing content stops
- [ ] Functionality remains intact

### Touch Target Testing

**Requirements:**
- Minimum size: 44x44px
- Minimum spacing: 8px between targets

**Test on:**
- Mobile devices (actual hardware)
- Chrome DevTools device emulation
- Various screen sizes (320px - 428px width)

**Check:**
- [ ] All buttons meet minimum size
- [ ] Links are easy to tap
- [ ] Form inputs are large enough
- [ ] No accidental taps on adjacent elements

## Page-Specific Tests

### Landing Page

- [ ] Hero section has proper heading hierarchy
- [ ] CTA buttons have descriptive labels
- [ ] Images have alt text
- [ ] Skip link works
- [ ] Keyboard navigation flows logically

### Learning Interface

- [ ] Day cards are keyboard accessible
- [ ] Task list is navigable with arrows
- [ ] Code editor is keyboard accessible
- [ ] "Start Day" button is clearly labeled
- [ ] Progress indicators have ARIA labels
- [ ] Empty states have descriptive text

### Forms (Login, Profile)

- [ ] All inputs have labels
- [ ] Required fields are marked
- [ ] Error messages are associated with inputs
- [ ] Errors are announced to screen readers
- [ ] Success messages are announced
- [ ] Form can be submitted with Enter key

### Modals

- [ ] Focus moves to modal on open
- [ ] Focus is trapped within modal
- [ ] Escape closes modal
- [ ] Focus returns to trigger on close
- [ ] Modal has role="dialog"
- [ ] Modal has aria-modal="true"
- [ ] Modal has aria-labelledby or aria-label

### Navigation

- [ ] All nav items are keyboard accessible
- [ ] Current page is indicated (aria-current)
- [ ] Mobile menu is keyboard accessible
- [ ] Menu can be closed with Escape
- [ ] Skip links bypass navigation

## Common Issues and Fixes

### Issue: Missing Alt Text

**Problem:** Images without alt attributes
**Fix:**
```tsx
<img src="..." alt="Descriptive text" />
// For decorative images:
<img src="..." alt="" role="presentation" />
```

### Issue: Missing Form Labels

**Problem:** Inputs without associated labels
**Fix:**
```tsx
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Issue: Poor Color Contrast

**Problem:** Text doesn't meet 4.5:1 ratio
**Fix:**
```css
/* Before: rgba(255, 255, 255, 0.4) on dark bg */
color: rgba(255, 255, 255, 0.4); /* 2.1:1 - FAIL */

/* After: */
color: rgba(255, 255, 255, 0.7); /* 4.8:1 - PASS */
```

### Issue: Keyboard Trap

**Problem:** Can't Tab out of component
**Fix:**
```tsx
// Implement focus trap for modals only
const modalRef = useFocusTrap(isOpen);
```

### Issue: Missing ARIA Labels

**Problem:** Icon buttons without text
**Fix:**
```tsx
<button aria-label="Close dialog">
  <X />
</button>
```

### Issue: No Focus Indicator

**Problem:** Can't see which element has focus
**Fix:**
```css
*:focus-visible {
  outline: 2px solid #ff0094;
  outline-offset: 2px;
}
```

## Compliance Checklist

### WCAG 2.1 Level AA

#### Perceivable

- [ ] 1.1.1 Non-text Content (A)
- [ ] 1.3.1 Info and Relationships (A)
- [ ] 1.3.2 Meaningful Sequence (A)
- [ ] 1.3.3 Sensory Characteristics (A)
- [ ] 1.4.1 Use of Color (A)
- [ ] 1.4.3 Contrast (Minimum) (AA)
- [ ] 1.4.4 Resize Text (AA)
- [ ] 1.4.5 Images of Text (AA)
- [ ] 1.4.10 Reflow (AA)
- [ ] 1.4.11 Non-text Contrast (AA)
- [ ] 1.4.12 Text Spacing (AA)
- [ ] 1.4.13 Content on Hover or Focus (AA)

#### Operable

- [ ] 2.1.1 Keyboard (A)
- [ ] 2.1.2 No Keyboard Trap (A)
- [ ] 2.1.4 Character Key Shortcuts (A)
- [ ] 2.4.1 Bypass Blocks (A)
- [ ] 2.4.2 Page Titled (A)
- [ ] 2.4.3 Focus Order (A)
- [ ] 2.4.4 Link Purpose (In Context) (A)
- [ ] 2.4.5 Multiple Ways (AA)
- [ ] 2.4.6 Headings and Labels (AA)
- [ ] 2.4.7 Focus Visible (AA)
- [ ] 2.5.1 Pointer Gestures (A)
- [ ] 2.5.2 Pointer Cancellation (A)
- [ ] 2.5.3 Label in Name (A)
- [ ] 2.5.4 Motion Actuation (A)

#### Understandable

- [ ] 3.1.1 Language of Page (A)
- [ ] 3.1.2 Language of Parts (AA)
- [ ] 3.2.1 On Focus (A)
- [ ] 3.2.2 On Input (A)
- [ ] 3.2.3 Consistent Navigation (AA)
- [ ] 3.2.4 Consistent Identification (AA)
- [ ] 3.3.1 Error Identification (A)
- [ ] 3.3.2 Labels or Instructions (A)
- [ ] 3.3.3 Error Suggestion (AA)
- [ ] 3.3.4 Error Prevention (Legal, Financial, Data) (AA)

#### Robust

- [ ] 4.1.1 Parsing (A)
- [ ] 4.1.2 Name, Role, Value (A)
- [ ] 4.1.3 Status Messages (AA)

## Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Testing Services
- [WebAIM](https://webaim.org/)
- [Deque University](https://dequeuniversity.com/)
- [Level Access](https://www.levelaccess.com/)
