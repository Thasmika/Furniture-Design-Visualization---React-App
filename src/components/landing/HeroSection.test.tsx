import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { HeroSection } from './HeroSection';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HeroSection', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('renders hero section with headline and tagline', () => {
      render(
        <BrowserRouter>
          <HeroSection isAuthenticated={false} />
        </BrowserRouter>
      );

      expect(screen.getByText('Design Your Dream Space with FurniVision')).toBeInTheDocument();
      expect(screen.getByText(/Professional 2D\/3D furniture visualization tool/)).toBeInTheDocument();
    });

    it('renders with proper semantic structure', () => {
      const { container } = render(
        <BrowserRouter>
          <HeroSection isAuthenticated={false} />
        </BrowserRouter>
      );

      const section = container.querySelector('section.hero-section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-labelledby', 'hero-headline');
      expect(section).toHaveAttribute('id', 'hero');

      const h1 = container.querySelector('h1.hero-headline');
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveAttribute('id', 'hero-headline');
    });

    it('has gradient background element', () => {
      const { container } = render(
        <BrowserRouter>
          <HeroSection isAuthenticated={false} />
        </BrowserRouter>
      );

      const background = container.querySelector('.hero-background');
      expect(background).toBeInTheDocument();
      expect(background).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Unauthenticated User CTAs', () => {
    it('displays Get Started and Sign In buttons for unauthenticated users', () => {
      render(
        <BrowserRouter>
          <HeroSection isAuthenticated={false} />
        </BrowserRouter>
      );

      expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('does not display Go to Dashboard button for unauthenticated users', () => {
      render(
        <BrowserRouter>
          <HeroSection isAuthenticated={false} />
        </BrowserRouter>
      );

      expect(screen.queryByRole('button', { name: 'Go to Dashboard' })).not.toBeInTheDocument();
    });

    it('navigates to /register when Get Started is clicked', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <HeroSection isAuthenticated={false} />
        </BrowserRouter>
      );

      const getStartedButton = screen.getByRole('button', { name: 'Get Started' });
      await user.click(getStartedButton);

      expect(mockNavigate).toHaveBeenCalledWith('/register');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('navigates to /login when Sign In is clicked', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <HeroSection isAuthenticated={false} />
        </BrowserRouter>
      );

      const signInButton = screen.getByRole('button', { name: 'Sign In' });
      await user.click(signInButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Authenticated User CTAs', () => {
    it('displays Go to Dashboard button for authenticated users', () => {
      render(
        <BrowserRouter>
          <HeroSection isAuthenticated={true} />
        </BrowserRouter>
      );

      expect(screen.getByRole('button', { name: 'Go to Dashboard' })).toBeInTheDocument();
    });

    it('does not display Get Started and Sign In buttons for authenticated users', () => {
      render(
        <BrowserRouter>
          <HeroSection isAuthenticated={true} />
        </BrowserRouter>
      );

      expect(screen.queryByRole('button', { name: 'Get Started' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Sign In' })).not.toBeInTheDocument();
    });

    it('navigates to /designs when Go to Dashboard is clicked', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <HeroSection isAuthenticated={true} />
        </BrowserRouter>
      );

      const dashboardButton = screen.getByRole('button', { name: 'Go to Dashboard' });
      await user.click(dashboardButton);

      expect(mockNavigate).toHaveBeenCalledWith('/designs');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper button types', () => {
      const { container } = render(
        <BrowserRouter>
          <HeroSection isAuthenticated={false} />
        </BrowserRouter>
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('has keyboard accessible buttons', () => {
      render(
        <BrowserRouter>
          <HeroSection isAuthenticated={false} />
        </BrowserRouter>
      );

      const getStartedButton = screen.getByRole('button', { name: 'Get Started' });
      const signInButton = screen.getByRole('button', { name: 'Sign In' });

      expect(getStartedButton).toBeVisible();
      expect(signInButton).toBeVisible();
      
      // Buttons should be focusable
      getStartedButton.focus();
      expect(getStartedButton).toHaveFocus();
      
      signInButton.focus();
      expect(signInButton).toHaveFocus();
    });
  });

  describe('Responsive Design', () => {
    it('applies correct CSS classes for styling', () => {
      const { container } = render(
        <BrowserRouter>
          <HeroSection isAuthenticated={false} />
        </BrowserRouter>
      );

      expect(container.querySelector('.hero-section')).toBeInTheDocument();
      expect(container.querySelector('.hero-content')).toBeInTheDocument();
      expect(container.querySelector('.hero-headline')).toBeInTheDocument();
      expect(container.querySelector('.hero-tagline')).toBeInTheDocument();
      expect(container.querySelector('.hero-cta-buttons')).toBeInTheDocument();
    });

    it('applies primary and secondary button classes correctly', () => {
      const { container } = render(
        <BrowserRouter>
          <HeroSection isAuthenticated={false} />
        </BrowserRouter>
      );

      const primaryButton = container.querySelector('.hero-cta-primary');
      const secondaryButton = container.querySelector('.hero-cta-secondary');

      expect(primaryButton).toBeInTheDocument();
      expect(secondaryButton).toBeInTheDocument();
      expect(primaryButton).toHaveTextContent('Get Started');
      expect(secondaryButton).toHaveTextContent('Sign In');
    });
  });
});
