import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureCard } from './FeatureCard';
import type { Feature } from '../../types/landing';

describe('FeatureCard', () => {
  const mockFeature: Feature = {
    id: 'test-feature',
    icon: '🎨',
    title: 'Test Feature',
    description: 'This is a test feature description',
    order: 1,
  };

  describe('Rendering', () => {
    it('renders feature card with icon, title, and description', () => {
      render(<FeatureCard feature={mockFeature} />);

      expect(screen.getByText('🎨')).toBeInTheDocument();
      expect(screen.getByText('Test Feature')).toBeInTheDocument();
      expect(screen.getByText('This is a test feature description')).toBeInTheDocument();
    });

    it('renders with correct data-testid', () => {
      const { container } = render(<FeatureCard feature={mockFeature} />);

      const card = container.querySelector('[data-testid="feature-card-test-feature"]');
      expect(card).toBeInTheDocument();
    });

    it('renders icon with aria-hidden attribute', () => {
      const { container } = render(<FeatureCard feature={mockFeature} />);

      const icon = container.querySelector('.feature-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders title as h3 heading', () => {
      render(<FeatureCard feature={mockFeature} />);

      const heading = screen.getByRole('heading', { level: 3, name: 'Test Feature' });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('feature-title');
    });

    it('renders description as paragraph', () => {
      const { container } = render(<FeatureCard feature={mockFeature} />);

      const description = container.querySelector('.feature-description');
      expect(description).toBeInTheDocument();
      expect(description?.tagName).toBe('P');
    });
  });

  describe('CSS Classes', () => {
    it('applies correct CSS classes', () => {
      const { container } = render(<FeatureCard feature={mockFeature} />);

      expect(container.querySelector('.feature-card')).toBeInTheDocument();
      expect(container.querySelector('.feature-icon')).toBeInTheDocument();
      expect(container.querySelector('.feature-title')).toBeInTheDocument();
      expect(container.querySelector('.feature-description')).toBeInTheDocument();
    });
  });

  describe('Different Feature Data', () => {
    it('renders different icons correctly', () => {
      const feature: Feature = { ...mockFeature, icon: '🚀' };
      render(<FeatureCard feature={feature} />);

      expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('renders long descriptions correctly', () => {
      const longDescription = 'This is a very long description that contains multiple sentences and should still render correctly without any issues in the feature card component.';
      const feature: Feature = { ...mockFeature, description: longDescription };
      render(<FeatureCard feature={feature} />);

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('renders features with different IDs correctly', () => {
      const feature1: Feature = { ...mockFeature, id: 'feature-1', title: 'Feature 1' };
      const feature2: Feature = { ...mockFeature, id: 'feature-2', title: 'Feature 2' };

      const { rerender } = render(<FeatureCard feature={feature1} />);
      expect(screen.getByText('Feature 1')).toBeInTheDocument();

      rerender(<FeatureCard feature={feature2} />);
      expect(screen.getByText('Feature 2')).toBeInTheDocument();
    });
  });
});
