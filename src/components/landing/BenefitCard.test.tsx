import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BenefitCard } from './BenefitCard';
import type { Benefit } from '../../types/landing';

describe('BenefitCard', () => {
  const mockBenefit: Benefit = {
    id: 'test-benefit',
    icon: '🎯',
    title: 'Test Benefit',
    description: 'This is a test benefit description',
    order: 1,
  };

  it('renders benefit icon, title, and description', () => {
    render(<BenefitCard benefit={mockBenefit} />);

    expect(screen.getByText('🎯')).toBeInTheDocument();
    expect(screen.getByText('Test Benefit')).toBeInTheDocument();
    expect(screen.getByText('This is a test benefit description')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<BenefitCard benefit={mockBenefit} />);
    const card = container.querySelector('.benefit-card');

    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('benefit-card');
  });

  it('sets correct data-testid', () => {
    render(<BenefitCard benefit={mockBenefit} />);
    const card = screen.getByTestId('benefit-card-test-benefit');

    expect(card).toBeInTheDocument();
  });

  it('renders icon with aria-hidden attribute', () => {
    const { container } = render(<BenefitCard benefit={mockBenefit} />);
    const icon = container.querySelector('.benefit-icon');

    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders title as h3 heading', () => {
    render(<BenefitCard benefit={mockBenefit} />);
    const title = screen.getByRole('heading', { level: 3, name: 'Test Benefit' });

    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('benefit-title');
  });

  it('renders all required benefit fields', () => {
    render(<BenefitCard benefit={mockBenefit} />);

    // Validates Requirements 6.3, 6.4
    expect(screen.getByText(mockBenefit.icon)).toBeInTheDocument();
    expect(screen.getByText(mockBenefit.title)).toBeInTheDocument();
    expect(screen.getByText(mockBenefit.description)).toBeInTheDocument();
  });
});
