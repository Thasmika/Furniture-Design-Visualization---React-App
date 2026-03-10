import React, { useRef } from 'react';
import { useCountAnimation } from '../../hooks/useCountAnimation';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import './StatCard.css';

interface StatCardProps {
  icon: string;
  number: number;
  label: string;
  id: string;
}

/**
 * StatCard component displays a single statistic with animated counter
 * Uses useCountAnimation hook for number animation
 * Triggers animation when entering viewport using useIntersectionObserver
 * 
 * @param icon - Emoji or icon to display
 * @param number - The target number to count up to
 * @param label - Descriptive label for the statistic
 * @param id - Unique identifier for the stat card
 */
export const StatCard: React.FC<StatCardProps> = ({ icon, number, label, id }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef, { threshold: 0.3 });
  const animatedValue = useCountAnimation(number, 1000, isVisible);

  return (
    <div 
      ref={cardRef}
      className="stat-card" 
      data-testid={`stat-card-${id}`}
    >
      <div className="stat-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="stat-number" aria-live="polite">
        {animatedValue.toLocaleString()}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
};
