import '@testing-library/jest-dom/vitest';

// jsdom ships none of these, and each is read on first render: matchMedia by the reduced-motion
// hook, ResizeObserver by ScrollTrigger, IntersectionObserver by Lenis.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    media: query,
    matches: false,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    root = null;
    rootMargin = '';
    scrollMargin = '';
    thresholds: readonly number[] = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  };
}
