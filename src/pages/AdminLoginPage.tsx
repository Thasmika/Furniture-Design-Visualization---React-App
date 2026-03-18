import { useState } from 'react';
import type { FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { authenticateUser } from '../store/slices/authThunks';
import { useToast } from '../components/Toast';
import type { AppDispatch, RootState } from '../store';
import './LoginPage.css';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { showError, showSuccess } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(authenticateUser(email, password));
      showSuccess('Admin login successful!');
      navigate('/');
    } catch (err) {
      showError(error || 'Admin login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Furniture Design Visualizer</h1>
        <h2>Admin Login</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter admin email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Admin Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter admin password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="login-button admin-login-button">
            {loading ? 'Logging in...' : 'Admin Login'}
          </button>
        </form>

        <button 
          type="button"
          onClick={() => navigate('/login')}
          className="user-login-link-button"
          disabled={loading}
        >
          Back to User Login
        </button>

        <div className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};
