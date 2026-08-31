export interface ProjectImage {
  src320: string;
  src768: string;
  src1280: string;
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
      'A build-your-own-burger app with a live order summary and checkout flow, backed by a Redux store.',
    tech: ['React', 'Redux', 'Axios', 'Jest', 'Enzyme'],
    github: 'https://github.com/iamashav/Burger-Builder',
    live: 'https://my-react-burgerbuilder-app.web.app',
    image: {
      src320: '/images/burger-builder-320.webp',
      src768: '/images/burger-builder-768.webp',
      src1280: '/images/burger-builder-1280.webp',
      alt: 'Burger Builder app screenshot',
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
      src320: '/images/shopping-cart-320.webp',
      src768: '/images/shopping-cart-768.webp',
      src1280: '/images/shopping-cart-1280.webp',
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
      src320: '/images/my-chat-320.webp',
      src768: '/images/my-chat-768.webp',
      src1280: '/images/my-chat-1280.webp',
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
      src320: '/images/movie-watchlist-320.webp',
      src768: '/images/movie-watchlist-768.webp',
      src1280: '/images/movie-watchlist-1280.webp',
      alt: 'Movie Watchlist app screenshot',
    },
  },
];
