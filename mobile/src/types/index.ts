// Navigation Types
export type { RootStackParamList } from '../navigation/AppNavigator';

// API Types
export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// User Types
export interface User {
  _id: string;
  username: string;
  email: string;
  isTourist: boolean;
  reasonForVisit?: string;
  tastes?: string[];
  points: number;
  createdAt: string;
}

// Place Types
export interface Place {
  _id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  longitude: number;
  latitude: number;
  tags: string[];
  photos: string[];
  rating?: number;
  reviewCount?: number;
  distance?: number;
  numReviews?: number;
}

export interface Review {
  _id: string;
  userId: string;
  placeId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Reward Types
export interface Reward {
  _id: string;
  name: string;
  description: string;
  pointsCost: number;
  partnerId: string;
  stock: number;
  imageUrl?: string;
}

// Dish Types
export interface Dish {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  likes: number;
  recommendedPlaces: string[];
}