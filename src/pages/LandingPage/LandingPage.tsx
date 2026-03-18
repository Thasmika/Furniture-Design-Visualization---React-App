import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppState, AppDispatch } from '../../store';
import { fetchStatisticsAsync } from '../../store/slices/landingSlice';
import {
  HeroSection,
  FeaturesSection,
  AboutSection,
  BenefitsSection,
  StatisticsSection,
  FurnitureShowcaseSection,
  CTASection,
  Footer,
} from '../../components/landing';
import { AppNavBar } from '../../components/AppNavBar';
import './LandingPage.css';

/**
 * LandingPage - Main container component for the landing page
 * 
 * Responsibilities:
 * - Connects to Redux auth and landing state
 * - Implements scroll position tracking for navbar
 * - Composes all landing page sections
 * - Dispatches fetchStatistics and fetchTestimonials on mount
 * - Uses semantic HTML structure (header, nav, main, section, footer)
 * 
 * Requirements: 1.1, 1.2, 1.3, 7.1, 8.1, 16.1, 16.6, 18.1, 19.1, 20.1
 */
export const LandingPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: AppState) => state.auth);
  const isAuthenticated = !!user;

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchStatisticsAsync());
  }, [dispatch]);

  return (
    <div className="landing-page">
      {/* Header with Navigation */}
      <header>
        <AppNavBar />
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection isAuthenticated={isAuthenticated} />

        {/* Features Section */}
        <FeaturesSection />

        {/* About Section */}
        <AboutSection />

        {/* Benefits Section */}
        <BenefitsSection />

        {/* Statistics Section */}
        <StatisticsSection />

        {/* Furniture Showcase Section */}
        <section id="furniture">
          <FurnitureShowcaseSection />
        </section>

        {/* CTA Section */}
        <CTASection isAuthenticated={isAuthenticated} />
      </main>

      {/* Footer */}
      <Footer isAuthenticated={isAuthenticated} />
    </div>
  );
};
