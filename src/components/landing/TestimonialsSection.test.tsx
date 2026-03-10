import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TestimonialsSection } from './TestimonialsSection';
import landingReducer from '../../store/slices/landingSlice';
import type { Testimonial } from '../../store/slices/landingSlice';

const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://example.com/avatar1.jpg',
    rating: 5,
    review: 'Excellent product!',
    date: '2024-01-15',
    verified: true,
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: null,
    rating: 4,
    review: 'Very good experience.',
    date: '2024-01-14',
    verified: false,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    avatar: 'https://example.com/avatar3.jpg',
    rating: 5,
    review: 'Highly recommend!',
    date: '2024-01-13',
    verified: true,
  },
];

const createMockStore = (testimonials: Testimonial[] = [], loading = false, error: string | null = null) => {
  return configureStore({
    reducer: {
      landing: landingReducer,
      auth: (state = { user: null, loading: false, error: null }) => state,
      design: (state = { current: null, saved: [], loading: false, error: null, isDirty: false }) => state,
      ui: (state = { selectedFurnitureId: null, activeView: '2d', showGrid: true, snapToGrid: true, sidebarOpen: true }) => state,
    },
    preloadedState: {
      landing: {
        statistics: {
          data: null,
          loading: false,
          error: null,
          lastFetched: null,
        },
        testimonials: {
          data: testimonials,
          loading,
          error,
        },
      },
    },
  });
};

describe('TestimonialsSection', () => {
  beforeEach(() => {
    // Reset window size to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('renders section with title', () => {
    const store = createMockStore(mockTestimonials);
    render(
      <Provider store={store}>
        <TestimonialsSection />
      </Provider>
    );
    
    expect(screen.getByTestId('testimonials-section')).toBeInTheDocument();
    expect(screen.getByText('What Our Customers Say')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    const store = createMockStore([], true);
    render(
      <Provider store={store}>
        <TestimonialsSection />
      </Provider>
    );
    
    expect(screen.getByText('Loading testimonials...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const store = createMockStore([], false, 'Failed to load');
    render(
      <Provider store={store}>
        <TestimonialsSection />
      </Provider>
    );
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to load testimonials. Please try again later.')).toBeInTheDocument();
  });

  it('displays placeholder when no testimonials', () => {
    const store = createMockStore([]);
    render(
      <Provider store={store}>
        <TestimonialsSection />
      </Provider>
    );
    
    expect(screen.getByTestId('testimonials-placeholder')).toBeInTheDocument();
    expect(screen.getByText('No testimonials available at this time.')).toBeInTheDocument();
  });

  it('renders all testimonials in grid on desktop', () => {
    const store = createMockStore(mockTestimonials);
    render(
      <Provider store={store}>
        <TestimonialsSection />
      </Provider>
    );
    
    expect(screen.getByTestId('testimonial-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('testimonial-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('testimonial-card-3')).toBeInTheDocument();
  });

  it('renders carousel on mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    const store = createMockStore(mockTestimonials);
    render(
      <Provider store={store}>
        <TestimonialsSection />
      </Provider>
    );
    
    // Trigger resize event
    fireEvent(window, new Event('resize'));
    
    expect(screen.getByLabelText('Previous testimonial')).toBeInTheDocument();
    expect(screen.getByLabelText('Next testimonial')).toBeInTheDocument();
  });

  it('navigates to next testimonial in carousel', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    const store = createMockStore(mockTestimonials);
    render(
      <Provider store={store}>
        <TestimonialsSection />
      </Provider>
    );
    
    fireEvent(window, new Event('resize'));
    
    const nextButton = screen.getByLabelText('Next testimonial');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      const dots = screen.getAllByRole('button', { name: /Go to testimonial/ });
      expect(dots[1]).toHaveAttribute('aria-current', 'true');
    });
  });

  it('navigates to previous testimonial in carousel', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    const store = createMockStore(mockTestimonials);
    render(
      <Provider store={store}>
        <TestimonialsSection />
      </Provider>
    );
    
    fireEvent(window, new Event('resize'));
    
    const prevButton = screen.getByLabelText('Previous testimonial');
    fireEvent.click(prevButton);
    
    await waitFor(() => {
      const dots = screen.getAllByRole('button', { name: /Go to testimonial/ });
      expect(dots[2]).toHaveAttribute('aria-current', 'true');
    });
  });

  it('navigates using carousel dots', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    const store = createMockStore(mockTestimonials);
    render(
      <Provider store={store}>
        <TestimonialsSection />
      </Provider>
    );
    
    fireEvent(window, new Event('resize'));
    
    const dot2 = screen.getByLabelText('Go to testimonial 2');
    fireEvent.click(dot2);
    
    await waitFor(() => {
      expect(dot2).toHaveAttribute('aria-current', 'true');
    });
  });

  it('does not show carousel controls with single testimonial', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    const store = createMockStore([mockTestimonials[0]]);
    render(
      <Provider store={store}>
        <TestimonialsSection />
      </Provider>
    );
    
    fireEvent(window, new Event('resize'));
    
    expect(screen.queryByLabelText('Previous testimonial')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next testimonial')).not.toBeInTheDocument();
  });

  it('wraps around when navigating past last testimonial', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    const store = createMockStore(mockTestimonials);
    render(
      <Provider store={store}>
        <TestimonialsSection />
      </Provider>
    );
    
    fireEvent(window, new Event('resize'));
    
    const nextButton = screen.getByLabelText('Next testimonial');
    
    // Click next 3 times to wrap around
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      const dots = screen.getAllByRole('button', { name: /Go to testimonial/ });
      expect(dots[0]).toHaveAttribute('aria-current', 'true');
    });
  });

  it('wraps around when navigating before first testimonial', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    const store = createMockStore(mockTestimonials);
    render(
      <Provider store={store}>
        <TestimonialsSection />
      </Provider>
    );
    
    fireEvent(window, new Event('resize'));
    
    const prevButton = screen.getByLabelText('Previous testimonial');
    fireEvent.click(prevButton);
    
    await waitFor(() => {
      const dots = screen.getAllByRole('button', { name: /Go to testimonial/ });
      expect(dots[2]).toHaveAttribute('aria-current', 'true');
    });
  });
});
