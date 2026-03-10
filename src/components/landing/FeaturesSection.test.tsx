import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturesSection } from './FeaturesSection';
import * as landingData from '../../data/landingData';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

// Mock useIntersectionObserver hook
vi.mock('../../hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: vi.fn(() => true), // Default to visible
}));

describe('FeaturesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders features section with heading and subheading', () => {
      render(<FeaturesSection />);

      expect(screen.getByText('Powerful Features for Your Design Needs')).toBeInTheDocument();
      expect(screen.getByText('Everything you need to create stunning room designs')).toBeInTheDocument();
    });

    it('renders with proper semantic structure', () => {
      const { container } = render(<FeaturesSection />);

      const section = container.querySelector('section.features-section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'features');
      expect(section).toHaveAttribute('aria-labelledby', 'features-heading');

      const heading = screen.getByRole('heading', { level: 2, name: 'Powerful Features for Your Design Needs' });
      expect(heading).toHaveAttribute('id', 'features-heading');
    });

    it('renders all features from landingData', () => {
      render(<FeaturesSection />);

      landingData.features.forEach((feature) => {
        expect(screen.getByText(feature.title)).toBeInTheDocument();
        expect(screen.getByText(feature.description)).toBeInTheDocument();
        expect(screen.getByText(feature.icon)).toBeInTheDocument();
      });
    });

    it('renders correct number of feature cards', () => {
      const { container } = render(<FeaturesSection />);

      const featureCards = container.querySelectorAll('.feature-card');
      expect(featureCards).toHaveLength(landingData.features.length);
    });

    it('renders feature cards with unique keys', () => {
      const { container } = render(<FeaturesSection />);

      landingData.features.forEach((feature) => {
        const card = container.querySelector(`[data-testid="feature-card-${feature.id}"]`);
        expect(card).toBeInTheDocument();
      });
    });
  });

  describe('Specific Features', () => {
    it('renders 2D/3D Visualization feature', () => {
      render(<FeaturesSection />);

      expect(screen.getByText('2D/3D Visualization')).toBeInTheDocument();
      expect(screen.getByText(/Switch seamlessly between 2D floor plans/)).toBeInTheDocument();
    });

    it('renders Furniture Library feature', () => {
      render(<FeaturesSection />);

      expect(screen.getByText('Furniture Library')).toBeInTheDocument();
      expect(screen.getByText(/Access a comprehensive library/)).toBeInTheDocument();
    });

    it('renders Save & Load Designs feature', () => {
      render(<FeaturesSection />);

      expect(screen.getByText('Save & Load Designs')).toBeInTheDocument();
      expect(screen.getByText(/Cloud storage for all your designs/)).toBeInTheDocument();
    });

    it('renders Real-time Editing feature', () => {
      render(<FeaturesSection />);

      expect(screen.getByText('Real-time Editing')).toBeInTheDocument();
      expect(screen.getByText(/Instant updates as you drag/)).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Layout', () => {
    it('applies correct CSS classes', () => {
      const { container } = render(<FeaturesSection />);

      expect(container.querySelector('.features-section')).toBeInTheDocument();
      expect(container.querySelector('.features-container')).toBeInTheDocument();
      expect(container.querySelector('.features-heading')).toBeInTheDocument();
      expect(container.querySelector('.features-subheading')).toBeInTheDocument();
      expect(container.querySelector('.features-grid')).toBeInTheDocument();
    });

    it('applies visible class when in viewport', () => {
      vi.mocked(useIntersectionObserver).mockReturnValue(true);

      const { container } = render(<FeaturesSection />);

      const section = container.querySelector('.features-section');
      expect(section).toHaveClass('visible');
    });

    it('does not apply visible class when not in viewport', () => {
      vi.mocked(useIntersectionObserver).mockReturnValue(false);

      const { container } = render(<FeaturesSection />);

      const section = container.querySelector('.features-section');
      expect(section).not.toHaveClass('visible');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<FeaturesSection />);

      const h2 = screen.getByRole('heading', { level: 2, name: 'Powerful Features for Your Design Needs' });
      expect(h2).toBeInTheDocument();

      const h3Headings = screen.getAllByRole('heading', { level: 3 });
      expect(h3Headings.length).toBe(landingData.features.length);
    });

    it('has aria-labelledby connecting section to heading', () => {
      const { container } = render(<FeaturesSection />);

      const section = container.querySelector('section');
      const heading = container.querySelector('#features-heading');

      expect(section).toHaveAttribute('aria-labelledby', 'features-heading');
      expect(heading).toBeInTheDocument();
    });

    it('feature icons have aria-hidden attribute', () => {
      const { container } = render(<FeaturesSection />);

      const icons = container.querySelectorAll('.feature-icon');
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Responsive Grid Layout', () => {
    it('renders features in grid layout', () => {
      const { container } = render(<FeaturesSection />);

      const grid = container.querySelector('.features-grid');
      expect(grid).toBeInTheDocument();

      const cards = grid?.querySelectorAll('.feature-card');
      expect(cards?.length).toBe(landingData.features.length);
    });
  });
});
