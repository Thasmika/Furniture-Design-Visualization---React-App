import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutSection } from './AboutSection';
import * as hooks from '../../hooks';

// Mock the useIntersectionObserver hook
vi.mock('../../hooks', () => ({
  useIntersectionObserver: vi.fn(() => false),
}));

const mockUseIntersectionObserver = vi.mocked(hooks.useIntersectionObserver);

beforeEach(() => {
  mockUseIntersectionObserver.mockReturnValue(false);
});

describe('AboutSection', () => {
  it('renders the about section with heading', () => {
    render(<AboutSection />);
    
    const heading = screen.getByRole('heading', { name: /about furnivision/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders descriptive content about FurniVision', () => {
    render(<AboutSection />);
    
    // Check for key phrases in the content
    expect(screen.getByText(/planning room layouts and furniture arrangements/i)).toBeInTheDocument();
    expect(screen.getByText(/2D and 3D visualization technology/i)).toBeInTheDocument();
    expect(screen.getByText(/join thousands of homeowners/i)).toBeInTheDocument();
  });

  it('renders an image with proper alt text', () => {
    render(<AboutSection />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt');
    expect(image.getAttribute('alt')).not.toBe('');
    expect(image.getAttribute('alt')).toContain('FurniVision');
  });

  it('applies lazy loading to the image', () => {
    render(<AboutSection />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('has proper semantic structure with section and heading', () => {
    const { container } = render(<AboutSection />);
    
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('about-section');
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('includes aria-labelledby for accessibility', () => {
    const { container } = render(<AboutSection />);
    
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('aria-labelledby', 'about-heading');
    
    const heading = screen.getByRole('heading', { name: /about furnivision/i });
    expect(heading).toHaveAttribute('id', 'about-heading');
  });

  it('applies fade-in class when visible', () => {
    mockUseIntersectionObserver.mockReturnValue(true);

    const { container } = render(<AboutSection />);
    
    const section = container.querySelector('section');
    expect(section).toHaveClass('fade-in');
  });

  it('does not apply fade-in class when not visible', () => {
    mockUseIntersectionObserver.mockReturnValue(false);

    const { container } = render(<AboutSection />);
    
    const section = container.querySelector('section');
    expect(section).not.toHaveClass('fade-in');
  });

  it('contains between 100 and 300 words of content', () => {
    const { container } = render(<AboutSection />);
    
    const contentDiv = container.querySelector('.about-content');
    const text = contentDiv?.textContent || '';
    const wordCount = text.trim().split(/\s+/).length;
    
    // Requirement 5.2: Between 100 and 300 words
    expect(wordCount).toBeGreaterThanOrEqual(100);
    expect(wordCount).toBeLessThanOrEqual(300);
  });

  it('renders three paragraphs of content', () => {
    const { container } = render(<AboutSection />);
    
    const paragraphs = container.querySelectorAll('.about-content p');
    expect(paragraphs.length).toBe(3);
  });
});
