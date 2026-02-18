export type ContentType = 'short-film' | 'vertical-series';

export interface Content {
  id: string;
  title: string;
  type: ContentType;
  thumbnail: string;
  duration: string;
  price: number;
  director: string;
  language: string;
  genre: string;
  mood: string;
  rating: number;
  views: number;
  description: string;
  trailer?: string;
  episodes?: number;
  featured?: boolean;
  festivalWinner?: boolean;
}

export const mockContent: Content[] = [
  {
    id: '1',
    title: 'The Last Train',
    type: 'short-film',
    thumbnail: 'https://images.unsplash.com/photo-1695114584354-13e1910d491b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBtb3ZpZSUyMHNjZW5lJTIwZHJhbWF0aWN8ZW58MXx8fHwxNzY5ODU1MDI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '18 min',
    price: 49,
    director: 'Arjun Mehta',
    language: 'Hindi',
    genre: 'Drama',
    mood: 'Emotional',
    rating: 4.7,
    views: 12500,
    description: 'A touching story about missed connections and second chances on Mumbai\'s last local train.',
    featured: true,
    festivalWinner: true,
  },
  {
    id: '2',
    title: 'Midnight Caller',
    type: 'vertical-series',
    thumbnail: 'https://images.unsplash.com/photo-1563905463861-7d77975b3a44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aHJpbGxlciUyMHN1c3BlbnNlJTIwZGFya3xlbnwxfHx8fDE3Njk4NzM4Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '2 min/ep',
    price: 79,
    director: 'Priya Sharma',
    language: 'English',
    genre: 'Thriller',
    mood: 'Suspense',
    rating: 4.8,
    views: 25000,
    description: 'A psychological thriller series shot entirely in vertical format. 12 episodes of pure adrenaline.',
    episodes: 12,
    featured: true,
  },
  {
    id: '3',
    title: 'Colors of Home',
    type: 'short-film',
    thumbnail: 'https://images.unsplash.com/photo-1637217632015-d1d00b77f327?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGluZGlhbiUyMGN1bHR1cmV8ZW58MXx8fHwxNzY5OTE3MDMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '25 min',
    price: 99,
    director: 'Rajesh Kumar',
    language: 'Tamil',
    genre: 'Family',
    mood: 'Heartwarming',
    rating: 4.5,
    views: 8900,
    description: 'A beautiful exploration of tradition and modernity through the eyes of a young girl during Diwali.',
    festivalWinner: true,
  },
  {
    id: '4',
    title: 'City Lights',
    type: 'vertical-series',
    thumbnail: 'https://images.unsplash.com/photo-1688549450664-8189b4ac4751?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMG5pZ2h0JTIwY2l0eSUyMGxpZ2h0c3xlbnwxfHx8fDE3Njk5MTcwMjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '1.5 min/ep',
    price: 49,
    director: 'Sneha Das',
    language: 'Bengali',
    genre: 'Romance',
    mood: 'Late Night',
    rating: 4.3,
    views: 15600,
    description: 'Urban romance told through chance encounters. 8 episodes of modern love in Kolkata.',
    episodes: 8,
  },
  {
    id: '5',
    title: 'The Confession',
    type: 'short-film',
    thumbnail: 'https://images.unsplash.com/photo-1525222285365-d6bfe94ec598?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBlbW90aW9uYWx8ZW58MXx8fHwxNzY5OTE3MDI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '12 min',
    price: 29,
    director: 'Ananya Singh',
    language: 'Hindi',
    genre: 'Drama',
    mood: '5-min Heartbreak',
    rating: 4.6,
    views: 20100,
    description: 'A powerful one-shot film about truth and consequences. Raw. Real. Unfiltered.',
  },
  {
    id: '6',
    title: 'Abstract Minds',
    type: 'short-film',
    thumbnail: 'https://images.unsplash.com/photo-1705254613735-1abb457f8a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydGlzdGljJTIwY29sb3JmdWx8ZW58MXx8fHwxNzY5OTE3MDI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '8 min',
    price: 39,
    director: 'Vikram Patel',
    language: 'No Dialogue',
    genre: 'Experimental',
    mood: 'Artistic',
    rating: 4.4,
    views: 5200,
    description: 'An experimental visual journey exploring consciousness and dreams. Pure cinema.',
    festivalWinner: true,
  },
  {
    id: '7',
    title: 'First Love',
    type: 'vertical-series',
    thumbnail: 'https://images.unsplash.com/photo-1514846528774-8de9d4a07023?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjByb21hbmNlJTIwaW50aW1hdGV8ZW58MXx8fHwxNzY5OTE3MDI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '2 min/ep',
    price: 69,
    director: 'Karan Johar Jr.',
    language: 'Hindi',
    genre: 'Romance',
    mood: 'Heartwarming',
    rating: 4.9,
    views: 35000,
    description: 'A modern love story shot in 9:16. College romance with Instagram-worthy cinematography.',
    episodes: 10,
    featured: true,
  },
  {
    id: '8',
    title: 'Behind the Lens',
    type: 'short-film',
    thumbnail: 'https://images.unsplash.com/photo-1514076298225-f6de8bfa58fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMGZpbG0lMjBwcm9kdWN0aW9uJTIwY2FtZXJhfGVufDF8fHx8MTc2OTg4NDcyMHww&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '22 min',
    price: 89,
    director: 'Meera Nair',
    language: 'Malayalam',
    genre: 'Documentary',
    mood: 'Inspiring',
    rating: 4.7,
    views: 7800,
    description: 'A documentary following indie filmmakers as they create their first feature. Inspiring and real.',
  },
];

export const moods = [
  { id: '1', name: '5-min Heartbreak', emoji: '💔' },
  { id: '2', name: 'Late Night', emoji: '🌙' },
  { id: '3', name: 'Suspense', emoji: '😱' },
  { id: '4', name: 'Heartwarming', emoji: '❤️' },
  { id: '5', name: 'Emotional', emoji: '😢' },
  { id: '6', name: 'Artistic', emoji: '🎨' },
  { id: '7', name: 'Inspiring', emoji: '✨' },
];

export const genres = [
  'All',
  'Drama',
  'Thriller',
  'Romance',
  'Comedy',
  'Documentary',
  'Experimental',
  'Family',
];

export const languages = [
  'All',
  'Hindi',
  'English',
  'Tamil',
  'Telugu',
  'Bengali',
  'Malayalam',
  'Kannada',
  'No Dialogue',
];
