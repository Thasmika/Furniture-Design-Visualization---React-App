import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export const HeroSection = ({ isAuthenticated }: HeroSectionProps) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <section 
      className="hero-section" 
      id="hero"
      aria-labelledby="hero-headline"
    >
      <div className="hero-background" aria-hidden="true" />
      <div className="hero-content">
        <h1 id="hero-headline" className="hero-headline">
          Design Your Dream Space with FurniVision
        </h1>
        <p className="hero-tagline">
          Professional 2D/3D furniture visualization tool for interior designers and homeowners. 
          Plan your perfect space with precision and confidence.
        </p>
        {!isAuthenticated && (
          <div className="hero-cta-buttons">
            <button
              type="button"
              onClick={handleGetStarted}
              className="hero-cta-button hero-cta-primary"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={handleSignIn}
              className="hero-cta-button hero-cta-secondary"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
