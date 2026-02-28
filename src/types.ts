export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  date: string;
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  duration: string;
  thumbnail: string;
  languages?: string[];
  comments?: Comment[];
  reviews?: Review[];
}

export interface User {
  id: string;
  username: string;
  role: "admin" | "user";
  isBanned: boolean;
  method?: "Google" | "Facebook" | "Guest";
  avatar?: string;
}

export interface Media {
  id: string;
  title: string;
  type: "Series" | "Movie";
  genre: string[];
  rating: number;
  year: number;
  image: string;
  banner: string;
  description: string;
  trending?: boolean;
  popular?: boolean;
  episodes?: Episode[];
  uploaderId?: string;
  isCopyrightFree?: boolean;
  season?: number;
  languages?: string[];
  comments?: Comment[];
  reviews?: Review[];
}

export interface StorageItem {
  id: string;
  name: string;
  size: string;
  date: string;
  quality: string;
}

export interface DownloadItem {
  id: string;
  mediaId: string;
  title: string;
  image: string;
  size: string;
  progress: number;
  status: "Downloading" | "Completed" | "Paused";
  date: string;
}

export const GENRES = ["Action", "Adventure", "Sci-Fi", "Mecha", "Psychological", "Supernatural", "Space", "Romance", "Drama", "Fantasy"];
