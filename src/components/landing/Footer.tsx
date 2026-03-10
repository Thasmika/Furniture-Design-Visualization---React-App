import { Link } from 'react-router-dom';
import './Footer.css';

interface FooterProps {
  isAuthenticated: boolean;
}

export const Footer = ({ isAuthenticated }: FooterProps) => {
  return (
    <footer className="footer" aria-label="Site footer">
      <div className="footer-background" aria-hidden="true" />
      <div className="footer-content">
        <div className="footer-section footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-icon" aria-hidden="true">🪑</span>
            <span className="footer-logo-text">FurniVision</span>
          </div>
          <p className="footer-tagline">
            Professional 2D/3D furniture visualization tool
          </p>
        </div>

        <div className="footer-section footer-links">
          <h3 className="footer-heading">Quick Links</h3>
          <nav aria-label="Footer navigation">
            <ul className="footer-nav-list">
              <li>
                <Link to="/contact" className="footer-link">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="footer-link">
                  Reviews
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to="/profile" className="footer-link">
                    Profile
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>

        <div className="footer-section footer-social">
          <h3 className="footer-heading">Follow Us</h3>
          <div className="footer-social-links">
            <a
              href="https://instagram.com/furnivision"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Follow us on Instagram"
            >
              <span className="footer-social-icon" aria-hidden="true">📷</span>
              <span className="footer-social-text">Instagram</span>
            </a>
            <a
              href="https://tiktok.com/@furnivision"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Follow us on TikTok"
            >
              <span className="footer-social-icon" aria-hidden="true">🎵</span>
              <span className="footer-social-text">TikTok</span>
            </a>
            <a
              href="https://youtube.com/@furnivision"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Subscribe on YouTube"
            >
              <span className="footer-social-icon" aria-hidden="true">📺</span>
              <span className="footer-social-text">YouTube</span>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          © 2026 FurniVision Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
