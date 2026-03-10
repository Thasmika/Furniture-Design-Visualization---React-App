import { render, screen } from '@testing-library/react';
import { TestimonialCard } from './TestimonialCard';
import type { Testimonial } from '../../store/slices/landingSlice';

describe('TestimonialCard', () => {
  const mockTestimonial: Testimonial = {
    id: '1',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    rating: 5,
    review: 'This is an excellent product! Highly recommend it.',
    date: '2024-01-15',
    verified: true,
  };

  it('renders testimonial with all information', () => {
    render(<TestimonialCard testimonial={mockTestimonial} />);
    
    expect(screen.getByTestId('testimonial-card-1')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('This is an excellent product! Highly recommend it.')).toBeInTheDocument();
    expect(screen.getByText('✓ Verified')).toBeInTheDocument();
  });

  it('displays user avatar when avatar URL is provided', () => {
    render(<TestimonialCard testimonial={mockTestimonial} />);
    
    const avatar = screen.getByAltText("John Doe's avatar");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('displays placeholder with first letter when no avatar', () => {
    const testimonialNoAvatar: Testimonial = {
      ...mockTestimonial,
      avatar: null,
    };
    
    render(<TestimonialCard testimonial={testimonialNoAvatar} />);
    
    const placeholder = screen.getByLabelText('User avatar placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveTextContent('J');
  });

  it('renders star rating component', () => {
    render(<TestimonialCard testimonial={mockTestimonial} />);
    
    const rating = screen.getByLabelText('5 out of 5 stars');
    expect(rating).toBeInTheDocument();
  });

  it('displays different star ratings correctly', () => {
    const testimonial3Stars: Testimonial = {
      ...mockTestimonial,
      rating: 3,
    };
    
    render(<TestimonialCard testimonial={testimonial3Stars} />);
    
    const rating = screen.getByLabelText('3 out of 5 stars');
    expect(rating).toBeInTheDocument();
  });

  it('does not show verified badge when not verified', () => {
    const unverifiedTestimonial: Testimonial = {
      ...mockTestimonial,
      verified: false,
    };
    
    render(<TestimonialCard testimonial={unverifiedTestimonial} />);
    
    expect(screen.queryByText('✓ Verified')).not.toBeInTheDocument();
  });

  it('handles long review text', () => {
    const longReview = 'A'.repeat(500);
    const testimonialLongReview: Testimonial = {
      ...mockTestimonial,
      review: longReview,
    };
    
    render(<TestimonialCard testimonial={testimonialLongReview} />);
    
    expect(screen.getByText(longReview)).toBeInTheDocument();
  });

  it('handles special characters in name', () => {
    const specialNameTestimonial: Testimonial = {
      ...mockTestimonial,
      name: "O'Brien-Smith",
    };
    
    render(<TestimonialCard testimonial={specialNameTestimonial} />);
    
    expect(screen.getByText("O'Brien-Smith")).toBeInTheDocument();
  });

  it('displays correct placeholder letter for lowercase names', () => {
    const lowercaseTestimonial: Testimonial = {
      ...mockTestimonial,
      name: 'alice',
      avatar: null,
    };
    
    render(<TestimonialCard testimonial={lowercaseTestimonial} />);
    
    const placeholder = screen.getByLabelText('User avatar placeholder');
    expect(placeholder).toHaveTextContent('A');
  });
});
