import React from 'react';
import type { Feature } from '../../types/landing';
import './FeatureCard.css';

interface FeatureCardProps {
  feature: Feature;
}

/**
 * FeatureCard component displays a single feature with icon, title, and description
 * Includes hover effects for interactivity
 * 
 * @param feature - Feature object containing id, icon, title, description, order
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  return (
    <div className="feature-card" data-testid={`feature-card-${feature.id}`}>
      <div className="feature-icon" aria-hidden="true">
        {feature.icon}
      </div>
      <h3 className="feature-title">{feature.title}</h3>
      <p className="feature-description">{feature.description}</p>
    </div>
  );
};
