import React, { useEffect, useRef, useCallback } from 'react';

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Skip Navigation Link
  useEffect(() => {
    const handleSkipLink = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        mainContentRef.current?.focus();
      }
    };

    const skipLink = skipLinkRef.current;
    if (skipLink) {
      skipLink.addEventListener('keydown', handleSkipLink);
    }
    return () => {
      if (skipLink) {
        skipLink.removeEventListener('keydown', handleSkipLink);
      }
    };
  }, []);

  // Focus Management for dynamic content (example: a simple focus trap for a modal)
  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      const focusableElements = mainContentRef.current?.querySelectorAll(
        'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) { // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    }
  }, []);

  // ARIA Live Regions for dynamic content updates
  // This example assumes a mechanism to trigger live region updates.
  // A more complete implementation would involve a state management system
  // to push messages to a live region.
  const LiveRegion = () => (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        margin: '-1px',
        padding: '0',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        border: '0',
      }}
      // Example: content could be dynamically updated here via state
    ></div>
  );

  // Keyboard Navigation Helpers (e.g., for custom components)
  // This is a conceptual example. Actual implementation would be within specific components.
  const useKeyboardNavigation = (ref: React.RefObject<HTMLElement>, handlers: { [key: string]: () => void }) => {
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (handlers[event.key]) {
          event.preventDefault();
          handlers[event.key]();
        }
      };
      const element = ref.current;
      if (element) {
        element.addEventListener('keydown', handleKeyDown);
      }
      return () => {
        if (element) {
          element.removeEventListener('keydown', handleKeyDown);
        }
      };
    }, [ref, handlers]);
  };

  // Reduced Motion Support
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Provide context or CSS variables for reduced motion
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--reduce-motion',
      prefersReducedMotion ? 'reduce' : 'no-preference'
    );
  }, [prefersReducedMotion]);

  return (
    <>
      {/* Skip Navigation Link */}
      <a
        ref={skipLinkRef}
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-3 focus:rounded-md focus:bg-[#34D399] focus:text-[#070A08]"
        style={{
          fontFamily: "Inter, sans-serif",
          outline: "2px solid #34D399",
          outlineOffset: "2px",
        }}
      >
        Zum Hauptinhalt springen
      </a>

      {/* Main content wrapper for focus management */}
      <div id="main-content" ref={mainContentRef} tabIndex={-1} className="outline-none">
        {children}
      </div>

      {/* ARIA Live Region */}
      <LiveRegion />
    </>
  );
};

export default AccessibilityProvider;
