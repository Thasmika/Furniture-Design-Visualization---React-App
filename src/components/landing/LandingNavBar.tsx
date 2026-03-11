import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import './LandingNavBar.css';

interface LandingNavBarProps {
  isScrolled: boolean;
  isAuthenticated: boolean;
  userEmail?: string | null;
}

export const LandingNavBar = ({ isScrolled, isAuthenticated, userEmail }: LandingNavBarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Trap focus in mobile menu when open
  useFocusTrap(mobileMenuRef, mobileMenuOpen);

  const handleSmoothScroll = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav 
      className={`landing-navbar ${isScrolled ? 'scrolled' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand">
          <button
            type="button"
            onClick={() => handleNavigation('/')}
            className="brand-button"
            aria-label="FurniVision home"
          >
            <span className="brand-icon">🪑</span>
            <span className="brand-name">FurniVision</span>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="navbar-links desktop-only">
          <button
            type="button"
            onClick={() => handleSmoothScroll('features')}
            className="nav-link"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => handleSmoothScroll('about')}
            className="nav-link"
          >
            About
          </button>
          <button
            type="button"
            onClick={() => handleSmoothScroll('testimonials')}
            className="nav-link"
          >
            Testimonials
          </button>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="navbar-actions desktop-only">
          {!isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => handleNavigation('/login')}
                className="nav-button nav-button-secondary"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleNavigation('/register')}
                className="nav-button nav-button-primary"
              >
                Register
              </button>
            </>
          ) : (
            <>
              <span className="user-email">{userEmail}</span>
              <button
                type="button"
                onClick={() => handleNavigation('/editor')}
                className="nav-button nav-button-secondary"
                title="Create a new design"
              >
                ➕ New Design
              </button>
              <button
                type="button"
                onClick={() => handleNavigation('/my-designs')}
                className="nav-button nav-button-secondary"
                title="View your saved designs"
              >
                📁 My Designs
              </button>
              <button
                type="button"
                onClick={() => handleNavigation('/reviews')}
                className="nav-button nav-button-secondary"
                title="View reviews"
              >
                ⭐ Reviews
              </button>
              <button
                type="button"
                onClick={() => handleNavigation('/profile')}
                className="nav-button nav-button-secondary"
                title="View your profile"
              >
                👤 Profile
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="nav-button nav-button-primary"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <button
          type="button"
          className="hamburger-menu mobile-only"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <span className="hamburger-icon">
            {mobileMenuOpen ? '✕' : '☰'}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        id="mobile-menu"
        className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-menu-content">
          {/* Mobile Navigation Links */}
          <button
            type="button"
            onClick={() => handleSmoothScroll('features')}
            className="mobile-nav-link"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => handleSmoothScroll('about')}
            className="mobile-nav-link"
          >
            About
          </button>
          <button
            type="button"
            onClick={() => handleSmoothScroll('testimonials')}
            className="mobile-nav-link"
          >
            Testimonials
          </button>

          <div className="mobile-menu-divider" />

          {/* Mobile Auth Buttons */}
          {!isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => handleNavigation('/login')}
                className="mobile-nav-button mobile-nav-button-secondary"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleNavigation('/register')}
                className="mobile-nav-button mobile-nav-button-primary"
              >
                Register
              </button>
            </>
          ) : (
            <>
              <div className="mobile-user-info">
                <span className="mobile-user-email">{userEmail}</span>
              </div>
              <button
                type="button"
                onClick={() => handleNavigation('/editor')}
                className="mobile-nav-button mobile-nav-button-secondary"
              >
                ➕ New Design
              </button>
              <button
                type="button"
                onClick={() => handleNavigation('/my-designs')}
                className="mobile-nav-button mobile-nav-button-secondary"
              >
                📁 My Designs
              </button>
              <button
                type="button"
                onClick={() => handleNavigation('/reviews')}
                className="mobile-nav-button mobile-nav-button-secondary"
              >
                ⭐ Reviews
              </button>
              <button
                type="button"
                onClick={() => handleNavigation('/profile')}
                className="mobile-nav-button mobile-nav-button-secondary"
              >
                👤 Profile
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="mobile-nav-button mobile-nav-button-primary"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
