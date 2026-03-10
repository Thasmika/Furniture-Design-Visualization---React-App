import { useState } from 'react';
import type { FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../store/slices/authThunks';
import { useToast } from '../components/Toast';
import type { AppDispatch, RootState } from '../store';
import './RegisterPage.css';

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { showError, showSuccess } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate password match
    if (password !== confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setValidationError(errorMsg);
      showError(errorMsg);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters';
      setValidationError(errorMsg);
      showError(errorMsg);
      return;
    }

    try {
      await dispatch(registerUser(email, password));
      showSuccess('Account created successfully!');
      navigate('/');
    } catch (err) {
      showError(error || 'Registration failed. Please try again.');
    }
  };

  const displayError = validationError || error;

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>🪑 Furniture Design Visualizer</h1>
        <h2>Create Account</h2>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Confirm your password"
              minLength={6}
            />
          </div>

          {displayError && (
            <div className="error-message" role="alert">
              {displayError}
            </div>
          )}

          <button type="submit" disabled={loading} className="register-button">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};
