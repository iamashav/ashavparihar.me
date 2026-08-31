import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App shell', () => {
  it('renders the hero, every section heading and the overlay chrome', () => {
    const { container } = render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Ashav Parihar' })).toBeInTheDocument();
    ['Case Studies', 'Projects', 'Toolbox', 'Contact'].forEach((heading) => {
      expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
    });
    expect(container.querySelector('.scanlines')).toBeInTheDocument();
    expect(container.querySelector('.vignette')).toBeInTheDocument();
    expect(container.querySelector('#screen-grain')).toBeInTheDocument();
  });
});
