/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts to main content areas
 */

'use client';

import { useEffect, useState } from 'react';

interface SkipLink {
  id: string;
  label: string;
  targetId: string;
}

const defaultSkipLinks: SkipLink[] = [
  { id: 'skip-to-main', label: 'Skip to main content', targetId: 'main-content' },
  { id: 'skip-to-nav', label: 'Skip to navigation', targetId: 'main-navigation' },
  { id: 'skip-to-footer', label: 'Skip to footer', targetId: 'footer' },
];

interface SkipLinksProps {
  links?: SkipLink[];
}

/**
 * Skip Links Component
 * Renders accessible skip navigation links
 */
export function SkipLinks({ links = defaultSkipLinks }: SkipLinksProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSkipClick = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="skip-links">
      {links.map(link => (
        <a
          key={link.id}
          href={`#${link.targetId}`}
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            handleSkipClick(link.targetId);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {link.label}
        </a>
      ))}

      <style jsx>{`
        .skip-links {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
        }

        .skip-link {
          position: absolute;
          top: -100px;
          left: 0;
          padding: 12px 24px;
          background: #ff0094;
          color: white;
          font-weight: 600;
          text-decoration: none;
          border-radius: 0 0 8px 0;
          transition: top 0.2s ease;
          box-shadow: 0 4px 12px rgba(255, 0, 148, 0.3);
        }

        .skip-link:focus {
          top: 0;
          outline: 3px solid #ffd200;
          outline-offset: 2px;
        }

        .skip-link:hover {
          background: #ff1fa5;
        }
      `}</style>
    </div>
  );
}

/**
 * Hook to register skip link targets
 */
export function useSkipLinkTarget(targetId: string) {
  useEffect(() => {
    const element = document.getElementById(targetId);
    if (element && !element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1');
    }
  }, [targetId]);
}

/**
 * Main Content Wrapper
 * Automatically sets up skip link target
 */
export function MainContent({ children, id = 'main-content' }: { children: React.ReactNode; id?: string }) {
  useSkipLinkTarget(id);

  return (
    <main id={id} tabIndex={-1} className="focus:outline-none">
      {children}
    </main>
  );
}

/**
 * Navigation Wrapper
 * Automatically sets up skip link target
 */
export function NavigationWrapper({ children, id = 'main-navigation' }: { children: React.ReactNode; id?: string }) {
  useSkipLinkTarget(id);

  return (
    <nav id={id} tabIndex={-1} aria-label="Main navigation" className="focus:outline-none">
      {children}
    </nav>
  );
}
