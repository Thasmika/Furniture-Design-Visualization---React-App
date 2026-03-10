import React from 'react';
import type { Benefit } from '../../types/landing';
import './BenefitCard.css';

interface BenefitCardProps {
  benefit: Benefit;
}

/**
 * BenefitCard component displays a single benefit with icon, title, and description
 * Uses visual hierarchy to emphasize key benefits
 * 
 * @param benefit - Benefit object containing id, icon, title, description, order
 */
export const BenefitCard: React.FC<BenefitCardProps> = ({ benefit }) => {
  return (
    <div className="benefit-card" data-testid={`benefit-card-${benefit.id}`}>
      <div className="benefit-icon" aria-hidden="true">
        {benefit.icon}
      </div>
      <h3 className="benefit-title">{benefit.title}</h3>
      <p className="benefit-description">{benefit.description}</p>
    </div>
  );
};
