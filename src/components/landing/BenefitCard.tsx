import React from 'react';
import type { Benefit } from '../../types/landing';
import './BenefitCard.css';

const BENEFIT_ICONS: Record<string, React.ReactNode> = {
  'time-saving': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  'cost-effective': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  'professional': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

interface BenefitCardProps {
  benefit: Benefit;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ benefit }) => {
  const icon = BENEFIT_ICONS[benefit.icon] ?? <span>{benefit.icon}</span>;
  return (
    <div className="benefit-card" data-testid={`benefit-card-${benefit.id}`}>
      <div className="benefit-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="benefit-title">{benefit.title}</h3>
      <p className="benefit-description">{benefit.description}</p>
    </div>
  );
};
