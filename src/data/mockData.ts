export type ContentType = 'short-film' | 'vertical-series';

export interface Episode {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
}

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
  videoUrl?: string;
  episodes?: number;
  episodeList?: Episode[];
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
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/4220556-hd_1920_1080_30fps.mp4?alt=media&token=7892c187-adf2-46ef-a7d7-437c177ad9c3',
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
    episodeList: [
      { id: '2-1', title: 'The First Call',      duration: '2:05', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '2-2', title: 'Unknown Number',       duration: '1:58', thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4437370-uhd_2160_3840_25fps.mp4?alt=media&token=3e6eedad-ca02-4e08-b4b9-15adb28bed06' },
      { id: '2-3', title: 'Trace the Signal',     duration: '2:12', thumbnail: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '2-4', title: 'Dead End',             duration: '1:50', thumbnail: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4437370-uhd_2160_3840_25fps.mp4?alt=media&token=3e6eedad-ca02-4e08-b4b9-15adb28bed06' },
      { id: '2-5', title: 'Voices in the Dark',   duration: '2:20', thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '2-6', title: 'The Decoy',            duration: '2:08', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '2-7', title: 'Exposed',              duration: '1:55', thumbnail: 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '2-8', title: 'Trust No One',         duration: '2:15', thumbnail: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '2-9', title: 'The Caller Revealed',  duration: '2:30', thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '2-10', title: 'Last Breath',         duration: '2:10', thumbnail: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '2-11', title: 'Point of No Return',  duration: '2:45', thumbnail: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '2-12', title: 'Silence',             duration: '3:00', thumbnail: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
    ],
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
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/4220556-hd_1920_1080_30fps.mp4?alt=media&token=7892c187-adf2-46ef-a7d7-437c177ad9c3',
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
    episodeList: [
      { id: '4-1', title: 'A Rainy Evening',     duration: '1:30', thumbnail: 'https://images.unsplash.com/photo-1536532184021-da8b5b6f6f37?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '4-2', title: 'The Coffee Cup',      duration: '1:25', thumbnail: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '4-3', title: 'Metro Strangers',     duration: '1:40', thumbnail: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '4-4', title: 'Rooftop Confessions', duration: '1:35', thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '4-5', title: 'Lost in Park Street', duration: '1:28', thumbnail: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '4-6', title: 'Midnight Adda',       duration: '1:45', thumbnail: 'https://images.unsplash.com/photo-1555679454-c02e3e37db3b?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '4-7', title: 'Almost',              duration: '1:50', thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '4-8', title: 'Last Light',          duration: '2:00', thumbnail: 'https://images.unsplash.com/photo-1514846528774-8de9d4a07023?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
    ],
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
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/4220556-hd_1920_1080_30fps.mp4?alt=media&token=7892c187-adf2-46ef-a7d7-437c177ad9c3',
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
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/4220556-hd_1920_1080_30fps.mp4?alt=media&token=7892c187-adf2-46ef-a7d7-437c177ad9c3',
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
    episodeList: [
      { id: '7-1', title: 'Day One',              duration: '2:10', thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '7-2', title: 'Study Buddies',        duration: '1:58', thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '7-3', title: 'The Canteen Moment',   duration: '2:05', thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '7-4', title: 'Late Night Texts',     duration: '1:52', thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '7-5', title: 'Almost Said It',       duration: '2:15', thumbnail: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '7-6', title: 'Jealousy',             duration: '2:00', thumbnail: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '7-7', title: 'I Like You',           duration: '2:20', thumbnail: 'https://images.unsplash.com/photo-1514846528774-8de9d4a07023?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '7-8', title: 'The Fight',            duration: '2:08', thumbnail: 'https://images.unsplash.com/photo-1556742521-9713bf272865?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '7-9', title: 'Making Up',            duration: '1:55', thumbnail: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
      { id: '7-10', title: 'Forever',             duration: '2:35', thumbnail: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80',      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/verticals%2F4536566-hd_1080_1920_30fps.mp4?alt=media&token=24361c61-525f-4139-8079-e03ff95716c6' },
    ],
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
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/4220556-hd_1920_1080_30fps.mp4?alt=media&token=7892c187-adf2-46ef-a7d7-437c177ad9c3',
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
