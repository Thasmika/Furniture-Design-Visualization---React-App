import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { CTASection } from './CTASection';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CTASection', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Unauthenticated User', () => {
    it('should render with unauthenticated CTA', () => {
      render(
        <BrowserRouter>
          <CTASection isAuthenticated={false} />
        </BrowserRouter>
      );

      expect(screen.getByText('Ready to Transform Your Space?')).toBeInTheDocument();
      expect(screen.getByText(/Join thousands of users creating beautiful room designs/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start Designing Now' })).toBeInTheDocument();
    });

    it('should navigate to register page when CTA button is clicked', () => {
      render(
        <BrowserRouter>
          <CTASection isAuthenticated={false} />
        </BrowserRouter>
      );

      const ctaButton = screen.getByRole('button', { name: 'Start Designing Now' });
      fireEvent.click(ctaButton);

      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
  });

  describe('Authenticated User', () => {
    it('should render with authenticated CTA', () => {
      render(
        <BrowserRouter>
          <CTASection isAuthenticated={true} />
        </BrowserRouter>
      );

      expect(screen.getByText('Ready to Transform Your Space?')).toBeInTheDocument();
      expect(screen.getByText(/Join thousands of users creating beautiful room designs/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Open Dashboard' })).toBeInTheDocument();
    });

    it('should navigate to dashboard when CTA button is clicked', () => {
      render(
        <BrowserRouter>
          <CTASection isAuthenticated={true} />
        </BrowserRouter>
      );

      const ctaButton = screen.getByRole('button', { name: 'Open Dashboard' });
      fireEvent.click(ctaButton);

      expect(mockNavigate).toHaveBeenCalledWith('/designs');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic section element with aria-labelledby', () => {
      const { container } = render(
        <BrowserRouter>
          <CTASection isAuthenticated={false} />
        </BrowserRouter>
      );

      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-labelledby', 'cta-headline');
      expect(section).toHaveAttribute('id', 'cta');
    });

    it('should have proper heading hierarchy', () => {
      render(
        <BrowserRouter>
          <CTASection isAuthenticated={false} />
        </BrowserRouter>
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Ready to Transform Your Space?');
    });

    it('should have button with type attribute', () => {
      render(
        <BrowserRouter>
          <CTASection isAuthenticated={false} />
        </BrowserRouter>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Content', () => {
    it('should display the correct headline', () => {
      render(
        <BrowserRouter>
          <CTASection isAuthenticated={false} />
        </BrowserRouter>
      );

      expect(screen.getByText('Ready to Transform Your Space?')).toBeInTheDocument();
    });

    it('should display encouraging description', () => {
      render(
        <BrowserRouter>
          <CTASection isAuthenticated={false} />
        </BrowserRouter>
      );

      expect(screen.getByText(/Join thousands of users creating beautiful room designs/)).toBeInTheDocument();
      expect(screen.getByText(/Start visualizing your dream space today/)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have cta-section class', () => {
      const { container } = render(
        <BrowserRouter>
          <CTASection isAuthenticated={false} />
        </BrowserRouter>
      );

      expect(container.querySelector('.cta-section')).toBeInTheDocument();
    });

    it('should have contrasting background element', () => {
      const { container } = render(
        <BrowserRouter>
          <CTASection isAuthenticated={false} />
        </BrowserRouter>
      );

      const background = container.querySelector('.cta-background');
      expect(background).toBeInTheDocument();
      expect(background).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
