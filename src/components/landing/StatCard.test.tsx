import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

// Mock the hooks
vi.mock('../../hooks/useCountAnimation', () => ({
  useCountAnimation: vi.fn((targetValue: number) => targetValue),
}));

vi.mock('../../hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: vi.fn(() => true),
}));

describe('StatCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders stat card with icon, number, and label', () => {
      render(<StatCard icon="👥" number={1000} label="Active Users" id="users" />);

      expect(screen.getByText('👥')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
    });

    it('renders with correct data-testid', () => {
      const { container } = render(<StatCard icon="🎨" number={5000} label="Designs" id="designs" />);

      const card = container.querySelector('[data-testid="stat-card-designs"]');
      expect(card).toBeInTheDocument();
    });

    it('renders icon with aria-hidden attribute', () => {
      const { container } = render(<StatCard icon="🪑" number={200} label="Furniture" id="furniture" />);

      const icon = container.querySelector('.stat-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders number with aria-live attribute', () => {
      const { container } = render(<StatCard icon="⭐" number={98} label="Satisfaction" id="satisfaction" />);

      const number = container.querySelector('.stat-number');
      expect(number).toHaveAttribute('aria-live', 'polite');
    });

    it('formats large numbers with commas', () => {
      render(<StatCard icon="👥" number={10000} label="Users" id="users" />);

      expect(screen.getByText('10,000')).toBeInTheDocument();
    });

    it('formats numbers without decimals', () => {
      render(<StatCard icon="👥" number={1234} label="Users" id="users" />);

      expect(screen.getByText('1,234')).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('applies correct CSS classes', () => {
      const { container } = render(<StatCard icon="👥" number={1000} label="Users" id="users" />);

      expect(container.querySelector('.stat-card')).toBeInTheDocument();
      expect(container.querySelector('.stat-icon')).toBeInTheDocument();
      expect(container.querySelector('.stat-number')).toBeInTheDocument();
      expect(container.querySelector('.stat-label')).toBeInTheDocument();
    });
  });

  describe('Different Stat Data', () => {
    it('renders different icons correctly', () => {
      render(<StatCard icon="🚀" number={100} label="Rockets" id="rockets" />);

      expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('renders zero correctly', () => {
      render(<StatCard icon="👥" number={0} label="Users" id="users" />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('renders small numbers correctly', () => {
      render(<StatCard icon="👥" number={5} label="Users" id="users" />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders very large numbers correctly', () => {
      render(<StatCard icon="👥" number={1000000} label="Users" id="users" />);

      expect(screen.getByText('1,000,000')).toBeInTheDocument();
    });

    it('renders different labels correctly', () => {
      const { rerender } = render(<StatCard icon="👥" number={100} label="Label 1" id="stat1" />);
      expect(screen.getByText('Label 1')).toBeInTheDocument();

      rerender(<StatCard icon="👥" number={100} label="Label 2" id="stat2" />);
      expect(screen.getByText('Label 2')).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('uses useIntersectionObserver hook', async () => {
      const { useIntersectionObserver } = await import('../../hooks/useIntersectionObserver');
      
      render(<StatCard icon="👥" number={1000} label="Users" id="users" />);

      expect(useIntersectionObserver).toHaveBeenCalled();
    });

    it('uses useCountAnimation hook with correct parameters', async () => {
      const { useCountAnimation } = await import('../../hooks/useCountAnimation');
      
      render(<StatCard icon="👥" number={1000} label="Users" id="users" />);

      expect(useCountAnimation).toHaveBeenCalledWith(1000, 1000, true);
    });
  });
});
