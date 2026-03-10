import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authThunks';
import { useToast } from '../components/Toast';
import './ProfilePage.css';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { saved = [] } = useSelector((state: RootState) => state.design);
  const { showSuccess, showError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: 'Furniture design enthusiast',
  });

  const totalDesigns = saved.length;
  const totalFurniture = saved.reduce((sum, design) => sum + design.furniture.length, 0);
  const memberSince = 'Recently';

  const handleSaveProfile = () => {
    // In a real app, you would save to Firebase here
    showSuccess('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      navigate('/login');
    } catch (err) {
      showError('Failed to logout');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, you would delete the account from Firebase here
      showError('Account deletion is not implemented yet');
    }
  };

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-item" onClick={() => navigate('/')}>
          <span className="sidebar-icon">📊</span>
          <span>Dashboard</span>
        </div>
        <div className="sidebar-item" onClick={() => navigate('/')}>
          <span className="sidebar-icon">📁</span>
          <span>My Designs</span>
        </div>
        <div className="sidebar-item" onClick={() => navigate('/reviews')}>
          <span className="sidebar-icon">⭐</span>
          <span>Reviews</span>
        </div>
        <div className="sidebar-item active">
          <span className="sidebar-icon">👤</span>
          <span>Profile</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <div className="profile-header">
          <h1>My Profile</h1>
          <button type="button" onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>

        <div className="profile-grid">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {profileData.displayName.charAt(0).toUpperCase()}
              </div>
              <button type="button" className="change-avatar-btn">
                📷 Change Photo
              </button>
            </div>

            <div className="profile-info-section">
              {isEditing ? (
                <div className="profile-form">
                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, displayName: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={profileData.email} disabled />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) =>
                        setProfileData({ ...profileData, location: e.target.value })
                      }
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                    <button type="button" onClick={handleSaveProfile} className="btn-save">
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-display">
                  <div className="profile-field">
                    <label>Display Name</label>
                    <div className="field-value">{profileData.displayName}</div>
                  </div>
                  <div className="profile-field">
                    <label>Email</label>
                    <div className="field-value">{profileData.email}</div>
                  </div>
                  <div className="profile-field">
                    <label>Phone</label>
                    <div className="field-value">
                      {profileData.phone || 'Not provided'}
                    </div>
                  </div>
                  <div className="profile-field">
                    <label>Location</label>
                    <div className="field-value">
                      {profileData.location || 'Not provided'}
                    </div>
                  </div>
                  <div className="profile-field">
                    <label>Bio</label>
                    <div className="field-value">{profileData.bio}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="btn-edit"
                  >
                    ✏️ Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-icon">📐</div>
              <div className="stat-info">
                <div className="stat-number">{totalDesigns}</div>
                <div className="stat-label">Total Designs</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🪑</div>
              <div className="stat-info">
                <div className="stat-number">{totalFurniture}</div>
                <div className="stat-label">Furniture Pieces</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <div className="stat-number">{memberSince}</div>
                <div className="stat-label">Member Since</div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="account-settings-card">
            <h3>Account Settings</h3>
            <div className="settings-section">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Email Notifications</div>
                  <div className="setting-description">
                    Receive updates about your designs
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked aria-label="Email Notifications" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Design Auto-Save</div>
                  <div className="setting-description">
                    Automatically save your work every 5 minutes
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked aria-label="Design Auto-Save" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title">Marketing Emails</div>
                  <div className="setting-description">
                    Receive tips and product updates
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" aria-label="Marketing Emails" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="danger-zone-card">
            <h3>Danger Zone</h3>
            <div className="danger-actions">
              <div className="danger-item">
                <div className="danger-info">
                  <div className="danger-title">Delete Account</div>
                  <div className="danger-description">
                    Permanently delete your account and all your designs
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="btn-danger"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
