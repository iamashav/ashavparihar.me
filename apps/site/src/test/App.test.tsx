import { render, screen } from '@testing-library/react';
import App from '../App';
import { caseStudies } from '../data/caseStudies';
import { projects } from '../data/projects';

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

describe('App shell', () => {
  it('renders the hero name and every layer heading', () => {
    setReducedMotion(true);
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /ashav parihar/i })).toBeInTheDocument();

    // Sections are h2, the items within them h3 — one level per rank, not two names sharing one.
    expect(screen.getByRole('heading', { level: 2, name: 'Selected work' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Contact' })).toBeInTheDocument();

    caseStudies.forEach((study) => {
      expect(screen.getByRole('heading', { level: 3, name: study.title })).toBeInTheDocument();
    });

    projects.forEach((project) => {
      expect(screen.getByRole('heading', { level: 3, name: project.title })).toBeInTheDocument();
    });
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

  it('reaches the email without putting the address in the page text', () => {
    setReducedMotion(true);
    const { container } = render(<App />);

    expect(container.querySelector('a[href^="mailto:"]')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/@gmail\.com/);
  });

  it('skips the intro under reduced motion', () => {
    setReducedMotion(true);
    render(<App />);

    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
  });

  it('plays the intro when motion is allowed', () => {
    setReducedMotion(false);
    render(<App />);

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });
});
