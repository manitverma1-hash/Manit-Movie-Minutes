
export type Feature = 'Quiz' | 'News' | 'Interviews' | 'Reviews' | 'Games' | 'Box Office' | 'Archive' | 'Bio' | 'Music' | 'Releases' | 'Fashion' | 'Dialogues' | 'ManitSays' | 'Search';

export type Language = 'English' | 'Hindi' | 'Spanish' | 'French' | 'Arabic' | 'Mandarin' | 'Russian';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface NewsArticle {
  headline: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  category: string;
  date?: string;
}

export interface CelebrityInterview {
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
}

export interface WeeklyEarning {
  week: string;
  amount: number; // in Crores
}

export interface BoxOfficeMovie {
  title: string;
  totalCollection: number; // in Crores
  verdict: string;
  weeklyEarnings: WeeklyEarning[];
  releaseDate: string;
  posterUrl?: string;
  cast?: string[];
}

export interface BoxOfficeData {
  marketSummary: string;
  movies: BoxOfficeMovie[];
  sources: string[];
}

export interface CelebrityBio {
  name: string;
  summary: string;
  earlyLife: string[];
  career: string[];
  family: string[];
  awards: string[];
  lifestyle: string[];
}

export interface MusicTrack {
  title: string;
  movie: string;
  singers: string[];
  composer: string;
  mood: string;
  youtubeQuery: string;
}

export interface UpcomingMovie {
  title: string;
  releaseDate: string;
  cast: string[];
  director: string;
  producer: string; // Added producer field
  synopsis: string;
  buzz: string; // High, Medium, Low
}

export interface FashionStyle {
  celebrity: string;
  lookName: string; // e.g., "Airport Look", "Wedding Lehenga"
  description: string;
  elements: string[]; // List of items (e.g., "Oversized sunglasses", "White sneakers")
  tips: string[]; // How to recreate
  shoppingLinks?: { storeName: string; url: string }[]; 
}

export interface Quote {
  text: string;
  actor: string;
  movie: string;
  context: string; // Brief context or meaning
}

export interface UserComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface ManitContent {
  id: string;
  type: 'review' | 'video';
  title: string;
  content?: string; // Markdown supported
  videoUrl?: string; // YouTube embed URL
  rating?: number; // 0-5
  date: string;
  tags: string[];
  comments: UserComment[];
}

export interface SearchResult {
  text: string;
  sources: { title: string; uri: string }[];
}
