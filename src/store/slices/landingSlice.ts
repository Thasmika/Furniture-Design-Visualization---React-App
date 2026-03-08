import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchStatisticsWithCache, fetchTestimonials } from '../../services/landingService';

// Testimonial data model
export interface Testimonial {
  id: string;
  name: string;
  avatar: string | null;
  rating: number; // 1-5
  review: string;
  date: string;
  verified: boolean;
}

// Statistics data model
export interface Statistics {
  userCount: number;
  designCount: number;
  furnitureCount: number;
}

// Landing page state
export interface LandingPageState {
  statistics: {
    data: Statistics | null;
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
  };
  testimonials: {
    data: Testimonial[];
    loading: boolean;
    error: string | null;
  };
}

// Initial state with default values
const initialState: LandingPageState = {
  statistics: {
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
  },
  testimonials: {
    data: [],
    loading: false,
    error: null,
  },
};

// Async thunk for fetching statistics
export const fetchStatisticsAsync = createAsyncThunk(
  'landing/fetchStatistics',
  async () => {
    const statistics = await fetchStatisticsWithCache();
    return statistics;
  }
);

// Async thunk for fetching testimonials
export const fetchTestimonialsAsync = createAsyncThunk(
  'landing/fetchTestimonials',
  async () => {
    const testimonials = await fetchTestimonials();
    return testimonials;
  }
);

const landingSlice = createSlice({
  name: 'landing',
  initialState,
  reducers: {
    // Synchronous actions for manual state updates if needed
    clearStatisticsError: (state) => {
      state.statistics.error = null;
    },
    clearTestimonialsError: (state) => {
      state.testimonials.error = null;
    },
  },
  extraReducers: (builder) => {
    // Statistics reducers
    builder
      .addCase(fetchStatisticsAsync.pending, (state) => {
        state.statistics.loading = true;
        state.statistics.error = null;
      })
      .addCase(fetchStatisticsAsync.fulfilled, (state, action: PayloadAction<Statistics>) => {
        state.statistics.loading = false;
        state.statistics.data = action.payload;
        state.statistics.lastFetched = Date.now();
        state.statistics.error = null;
      })
      .addCase(fetchStatisticsAsync.rejected, (state, action) => {
        state.statistics.loading = false;
        state.statistics.error = action.error.message || 'Failed to fetch statistics';
      });

    // Testimonials reducers
    builder
      .addCase(fetchTestimonialsAsync.pending, (state) => {
        state.testimonials.loading = true;
        state.testimonials.error = null;
      })
      .addCase(fetchTestimonialsAsync.fulfilled, (state, action: PayloadAction<Testimonial[]>) => {
        state.testimonials.loading = false;
        state.testimonials.data = action.payload;
        state.testimonials.error = null;
      })
      .addCase(fetchTestimonialsAsync.rejected, (state, action) => {
        state.testimonials.loading = false;
        state.testimonials.error = action.error.message || 'Failed to fetch testimonials';
      });
  },
});

// Export actions
export const { clearStatisticsError, clearTestimonialsError } = landingSlice.actions;

// Export reducer
export default landingSlice.reducer;
