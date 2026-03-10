import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { TestimonialCard } from './TestimonialCard';
import type { AppState } from '../../store/types';
import './TestimonialsSection.css';

/**
 * TestimonialsSection component displays customer testimonials
 * Uses carousel for mobile/tablet and grid layout for desktop
 * Shows placeholder message when no testimonials are available
 * 
 * Requirements: 8.1, 8.2, 8.5, 8.6, 20.4
 */
export const TestimonialsSection: React.FC = () => {
  const { data: testimonials, loading, error } = useSelector(
    (state: AppState) => state.landing.testimonials
  );
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/tablet viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-advance carousel on mobile/tablet
  useEffect(() => {
    if (!isMobile || testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile, testimonials.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <section 
        className="testimonials-section" 
        data-testid="testimonials-section"
        id="testimonials"
        aria-labelledby="testimonials-heading"
      >
        <div className="container">
          <h2 id="testimonials-heading" className="section-title">What Our Customers Say</h2>
          <div className="testimonials-loading" role="status" aria-live="polite">Loading testimonials...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section 
        className="testimonials-section" 
        data-testid="testimonials-section"
        id="testimonials"
        aria-labelledby="testimonials-heading"
      >
        <div className="container">
          <h2 id="testimonials-heading" className="section-title">What Our Customers Say</h2>
          <div className="testimonials-error" role="alert">
            Failed to load testimonials. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section 
        className="testimonials-section" 
        data-testid="testimonials-section"
        id="testimonials"
        aria-labelledby="testimonials-heading"
      >
        <div className="container">
          <h2 id="testimonials-heading" className="section-title">What Our Customers Say</h2>
          <div className="testimonials-placeholder" data-testid="testimonials-placeholder">
            No testimonials available at this time.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="testimonials-section" 
      data-testid="testimonials-section"
      id="testimonials"
      aria-labelledby="testimonials-heading"
    >
      <div className="container">
        <h2 id="testimonials-heading" className="section-title">What Our Customers Say</h2>
        
        {isMobile ? (
          // Carousel for mobile/tablet
          <div 
            className="testimonials-carousel"
            role="region"
            aria-label="Customer testimonials carousel"
            aria-live="polite"
          >
            <div 
              className="carousel-track"
              data-current-index={currentIndex}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className="carousel-slide"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Testimonial ${index + 1} of ${testimonials.length}`}
                  aria-hidden={index !== currentIndex ? 'true' : 'false'}
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
            
            {testimonials.length > 1 && (
              <>
                <button
                  type="button"
                  className="carousel-button carousel-button-prev"
                  onClick={handlePrevious}
                  aria-label="Previous testimonial"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="carousel-button carousel-button-next"
                  onClick={handleNext}
                  aria-label="Next testimonial"
                >
                  ›
                </button>
                
                <div className="carousel-dots">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                      onClick={() => handleDotClick(index)}
                      aria-label={`Go to testimonial ${index + 1}`}
                      aria-current={index === currentIndex ? 'true' : 'false'}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          // Grid layout for desktop
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
