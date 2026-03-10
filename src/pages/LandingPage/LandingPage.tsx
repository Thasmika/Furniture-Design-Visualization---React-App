import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppState, AppDispatch } from '../../store';
import { fetchStatisticsAsync, fetchTestimonialsAsync } from '../../store/slices/landingSlice';
import {
  LandingNavBar,
  HeroSection,
  FeaturesSection,
  AboutSection,
  BenefitsSection,
  StatisticsSection,
  TestimonialsSection,
  CTASection,
  Footer,
} from '../../components/landing';
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
  const userEmail = user?.email || null;

  // Track scroll position for navbar styling
  const [isScrolled, setIsScrolled] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchStatisticsAsync());
    dispatch(fetchTestimonialsAsync());
  }, [dispatch]);

  // Track scroll position for navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Header with Navigation */}
      <header>
        <LandingNavBar
          isScrolled={isScrolled}
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
        />
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

        {/* Testimonials Section */}
        <section id="testimonials">
          <TestimonialsSection />
        </section>

        {/* CTA Section */}
        <CTASection isAuthenticated={isAuthenticated} />
      </main>

      {/* Footer */}
      <Footer isAuthenticated={isAuthenticated} />
    </div>
  );
};
