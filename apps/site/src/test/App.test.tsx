import { render, screen } from '@testing-library/react';
import App from '../App';


const originalMatchMedia = window.matchMedia;

function setReducedMotion(matches: boolean) {
  window.matchMedia = (query: string) => ({
    media: query,
    matches,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

const bootSequence = () => screen.queryByRole('status', { name: /boot sequence/i });

describe('App shell', () => {
  it('renders the hero, every section heading and the overlay chrome', () => {
    setReducedMotion(true);
    const { container } = render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: /ashav parihar/i }),
    ).toBeInTheDocument();
    ['Case Studies', '~/root/selected_works/', 'System capabilities', 'Transmit_a_message'].forEach((heading) => {
      expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
    });
    expect(container.querySelector('.scanlines')).toBeInTheDocument();
    expect(container.querySelector('.vignette')).toBeInTheDocument();
    expect(container.querySelector('#screen-grain')).toBeInTheDocument();
  });

  it('plays the boot sequence on every load', () => {
    setReducedMotion(false);
    render(<App />);

    expect(bootSequence()).toBeInTheDocument();
  });

  it('skips the boot sequence under reduced motion', () => {
    setReducedMotion(true);
    render(<App />);

    expect(bootSequence()).not.toBeInTheDocument();
  });

  it('keeps heading names stable while the scramble effect is running', () => {
    // Motion enabled, so ScrambleText is mid-flight on first paint. The visible glyphs are
    // decorative; the accessible name must still be the settled string.
    setReducedMotion(false);
    render(<App />);

    ['Case Studies', '~/root/selected_works/', 'System capabilities', 'Transmit_a_message'].forEach(
      (heading) => {
        expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
      },
    );
  });

  it('opens every external link safely in a new tab', () => {
    setReducedMotion(true);
    const { container } = render(<App />);

    const external = [...container.querySelectorAll('a[href^="http"]')];
    expect(external.length).toBeGreaterThan(0);
    external.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
