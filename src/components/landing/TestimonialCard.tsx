import React from 'react';
import { StarRating } from './StarRating';
import { OptimizedImage } from './OptimizedImage';
import type { Testimonial } from '../../store/slices/landingSlice';
import './TestimonialCard.css';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

/**
 * TestimonialCard component displays a single testimonial with user info, rating, and review
 * Shows user avatar or placeholder, name, star rating, and review text
 * 
 * Requirements: 8.3, 8.4, 8.7
 * 
 * @param testimonial - Testimonial object containing id, name, avatar, rating, review, date, verified
 */
export const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="testimonial-card" data-testid={`testimonial-card-${testimonial.id}`}>
      <div className="testimonial-header">
        <div className="testimonial-avatar">
          {testimonial.avatar ? (
            <OptimizedImage
              src={testimonial.avatar} 
              alt={`${testimonial.name}'s avatar`}
              className="avatar-image"
              loading="lazy"
            />
          ) : (
            <div className="avatar-placeholder" aria-label="User avatar placeholder">
              {testimonial.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="testimonial-user-info">
          <h3 className="testimonial-name">{testimonial.name}</h3>
          <StarRating rating={testimonial.rating} className="testimonial-rating" />
        </div>
      </div>
      <p className="testimonial-review">{testimonial.review}</p>
      {testimonial.verified && (
        <div className="testimonial-verified" aria-label="Verified testimonial">
          ✓ Verified
        </div>
      )}
    </div>
  );
};
