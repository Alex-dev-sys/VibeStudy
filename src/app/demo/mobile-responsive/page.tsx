'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FloatingActionButton, MiniFAB } from '@/components/ui/FloatingActionButton';
import { Plus, Settings, Share2, Heart, MessageCircle } from 'lucide-react';
import { useMobileResponsive, useBreakpoint, useSafeAreaInsets } from '@/hooks/useMobileResponsive';
import { Badge } from '@/components/ui/badge';

export default function MobileResponsiveDemoPage() {
  const mobile = useMobileResponsive();
  const breakpoint = useBreakpoint();
  const safeInsets = useSafeAreaInsets();
  const [fabExtended, setFabExtended] = useState(false);
  
  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-sticky bg-[#0c061c]/80 backdrop-blur-xl border-b border-white/10 safe-area-inset-top">
        <div className="responsive-container py-4">
          <h1 className="text-responsive-2xl font-bold">Mobile Responsive Demo</h1>
          <p className="text-sm text-white/60 mt-1">Testing mobile-first responsive design</p>
        </div>
      </div>
      
      <div className="responsive-container py-6 space-y-6">
        {/* Device Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>Current device and viewport details</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-white/60">Device Type:</span>
                <div className="font-medium">{mobile.isMobile ? 'Mobile' : 'Desktop'}</div>
              </div>
              <div>
                <span className="text-white/60">Viewport Size:</span>
                <div className="font-medium">{mobile.viewportSize}</div>
              </div>
              <div>
                <span className="text-white/60">Orientation:</span>
                <div className="font-medium capitalize">{mobile.orientation}</div>
              </div>
              <div>
                <span className="text-white/60">Breakpoint:</span>
                <div className="font-medium">{breakpoint.breakpoint}</div>
              </div>
              <div>
                <span className="text-white/60">Touch Support:</span>
                <div className="font-medium">{mobile.supportsTouch ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <span className="text-white/60">Hover Support:</span>
                <div className="font-medium">{mobile.supportsHover ? 'Yes' : 'No'}</div>
              </div>
            </div>
            
            {mobile.isIOS && (
              <Badge tone="accent" className="mt-2">iOS Device</Badge>
            )}
            {mobile.isAndroid && (
              <Badge tone="accent" className="mt-2">Android Device</Badge>
            )}
          </div>
        </Card>
        
        {/* Safe Area Insets */}
        {(safeInsets.top > 0 || safeInsets.bottom > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Safe Area Insets</CardTitle>
              <CardDescription>Device notch and home indicator spacing</CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-white/60">Top:</span>
                  <div className="font-medium">{safeInsets.top}px</div>
                </div>
                <div>
                  <span className="text-white/60">Bottom:</span>
                  <div className="font-medium">{safeInsets.bottom}px</div>
                </div>
                <div>
                  <span className="text-white/60">Left:</span>
                  <div className="font-medium">{safeInsets.left}px</div>
                </div>
                <div>
                  <span className="text-white/60">Right:</span>
                  <div className="font-medium">{safeInsets.right}px</div>
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {/* Touch Target Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Touch Target Testing</CardTitle>
            <CardDescription>All buttons meet 44x44px minimum size</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6 space-y-4">
            <div className="touch-spacing flex flex-wrap">
              <Button variant="primary" size="sm">Small (44px min)</Button>
              <Button variant="primary" size="md">Medium (44px min)</Button>
              <Button variant="primary" size="lg">Large (56px min)</Button>
            </div>
            
            <div className="touch-spacing-safe flex flex-wrap">
              <Button variant="secondary" size="sm">Secondary Small</Button>
              <Button variant="secondary" size="md">Secondary Medium</Button>
              <Button variant="secondary" size="lg">Secondary Large</Button>
            </div>
            
            <div className="touch-spacing-safe flex flex-wrap">
              <Button variant="ghost" size="sm">Ghost Small</Button>
              <Button variant="ghost" size="md">Ghost Medium</Button>
              <Button variant="ghost" size="lg">Ghost Large</Button>
            </div>
          </div>
        </Card>
        
        {/* Responsive Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Typography</CardTitle>
            <CardDescription>Fluid text sizing across viewports</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <div className="text-xs text-white/60 mb-1">Hero Text</div>
              <div className="text-responsive-3xl font-bold">Hero Heading</div>
            </div>
            <div>
              <div className="text-xs text-white/60 mb-1">H1 Text</div>
              <div className="text-responsive-2xl font-bold">Main Heading</div>
            </div>
            <div>
              <div className="text-xs text-white/60 mb-1">H2 Text</div>
              <div className="text-responsive-xl font-semibold">Section Heading</div>
            </div>
            <div>
              <div className="text-xs text-white/60 mb-1">Body Text</div>
              <div className="text-responsive-base">
                This is body text that scales smoothly across different viewport sizes
                using fluid typography with clamp().
              </div>
            </div>
          </div>
        </Card>
        
        {/* Mobile Grid System */}
        <Card>
          <CardHeader>
            <CardTitle>Mobile Grid System</CardTitle>
            <CardDescription>1 column on mobile, 2 on tablet, 3 on desktop</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="mobile-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-xl p-4 text-center border border-white/10"
                >
                  <div className="text-2xl mb-2">📦</div>
                  <div className="text-sm">Item {i}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Horizontal Scroll */}
        <Card>
          <CardHeader>
            <CardTitle>Mobile Scroll</CardTitle>
            <CardDescription>Touch-optimized horizontal scrolling</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="mobile-scroll flex gap-3 pb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center border border-white/10"
                >
                  <span className="text-2xl">🎯</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Floating Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Floating Action Buttons</CardTitle>
            <CardDescription>Mobile-optimized primary actions</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <div className="text-sm text-white/60 mb-2">Extended FAB</div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFabExtended(!fabExtended)}
                >
                  Toggle Extended: {fabExtended ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-white/60 mb-2">Mini FABs</div>
              <div className="flex gap-3 flex-wrap">
                <MiniFAB icon={Heart} label="Like" />
                <MiniFAB icon={Share2} label="Share" />
                <MiniFAB icon={MessageCircle} label="Comment" />
                <MiniFAB icon={Settings} label="Settings" />
              </div>
            </div>
          </div>
        </Card>
        
        {/* Responsive Container */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Container</CardTitle>
            <CardDescription>Adaptive padding and max-width</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-white/80">
                This container has responsive padding that adjusts based on viewport:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-white/60">
                <li>• Mobile (320-639px): 16px padding</li>
                <li>• Tablet (640-767px): 24px padding</li>
                <li>• Desktop (768px+): 32px padding</li>
              </ul>
            </div>
          </div>
        </Card>
        
        {/* Viewport Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Active Breakpoints</CardTitle>
            <CardDescription>Visual indicators for current viewport</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="flex flex-wrap gap-2">
              <Badge tone={breakpoint.isXs ? 'accent' : 'neutral'}>
                XS {breakpoint.isXs && '✓'}
              </Badge>
              <Badge tone={breakpoint.isSm ? 'accent' : 'neutral'}>
                SM {breakpoint.isSm && '✓'}
              </Badge>
              <Badge tone={breakpoint.isMd ? 'accent' : 'neutral'}>
                MD {breakpoint.isMd && '✓'}
              </Badge>
              <Badge tone={breakpoint.isLg ? 'accent' : 'neutral'}>
                LG {breakpoint.isLg && '✓'}
              </Badge>
              <Badge tone={breakpoint.isXl ? 'accent' : 'neutral'}>
                XL {breakpoint.isXl && '✓'}
              </Badge>
              <Badge tone={breakpoint.is2Xl ? 'accent' : 'neutral'}>
                2XL {breakpoint.is2Xl && '✓'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Floating Action Button */}
      <FloatingActionButton
        icon={Plus}
        label="Add New"
        position="bottom-right"
        extended={fabExtended}
      />
    </div>
  );
}
