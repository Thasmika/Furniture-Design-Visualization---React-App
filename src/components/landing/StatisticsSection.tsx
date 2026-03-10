import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, AppState } from '../../store/types';
import { fetchStatisticsAsync } from '../../store/slices/landingSlice';
import { StatCard } from './StatCard';
import './StatisticsSection.css';

/**
 * StatisticsSection component displays application statistics
 * Connects to Redux statistics state and displays fallback values on error
 * Implements responsive grid layout (2 columns mobile, 4 columns desktop)
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7, 19.4
 */
export const StatisticsSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: AppState) => state.landing.statistics);

  useEffect(() => {
    // Fetch statistics on mount
    dispatch(fetchStatisticsAsync());
  }, [dispatch]);

  // Fallback values when data is unavailable or on error
  const fallbackStats = {
    userCount: 1000,
    designCount: 5000,
    furnitureCount: 200,
  };

  // Use actual data if available, otherwise use fallback
  const stats = error || !data ? fallbackStats : data;

  const statisticsData = [
    {
      id: 'users',
      icon: '👥',
      number: stats.userCount,
      label: 'Active Users',
    },
    {
      id: 'designs',
      icon: '🎨',
      number: stats.designCount,
      label: 'Designs Created',
    },
    {
      id: 'furniture',
      icon: '🪑',
      number: stats.furnitureCount,
      label: 'Furniture Pieces',
    },
    {
      id: 'satisfaction',
      icon: '⭐',
      number: 98,
      label: 'Satisfaction Rate',
    },
  ];

  return (
    <section 
      className="statistics-section" 
      id="statistics"
      aria-labelledby="statistics-heading"
    >
      <div className="statistics-container">
        <h2 id="statistics-heading" className="statistics-heading">
          By the Numbers
        </h2>
        <p className="statistics-subheading">
          Join thousands of users creating beautiful spaces
        </p>
        
        {loading && (
          <div className="statistics-loading" role="status" aria-live="polite">
            Loading statistics...
          </div>
        )}

        <div className="statistics-grid">
          {statisticsData.map((stat) => (
            <StatCard
              key={stat.id}
              id={stat.id}
              icon={stat.icon}
              number={stat.number}
              label={stat.label}
            />
          ))}
        </div>

        {error && !loading && (
          <p className="statistics-error" role="alert">
            Statistics temporarily unavailable. Showing approximate values.
          </p>
        )}
      </div>
    </section>
  );
};
