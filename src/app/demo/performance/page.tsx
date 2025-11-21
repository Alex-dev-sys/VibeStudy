'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { OptimizedImage, LazyImage } from '@/lib/performance/image-optimizer';
import { contentCache, progressCache, apiCache, cacheKeys } from '@/lib/performance/cache-manager';
import { usePerformance, useRenderTime } from '@/hooks/usePerformance';
import { getOptimizedVariants, transitions } from '@/lib/performance/animation-optimizer';
import { motion } from 'framer-motion';
import { 
  LazyLevelProgressBar, 
  LazyDayCompletionModal,
  LazyConfetti 
} from '@/lib/performance/lazy-components';

export default function PerformanceDemo() {
  useRenderTime('PerformanceDemo');
  
  const [showLazyComponents, setShowLazyComponents] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    content: contentCache.getStats(),
    progress: progressCache.getStats(),
    api: apiCache.getStats(),
  });

  const variants = getOptimizedVariants();

  useEffect(() => {
    // Update cache stats every second
    const interval = setInterval(() => {
      setCacheStats({
        content: contentCache.getStats(),
        progress: progressCache.getStats(),
        api: apiCache.getStats(),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCacheTest = () => {
    // Test caching
    const testData = {
      theory: 'Test theory content',
      tasks: [{ id: '1', prompt: 'Test task' }],
    };

    contentCache.set(cacheKeys.content('python', 1), testData);
    
    const retrieved = contentCache.get(cacheKeys.content('python', 1));
    alert(retrieved ? 'Cache working! ✅' : 'Cache failed ❌');
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      
      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-10">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Performance Optimizations Demo
          </h1>
          <p className="max-w-2xl text-sm text-white/70 sm:text-base">
            Demonstration of all performance optimization features
          </p>
        </div>

        {/* Cache Statistics */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Cache Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5">
              <h3 className="text-sm text-white/60 mb-2">Content Cache</h3>
              <div className="space-y-1 text-sm">
                <p>Entries: {cacheStats.content.entries}</p>
                <p>Size: {(cacheStats.content.size / 1024).toFixed(2)} KB</p>
                <p>Utilization: {cacheStats.content.utilization.toFixed(1)}%</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <h3 className="text-sm text-white/60 mb-2">Progress Cache</h3>
              <div className="space-y-1 text-sm">
                <p>Entries: {cacheStats.progress.entries}</p>
                <p>Size: {(cacheStats.progress.size / 1024).toFixed(2)} KB</p>
                <p>Utilization: {cacheStats.progress.utilization.toFixed(1)}%</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <h3 className="text-sm text-white/60 mb-2">API Cache</h3>
              <div className="space-y-1 text-sm">
                <p>Entries: {cacheStats.api.entries}</p>
                <p>Size: {(cacheStats.api.size / 1024).toFixed(2)} KB</p>
                <p>Utilization: {cacheStats.api.utilization.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <Button onClick={handleCacheTest}>Test Cache</Button>
        </Card>

        {/* Skeleton Loading States */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Skeleton Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm text-white/60 mb-2">Text Skeleton</h3>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div>
              <h3 className="text-sm text-white/60 mb-2">Card Skeleton</h3>
              <SkeletonCard />
            </div>
          </div>
        </Card>

        {/* Optimized Images */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Optimized Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm text-white/60 mb-2">Priority Image (Above Fold)</h3>
              <OptimizedImage
                src="https://via.placeholder.com/400x300"
                alt="Priority"
                width={400}
                height={300}
                priority
                className="rounded-xl"
              />
            </div>
            <div>
              <h3 className="text-sm text-white/60 mb-2">Lazy Image (Below Fold)</h3>
              <LazyImage
                src="https://via.placeholder.com/400x300"
                alt="Lazy"
                width={400}
                height={300}
                className="rounded-xl"
              />
            </div>
          </div>
        </Card>

        {/* GPU-Accelerated Animations */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">GPU-Accelerated Animations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              variants={variants.fade}
              initial="initial"
              animate="animate"
              transition={transitions.default}
              className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-center"
            >
              Fade
            </motion.div>
            <motion.div
              variants={variants.slideUp}
              initial="initial"
              animate="animate"
              transition={transitions.spring}
              className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-center"
            >
              Slide Up
            </motion.div>
            <motion.div
              variants={variants.scale}
              initial="initial"
              animate="animate"
              transition={transitions.bouncySpring}
              className="p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 text-center"
            >
              Scale
            </motion.div>
            <motion.div
              variants={variants.rotate}
              initial="initial"
              animate="animate"
              transition={transitions.smooth}
              className="p-4 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-center"
            >
              Rotate
            </motion.div>
          </div>
        </Card>

        {/* Lazy Loaded Components */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Lazy Loaded Components</h2>
          <p className="text-sm text-white/60">
            Heavy components are loaded only when needed
          </p>
          <Button onClick={() => setShowLazyComponents(!showLazyComponents)}>
            {showLazyComponents ? 'Hide' : 'Show'} Lazy Components
          </Button>
          {showLazyComponents && (
            <div className="space-y-4 mt-4">
              <LazyLevelProgressBar />
            </div>
          )}
        </Card>

        {/* Confetti Animation */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Confetti Animation (Lazy Loaded)</h2>
          <Button onClick={() => setShowConfetti(true)}>
            🎉 Trigger Confetti
          </Button>
          {showConfetti && (
            <LazyConfetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={200}
              onConfettiComplete={() => setShowConfetti(false)}
            />
          )}
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Performance Metrics</h2>
          <div className="space-y-2 text-sm">
            <p>✅ Code splitting enabled</p>
            <p>✅ Lazy loading for heavy components</p>
            <p>✅ Image optimization with WebP/AVIF</p>
            <p>✅ Multi-layer caching system</p>
            <p>✅ GPU-accelerated animations</p>
            <p>✅ React.memo for expensive components</p>
            <p>✅ Bundle size optimization</p>
          </div>
        </Card>
      </div>
    </main>
  );
}
