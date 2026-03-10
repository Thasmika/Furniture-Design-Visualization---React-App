import React, { useRef } from 'react';
import { benefits } from '../../data/landingData';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { BenefitCard } from './BenefitCard';
import './BenefitsSection.css';

/**
 * BenefitsSection component displays the key benefits of using the application
 * Benefits are displayed in a responsive grid layout with staggered fade-in animations
 * 
 * Layout:
 * - Mobile (<768px): 1 column
 * - Desktop (>768px): 3 columns
 */
export const BenefitsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });

  return (
    <section
      ref={sectionRef}
      className={`benefits-section ${isVisible ? 'visible' : ''}`}
      id="benefits"
      aria-labelledby="benefits-heading"
    >
      <div className="benefits-container">
        <h2 id="benefits-heading" className="benefits-heading">
          Why Choose FurniVision?
        </h2>
        <p className="benefits-subheading">
          Experience the advantages that make room design effortless
        </p>
        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="benefit-card-wrapper"
            >
              <BenefitCard benefit={benefit} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
