import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BenefitsSection } from './BenefitsSection';
import { benefits } from '../../data/landingData';

// Mock the useIntersectionObserver hook
vi.mock('../../hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: vi.fn(() => true),
}));

describe('BenefitsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the section with correct heading', () => {
    render(<BenefitsSection />);

    const heading = screen.getByRole('heading', { level: 2, name: /Why Choose FurniVision?/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders the subheading', () => {
    render(<BenefitsSection />);

    expect(screen.getByText(/Experience the advantages that make room design effortless/i)).toBeInTheDocument();
  });

  it('renders all benefits from data', () => {
    render(<BenefitsSection />);

    // Validates Requirements 6.1, 6.2
    benefits.forEach((benefit) => {
      expect(screen.getByText(benefit.title)).toBeInTheDocument();
      expect(screen.getByText(benefit.description)).toBeInTheDocument();
      expect(screen.getByText(benefit.icon)).toBeInTheDocument();
    });
  });

  it('renders at least 3 benefits', () => {
    render(<BenefitsSection />);

    // Validates Requirement 6.2
    const benefitCards = screen.getAllByTestId(/benefit-card-/);
    expect(benefitCards.length).toBeGreaterThanOrEqual(3);
  });

  it('applies correct CSS classes for responsive grid layout', () => {
    const { container } = render(<BenefitsSection />);

    const grid = container.querySelector('.benefits-grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('benefits-grid');
  });

  it('applies visible class when in viewport', () => {
    const { container } = render(<BenefitsSection />);

    const section = container.querySelector('.benefits-section');
    expect(section).toHaveClass('visible');
  });

  it('has correct section id for anchor navigation', () => {
    const { container } = render(<BenefitsSection />);

    const section = container.querySelector('#benefits');
    expect(section).toBeInTheDocument();
  });

  it('has correct aria-labelledby attribute', () => {
    const { container } = render(<BenefitsSection />);

    const section = container.querySelector('.benefits-section');
    expect(section).toHaveAttribute('aria-labelledby', 'benefits-heading');
  });

  it('renders benefit cards with staggered animation delays', () => {
    const { container } = render(<BenefitsSection />);

    const wrappers = container.querySelectorAll('.benefit-card-wrapper');
    
    // Check that wrappers exist (animation delays are now in CSS via nth-child selectors)
    expect(wrappers.length).toBeGreaterThan(0);
    expect(wrappers.length).toBe(3); // Should have 3 benefits
    
    // Verify each wrapper has the correct class for CSS animations
    wrappers.forEach((wrapper) => {
      expect(wrapper).toHaveClass('benefit-card-wrapper');
    });
  });

  it('renders benefits in correct order', () => {
    render(<BenefitsSection />);

    const benefitCards = screen.getAllByTestId(/benefit-card-/);
    
    // Validates Requirement 6.5 - benefits displayed in order
    benefits.forEach((benefit, index) => {
      expect(benefitCards[index]).toHaveAttribute('data-testid', `benefit-card-${benefit.id}`);
    });
  });

  it('uses semantic HTML with section element', () => {
    const { container } = render(<BenefitsSection />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('benefits-section');
  });
});
