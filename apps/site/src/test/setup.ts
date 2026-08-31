import '@testing-library/jest-dom/vitest';

// jsdom ships none of these, and all three are read on first render (media-query hooks, Lenis, whileInView).
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

// jsdom cannot back a canvas and logs "Not implemented" for every getContext call; returning null
// is exactly the signal the canvas components already guard against.
HTMLCanvasElement.prototype.getContext = () => null;
