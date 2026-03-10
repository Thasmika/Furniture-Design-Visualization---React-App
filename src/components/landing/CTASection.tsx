import { useNavigate } from 'react-router-dom';
import './CTASection.css';

interface CTASectionProps {
  isAuthenticated: boolean;
}

export const CTASection = ({ isAuthenticated }: CTASectionProps) => {
  const navigate = useNavigate();

  const handleCTAClick = () => {
    if (isAuthenticated) {
      navigate('/editor');
    } else {
      navigate('/register');
    }
  };

  return (
    <section 
      className="cta-section" 
      id="cta"
      aria-labelledby="cta-headline"
    >
      <div className="cta-background" aria-hidden="true" />
      <div className="cta-content">
        <h2 id="cta-headline" className="cta-headline">Ready to Transform Your Space?</h2>
        <p className="cta-description">
          Join thousands of users creating beautiful room designs with FurniVision. 
          Start visualizing your dream space today.
        </p>
        <button
          type="button"
          onClick={handleCTAClick}
          className="cta-button"
        >
          Start Designing Now
        </button>
      </div>
    </section>
  );
};
