import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { features, benefits } from '../../data/landingData';
import './LandingPage.css';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!user;

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Design Your Dream Space with FurniVision</h1>
          <p className="hero-tagline">
            Professional 2D/3D furniture visualization tool for interior designers and homeowners
          </p>
          <div className="hero-cta">
            {isAuthenticated ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate('/designs')}
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Powerful Features</h2>
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2>Why Choose FurniVision?</h2>
        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="benefit-card">
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Transform Your Space?</h2>
        <p>Join thousands of users creating beautiful room designs</p>
        {isAuthenticated ? (
          <button
            type="button"
            className="btn-primary-large"
            onClick={() => navigate('/designs')}
          >
            Open Dashboard
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary-large"
            onClick={() => navigate('/register')}
          >
            Start Designing Now
          </button>
        )}
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>FurniVision</h3>
            <p>Design your perfect space</p>
          </div>
          <div className="footer-links">
            <button type="button" onClick={() => navigate('/contact')}>Contact</button>
            <button type="button" onClick={() => navigate('/reviews')}>Reviews</button>
            {isAuthenticated && (
              <button type="button" onClick={() => navigate('/profile')}>Profile</button>
            )}
          </div>
          <div className="footer-copyright">
            © 2026 FurniVision Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
