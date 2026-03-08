// Landing page data models

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
}

export interface Benefit {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string | null;
  rating: number; // 1-5
  review: string;
  date: string; // ISO date string
  verified?: boolean;
}

export interface Statistics {
  userCount: number;
  designCount: number;
  furnitureCount: number;
}

export interface StatisticsCache {
  data: Statistics;
  timestamp: number;
}

export interface TestimonialsData {
  testimonials: Testimonial[];
  lastUpdated: string;
}
