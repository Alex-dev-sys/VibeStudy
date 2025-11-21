# Performance Optimization Guide

This directory contains performance optimization utilities for the VibeStudy platform.

## Overview

The performance optimization system includes:

1. **Code Splitting** - Dynamic imports for heavy components
2. **Caching** - Multi-layer caching for content and API responses
3. **Image Optimization** - Lazy loading and WebP/AVIF support
4. **Memoization** - React.memo for expensive components
5. **Animation Optimization** - GPU-accelerated CSS transforms
6. **Bundle Analysis** - Tools to monitor and optimize bundle size

## Usage

### 1. Lazy Loading Components

Use pre-configured lazy components from `lazy-components.ts`:

```typescript
import { LazyMonacoEditor, LazyDayTimeline } from '@/lib/performance/lazy-components';

// In your component
<LazyMonacoEditor
  language="javascript"
  value={code}
  onChange={handleChange}
/>
```

### 2. Caching

Use the cache manager for API responses and generated content:

```typescript
import { contentCache, cacheKeys } from '@/lib/performance/cache-manager';

// Set cache
contentCache.set(
  cacheKeys.content(languageId, day),
  taskSet,
  60 * 60 * 1000 // 1 hour TTL
);

// Get from cache
const cached = contentCache.get(cacheKeys.content(languageId, day));
```

### 3. Optimized Images

Use the OptimizedImage component for all images:

```typescript
import { OptimizedImage, LazyImage } from '@/lib/performance/image-optimizer';

// Above the fold - priority loading
<OptimizedImage
  src="/hero.png"
  alt="Hero"
  width={1200}
  height={600}
  priority
/>

// Below the fold - lazy loading
<LazyImage
  src="/feature.png"
  alt="Feature"
  width={800}
  height={400}
/>
```

### 4. Memoization

Use memoization utilities for expensive components:

```typescript
import { memoWithPrimitives, memoWithKeys } from '@/lib/performance/memoized-components';

// Memoize with primitive props
export const MemoizedButton = memoWithPrimitives(Button);

// Memoize with specific keys
export const MemoizedTaskList = memoWithKeys(TaskList, ['tasks', 'day']);
```

### 5. Animation Optimization

Use GPU-accelerated animations:

```typescript
import { getOptimizedVariants, transitions } from '@/lib/performance/animation-optimizer';

const variants = getOptimizedVariants();

<motion.div
  variants={variants.slideUp}
  transition={transitions.spring}
>
  Content
</motion.div>
```

### 6. Performance Monitoring

Monitor component performance in development:

```typescript
import { usePerformance, useRenderTime } from '@/hooks/usePerformance';

function MyComponent() {
  useRenderTime('MyComponent');
  
  // Component code
}
```

## Performance Targets

### Bundle Size
- **Target**: < 200KB gzipped for initial bundle
- **Current**: Check with `npm run build`

### Loading Performance
- **FCP (First Contentful Paint)**: < 1.5s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **TTI (Time to Interactive)**: < 3.5s

### Runtime Performance
- **Frame Rate**: 60 FPS (16ms per frame)
- **Memory Usage**: < 50MB for typical session

### Lighthouse Scores
- **Performance**: > 90 (desktop), > 80 (mobile)
- **Accessibility**: > 95
- **Best Practices**: > 95
- **SEO**: > 95

## Best Practices

### 1. Code Splitting

- Split routes using Next.js dynamic imports
- Lazy load below-the-fold components
- Separate heavy libraries (Monaco, Three.js)

### 2. Image Optimization

- Use WebP/AVIF formats
- Implement lazy loading for images
- Use appropriate sizes and quality settings
- Add blur placeholders for better UX

### 3. Caching Strategy

- Cache generated content (1 hour TTL)
- Cache API responses (5 minutes TTL)
- Cache user progress (10 minutes TTL)
- Implement cache invalidation on updates

### 4. Animation Performance

- Use CSS transforms (translate, scale, rotate)
- Avoid animating layout properties (width, height, top, left)
- Use `will-change` sparingly
- Respect `prefers-reduced-motion`

### 5. Component Optimization

- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Avoid inline function definitions in render
- Use useCallback and useMemo appropriately

### 6. Bundle Optimization

- Tree-shake unused code
- Use dynamic imports for large dependencies
- Implement route-based code splitting
- Analyze bundle with webpack-bundle-analyzer

## Monitoring

### Development

Run performance monitoring in development:

```typescript
import { initPerformanceMonitoring } from '@/lib/performance/bundle-analyzer';

// In _app.tsx or layout.tsx
if (process.env.NODE_ENV === 'development') {
  initPerformanceMonitoring();
}
```

### Production

Use Web Vitals API to track real user metrics:

```typescript
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);
  // Send to analytics
}
```

## Troubleshooting

### Slow Renders

If components are rendering slowly:

1. Check render time with `useRenderTime` hook
2. Identify expensive operations
3. Memoize heavy computations with `useMemo`
4. Memoize components with `React.memo`

### Large Bundle Size

If bundle size is too large:

1. Run `npm run build` to see bundle analysis
2. Identify large dependencies
3. Implement code splitting
4. Use dynamic imports for heavy components

### Memory Leaks

If memory usage is growing:

1. Check for unmounted component subscriptions
2. Clear intervals and timeouts in cleanup
3. Remove event listeners in cleanup
4. Use `useMemoryLeakDetection` hook

### Slow Animations

If animations are janky:

1. Use CSS transforms instead of layout properties
2. Enable GPU acceleration with `transform-gpu`
3. Reduce animation complexity
4. Check FPS with AnimationPerformanceMonitor

## Resources

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
