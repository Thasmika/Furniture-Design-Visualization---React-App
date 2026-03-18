import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import './AppNavBar.css';

export const AppNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  // Debug: Log user object to console
  console.log('AppNavBar - Current user:', user);
  console.log('AppNavBar - User role:', user?.role);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="app-navbar">
      <div className="app-navbar-container">
        {/* Logo/Brand */}
        <div className="app-navbar-brand" onClick={() => navigate('/')}>
          <span className="app-brand-name">FurniVision</span>
        </div>

        {/* Navigation Links */}
        <div className="app-navbar-links">
          <button
            type="button"
            onClick={() => navigate('/editor')}
            className={`app-nav-link ${isActive('/editor') ? 'active' : ''}`}
          >
            New Design
          </button>
          <button
            type="button"
            onClick={() => navigate('/my-designs')}
            className={`app-nav-link ${isActive('/my-designs') ? 'active' : ''}`}
          >
            My Designs
          </button>
          {user?.role === 'admin' && (
            <button
              type="button"
              onClick={() => navigate('/manage')}
              className={`app-nav-link ${isActive('/manage') ? 'active' : ''}`}
            >
              Manage
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/reviews')}
            className={`app-nav-link ${isActive('/reviews') ? 'active' : ''}`}
          >
            Reviews
          </button>
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className={`app-nav-link ${isActive('/contact') ? 'active' : ''}`}
          >
            Contact
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className={`app-nav-link ${isActive('/profile') ? 'active' : ''}`}
          >
            Profile
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="app-navbar-user">
            <span className="user-email-display">{user.email}</span>
          </div>
        )}
      </div>
    </nav>
  );
};
