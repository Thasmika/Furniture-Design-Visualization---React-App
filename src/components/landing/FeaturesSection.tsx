import React, { useRef } from 'react';
import { features } from '../../data/landingData';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { FeatureCard } from './FeatureCard';
import './FeaturesSection.css';

/**
 * FeaturesSection component displays the key features of the application
 * Features are displayed in a responsive grid layout with slide-in animation
 * 
 * Layout:
 * - Mobile (<768px): 1 column
 * - Tablet (768-1024px): 2 columns
 * - Desktop (>1024px): 4 columns
 */
export const FeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });

  return (
    <section
      ref={sectionRef}
      className={`features-section ${isVisible ? 'visible' : ''}`}
      id="features"
      aria-labelledby="features-heading"
    >
      <div className="features-container">
        <h2 id="features-heading" className="features-heading">
          Powerful Features for Your Design Needs
        </h2>
        <p className="features-subheading">
          Everything you need to create stunning room designs
        </p>
        <div className="features-grid">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};
