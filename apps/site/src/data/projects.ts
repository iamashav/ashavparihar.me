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
    id: 'burger-builder',
    index: '01',
    role: 'Solo build',
    status: 'LIVE',
    title: 'Burger Builder',
    description:
      'A build-your-own-burger app with live per-ingredient pricing and a sign-in gated order flow, with cart state held in Redux Toolkit.',
    tech: ['React', 'Redux Toolkit', 'TypeScript', 'Tailwind', 'Vitest'],
    github: 'https://github.com/iamashav/Burger-Builder',
    live: 'https://my-react-burgerbuilder-app.web.app',
    image: {
      src: '/images/burger-builder.png',
      alt: 'The MyBurger builder showing a stacked burger, the running price, and per-ingredient controls',
    },
  },
  {
    id: 'shopping-cart',
    index: '02',
    role: 'Solo build',
    status: 'LIVE',
    title: 'Shopping Cart',
    description:
      'An e-commerce storefront with Stripe checkout, built on Commerce.js for product and cart data.',
    tech: ['React', 'Commerce.js', 'Stripe', 'Material-UI'],
    github: 'https://github.com/iamashav/shopping-cart',
    live: 'https://shoppingcartecommerce.netlify.app',
    image: {
      src: '/images/shopping-cart.webp',
      alt: 'Shopping Cart app screenshot',
    },
  },
  {
    id: 'my-chat',
    index: '03',
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
  {
    id: 'movie-watchlist',
    index: '04',
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
];
