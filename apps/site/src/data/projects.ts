export interface ProjectImage {
  src: string;
  alt: string;
}

export type ProjectStatus = 'LIVE' | 'ARCHIVED';

export interface Project {
  id: string;
  index: string;
  role: string;
  status: ProjectStatus;
  title: string;
  description: string;
  tech: string[];
  github: string;
  live: string;
  image: ProjectImage;
}

export const projects: Project[] = [
  {
    id: 'bloom-coffee',
    index: '01',
    role: 'Solo build',
    status: 'LIVE',
    title: 'Bloom Coffee',
    description:
      'A full-stack specialty coffee shop with Stripe checkout and an admin console for stock and refunds.',
    tech: ['Next.js', 'Stripe', 'Firestore', 'TypeScript', 'Zustand', 'Playwright'],
    github: 'https://github.com/iamashav/bloom-coffee',
    live: 'https://bloomcoffee-shop.netlify.app',
    image: {
      src: '/images/bloom-coffee.png',
      alt: 'The Bloom shop on a phone, with search, roast filters and a coffee bag product card',
    },
  },
  {
    id: 'pearl-and-leaf',
    index: '02',
    role: 'Solo build',
    status: 'LIVE',
    title: 'Pearl & Leaf',
    description:
      'A bubble tea builder with layered drinks, undo and redo, dietary filters and shareable links.',
    tech: ['React', 'Redux Toolkit', 'Firebase', 'TypeScript', 'Tailwind', 'Vitest'],
    github: 'https://github.com/iamashav/pearl-and-leaf',
    live: 'https://pearl-and-leaf.web.app',
    image: {
      src: '/images/pearl-and-leaf.png',
      alt: 'The Pearl & Leaf builder on a phone, showing a layered taro milk tea with undo, redo and share controls',
    },
  },
  {
    id: 'movie-watchlist',
    index: '03',
    role: 'Solo build',
    status: 'LIVE',
    title: 'Movie Watchlist',
    description: 'A watchlist app for tracking movies to watch, built with hooks and the Context API.',
    tech: ['React', 'Hooks', 'Context API'],
    github: 'https://github.com/iamashav/movie-watchlist',
    live: 'https://moviewatchlistapp.netlify.app',
    image: {
      src: '/images/movie-watchlist.webp',
      alt: 'Movie Watchlist app screenshot',
    },
  },
  {
    id: 'my-chat',
    index: '04',
    role: 'Solo build',
    status: 'LIVE',
    title: 'My Chat',
    description: 'A real-time chat app with Firebase-backed authentication and messaging.',
    tech: ['React', 'Firebase'],
    github: 'https://github.com/iamashav/my-chat-app',
    live: 'https://chat-app-b2ffc.web.app',
    image: {
      src: '/images/my-chat.webp',
      alt: 'My Chat app screenshot',
    },
  },
];
