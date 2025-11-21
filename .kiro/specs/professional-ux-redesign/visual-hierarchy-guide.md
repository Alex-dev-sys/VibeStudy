# Visual Hierarchy Implementation Guide

## Overview

This document describes the visual hierarchy system implemented in task 5 of the professional UX redesign. The system ensures clear visual distinction between elements, reduces cognitive load, and improves overall user experience.

## Typography Scale

### Scale Ratio: 1.25 minimum

The typography scale uses a 1.25 minimum ratio between levels to ensure clear visual hierarchy:

```css
--font-size-caption: 0.75rem;      /* 12px */
--font-size-small: 0.875rem;       /* 14px */
--font-size-body: 1rem;            /* 16px */
--font-size-body-lg: 1.125rem;     /* 18px - 1.125x */
--font-size-h3: 1.25rem;           /* 20px - 1.25x */
--font-size-h2: 1.5rem;            /* 24px - 1.2x */
--font-size-h1: 2rem;              /* 32px - 1.33x */
--font-size-hero: 3rem;            /* 48px - 1.5x */
--font-size-hero-mobile: 2rem;     /* 32px */
```

### Usage Classes

```tsx
// Hero headings (landing pages)
<h1 className="text-hero">Main Headline</h1>

// Page titles
<h1 className="text-h1">Page Title</h1>

// Section headings
<h2 className="text-h2">Section Heading</h2>

// Subsection headings
<h3 className="text-h3">Subsection</h3>

// Large body text (introductions, important content)
<p className="text-body-lg">Important content</p>

// Small text (metadata, captions)
<span className="text-caption">Metadata</span>
```

## Button Hierarchy

### Primary CTAs: 2x Visual Weight

Primary buttons have significantly more visual weight than secondary actions:

**Primary Button:**
- Font weight: Bold (700)
- Shadow: Large and prominent (0_20px_45px)
- Hover: Scale up, larger shadow, translate up
- Size: Larger padding and minimum height

**Secondary Button:**
- Font weight: Medium (500)
- Shadow: Smaller (0_8px_20px)
- Hover: Subtle shadow increase
- Size: Standard padding

**Ghost Button:**
- Font weight: Normal (400)
- Shadow: None
- Hover: Minimal background
- Size: Minimal padding

### Usage

```tsx
// Primary action - most important
<Button variant="primary" size="lg">
  Start Learning
</Button>

// Secondary action - less important
<Button variant="secondary" size="md">
  Learn More
</Button>

// Tertiary action - minimal emphasis
<Button variant="ghost" size="md">
  Skip
</Button>
```

## Spacing System

### Minimum Section Spacing: 32px

Content sections are separated by at least 32px (2rem) to provide clear visual separation:

```css
--spacing-xs: 0.25rem;    /* 4px */
--spacing-sm: 0.5rem;     /* 8px */
--spacing-md: 1rem;       /* 16px */
--spacing-lg: 1.5rem;     /* 24px */
--spacing-xl: 2rem;       /* 32px - minimum section spacing */
--spacing-2xl: 3rem;      /* 48px */
--spacing-3xl: 4rem;      /* 64px */
```

### Tailwind Classes

```tsx
// Standard section spacing (32px)
<div className="space-y-section">
  <Section1 />
  <Section2 />
</div>

// Large section spacing (48px)
<div className="space-y-section-lg">
  <Section1 />
  <Section2 />
</div>

// Extra large section spacing (64px)
<div className="space-y-section-xl">
  <Section1 />
  <Section2 />
</div>
```

### Utility Classes

```tsx
// Apply section spacing as margin
<section className="section-spacing">
  Content
</section>

// Content spacing between child elements
<div className="content-spacing">
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
  <p>Paragraph 3</p>
</div>
```

## Z-Index Hierarchy

### Clear Layering System

```css
--z-base: 0;          /* Default content */
--z-content: 10;      /* Cards, panels */
--z-sticky: 20;       /* Sticky elements */
--z-navigation: 30;   /* Fixed navigation */
--z-dropdown: 40;     /* Dropdowns, menus */
--z-overlay: 50;      /* Modal backdrops */
--z-modal: 60;        /* Modal dialogs */
--z-toast: 70;        /* Notifications */
--z-tooltip: 80;      /* Contextual help */
```

### Usage

```tsx
// Navigation bar
<nav className="z-navigation">...</nav>

// Card component
<Card className="z-content">...</Card>

// Modal backdrop
<div className="z-overlay">...</div>

// Modal dialog
<div className="z-modal">...</div>

// Toast notification
<div className="z-toast">...</div>
```

## Accent Color Usage

### Limit to <10% of Screen Area

Accent colors (#ff0094, #ffd200) should be used sparingly for maximum impact:

**Appropriate Uses:**
- Primary CTAs and action buttons
- Active navigation items
- Critical alerts and notifications
- Progress indicators
- Achievement badges
- Streak indicators

**Avoid:**
- Large background areas
- Body text
- Decorative elements
- Multiple competing accents on same screen

### Example

```tsx
// Good: Accent on primary CTA only
<section>
  <h2>Section Title</h2>
  <p>Description text</p>
  <Button variant="primary">Take Action</Button>
  <Button variant="ghost">Learn More</Button>
</section>

// Bad: Too many accent colors
<section className="bg-accent">
  <h2 className="text-accent">Section Title</h2>
  <p className="text-accent">Description text</p>
  <Button variant="primary">Take Action</Button>
  <Button variant="primary">Learn More</Button>
</section>
```

## Component Updates

### Updated Components

The following components have been updated to use the new visual hierarchy:

1. **Button** (`src/components/ui/Button.tsx`)
   - Enhanced primary button visual weight
   - Improved size variants with minimum heights
   - Better disabled states

2. **Card** (`src/components/ui/Card.tsx`)
   - Applied z-content for proper layering
   - Updated CardTitle to use text-h3
   - Increased CardHeader spacing

3. **Modal** (`src/components/ui/Modal.tsx`)
   - Applied z-modal and z-overlay
   - Updated title to use text-h2

4. **Navigation** (`src/components/layout/Navigation.tsx`)
   - Applied z-navigation for proper layering

5. **HeroSection** (`src/components/landing/HeroSection.tsx`)
   - Updated to use text-hero class
   - Applied proper spacing between elements

6. **EmptyState** (`src/components/dashboard/EmptyState.tsx`)
   - Applied section spacing
   - Updated typography classes

7. **ContentState** (`src/components/dashboard/ContentState.tsx`)
   - Applied gap-section for proper spacing

## Best Practices

### Typography

1. Use semantic HTML headings (h1, h2, h3) with corresponding classes
2. Maintain consistent line heights for readability
3. Limit heading levels to 3-4 per page
4. Use text-body-lg for important introductory content

### Spacing

1. Always use minimum 32px between major sections
2. Use consistent spacing within components
3. Increase spacing for emphasis
4. Reduce spacing for related content

### Buttons

1. One primary CTA per screen section
2. Secondary actions should be visually subordinate
3. Ghost buttons for tertiary actions
4. Maintain minimum touch target size (44px)

### Z-Index

1. Use predefined z-index values only
2. Never use arbitrary z-index numbers
3. Follow the hierarchy: content < navigation < overlay < modal
4. Test layering with multiple overlapping elements

### Accent Colors

1. Limit to primary actions and critical information
2. Use sparingly for maximum impact
3. Ensure sufficient contrast with background
4. Test with colorblind simulation tools

## Testing Checklist

- [ ] Typography scale maintains 1.25 minimum ratio
- [ ] Primary buttons are 2x more prominent than secondary
- [ ] Sections have minimum 32px spacing
- [ ] Z-index hierarchy is correct (modals above navigation)
- [ ] Accent colors used in <10% of screen area
- [ ] Mobile responsive (typography scales down)
- [ ] Keyboard navigation works with focus indicators
- [ ] Screen reader announces hierarchy correctly
- [ ] Reduced motion preferences respected

## Migration Guide

### Updating Existing Components

1. Replace arbitrary font sizes with typography classes:
   ```tsx
   // Before
   <h1 className="text-4xl font-bold">Title</h1>
   
   // After
   <h1 className="text-h1">Title</h1>
   ```

2. Replace arbitrary spacing with section spacing:
   ```tsx
   // Before
   <div className="space-y-8">
   
   // After
   <div className="space-y-section">
   ```

3. Replace arbitrary z-index with hierarchy values:
   ```tsx
   // Before
   <nav className="z-50">
   
   // After
   <nav className="z-navigation">
   ```

4. Update button variants for proper hierarchy:
   ```tsx
   // Before
   <Button className="bg-primary">Action</Button>
   
   // After
   <Button variant="primary" size="lg">Action</Button>
   ```
