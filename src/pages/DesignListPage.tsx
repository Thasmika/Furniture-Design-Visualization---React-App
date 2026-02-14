import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import { createDesign } from '../store/slices/designSlice';
import {
  loadDesigns as loadDesignsThunk,
  loadDesign as loadDesignThunk,
  deleteDesign as deleteDesignThunk,
} from '../store/slices/designThunks';
import { createDesign as createDesignModel } from '../models/Design';
import { createRoom } from '../models/Room';
import { generatePlaceholderThumbnail, createSVGPlaceholder } from '../utils/thumbnailGenerator';
import { useToast } from '../components/Toast';
import './DesignListPage.css';

export const DesignListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { saved = [], loading, error } = useSelector((state: RootState) => state.design);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (user) {
      handleLoadDesigns();
    }
  }, [user]);

  const handleLoadDesigns = async () => {
    if (!user) return;

    try {
      await dispatch(loadDesignsThunk(user.uid, (errorMsg) => {
        showError(errorMsg);
      }));
    } catch (err) {
      // Error already handled by thunk callback
    }
  };

  const handleNewDesign = () => {
    if (!user) return;

    // Create a new design with default room
    const defaultRoom = createRoom(
      'rectangular',
      { width: 20, length: 15, radius: 0 },
      { walls: '#E8E8E8', floor: '#D4C5B9', ceiling: '#FFFFFF' },
      'feet'
    );

    const newDesign = createDesignModel(
      user.uid,
      'Untitled Design',
      defaultRoom
    );

    dispatch(createDesign(newDesign));
    navigate('/editor');
  };

  const handleLoadDesign = async (designId: string) => {
    if (!user) return;

    try {
      await dispatch(loadDesignThunk(user.uid, designId, (errorMsg) => {
        showError(errorMsg);
      }));
      navigate('/editor');
    } catch (err) {
      // Error already handled by thunk callback
    }
  };

  const handleDeleteClick = (designId: string) => {
    setDeleteConfirmId(designId);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !deleteConfirmId) return;

    try {
      await dispatch(
        deleteDesignThunk(
          user.uid,
          deleteConfirmId,
          () => {
            showSuccess('Design deleted successfully');
            setDeleteConfirmId(null);
          },
          (errorMsg) => {
            showError(errorMsg);
            setDeleteConfirmId(null);
          }
        )
      );
    } catch (err) {
      // Error already handled by thunk callback
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalFurniture = saved.reduce((sum, design) => sum + design.furniture.length, 0);
  const totalDesigns = saved.length;
  const lastUpdated = saved.length > 0 ? saved[0].updatedAt : new Date();

  // Calculate furniture type distribution for bar chart
  const furnitureTypeCount = saved.reduce((acc, design) => {
    design.furniture.forEach(item => {
      acc[item.type] = (acc[item.type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const chartData = [
    { type: 'Chair', count: furnitureTypeCount['chair'] || 0, color: '#0f766e' },
    { type: 'Table', count: furnitureTypeCount['table'] || 0, color: '#14b8a6' },
    { type: 'Couch', count: furnitureTypeCount['couch'] || 0, color: '#2dd4bf' },
    { type: 'Bed', count: furnitureTypeCount['bed'] || 0, color: '#5eead4' },
    { type: 'Desk', count: furnitureTypeCount['desk'] || 0, color: '#99f6e4' },
    { type: 'Shelf', count: furnitureTypeCount['shelf'] || 0, color: '#ccfbf1' },
  ];

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="design-list-page">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="navbar-brand">
          <span className="navbar-icon">🪑</span>
          <span className="navbar-title">FurniVision</span>
        </div>
        <div className="navbar-tagline">Design Your Dream Space</div>
      </nav>

      <div className="page-content-wrapper">
        {/* Sidebar */}
        <aside className="sidebar">
        <div className="sidebar-item active">
          <span className="sidebar-icon">📊</span>
          <span>Dashboard</span>
        </div>
        <div className="sidebar-item" onClick={handleNewDesign}>
          <span className="sidebar-icon">➕</span>
          <span>New Design</span>
        </div>
        <div className="sidebar-item">
          <span className="sidebar-icon">📁</span>
          <span>My Designs</span>
        </div>
        <div className="sidebar-item" onClick={() => navigate('/reviews')}>
          <span className="sidebar-icon">⭐</span>
          <span>Reviews</span>
        </div>
        <div className="sidebar-item" onClick={() => navigate('/profile')}>
          <span className="sidebar-icon">👤</span>
          <span>Profile</span>
        </div>
        <div className="sidebar-item" onClick={() => navigate('/contact')}>
          <span className="sidebar-icon">📧</span>
          <span>Contact Us</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <span className="stat-icon">📐</span>
            </div>
            <div className="stat-info">
              <div className="stat-number">{totalDesigns}</div>
              <div className="stat-label">Total Designs</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <span className="stat-icon">🪑</span>
            </div>
            <div className="stat-info">
              <div className="stat-number">{totalFurniture}</div>
              <div className="stat-label">Furniture Pieces</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <span className="stat-icon">📅</span>
            </div>
            <div className="stat-info">
              <div className="stat-number">{saved.length > 0 ? Math.floor((Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24)) : 0}</div>
              <div className="stat-label">Days Since Update</div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="analytics-section">
          <h3>Furniture Distribution Analysis</h3>
          <div className="bar-chart">
            {chartData.map((item) => (
              <div key={item.type} className="bar-item">
                <div className="bar-label">{item.type}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      width: `${(item.count / maxCount) * 100}%`,
                      backgroundColor: item.color 
                    }}
                  >
                    <span className="bar-count">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Designs Section */}
        <div className="designs-section">
          <div className="designs-header">
            <h2>My Designs</h2>
            <button type="button" onClick={handleNewDesign} className="new-design-btn">
              + New Design
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <div>Loading designs...</div>
            </div>
          ) : (
            <div className="designs-grid">
              {saved.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No designs yet</h3>
                  <p>Create your first design to get started!</p>
                  <button type="button" onClick={handleNewDesign} className="empty-btn">
                    Create Design
                  </button>
                </div>
              ) : (
                saved.map((design) => {
                  // Always use SVG placeholder for consistency
                  const thumbnail = createSVGPlaceholder(design.room.shape, design.furniture.length);
                  
                  return (
                  <div key={design.id} className="design-card">
                    <div className="card-preview">
                      <img 
                        src={thumbnail} 
                        alt={design.name}
                        className="design-thumbnail-image"
                      />
                    </div>
                    <div className="card-body">
                      <div className="card-title-row">
                        <h3>{design.name}</h3>
                        <span className="room-badge">{design.room.shape}</span>
                      </div>
                      <div className="card-details">
                        <div className="detail-item">
                          <span className="detail-icon">🪑</span>
                          <span>{design.furniture.length} pieces</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">📏</span>
                          <span>{design.room.dimensions.width} × {design.room.dimensions.length} {design.room.unit}</span>
                        </div>
                      </div>
                      <div className="card-timestamp">
                        {formatDate(design.updatedAt)}
                      </div>
                    </div>
                    <div className="card-actions">
                      <button
                        type="button"
                        onClick={() => handleLoadDesign(design.id)}
                        className="btn-open"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(design.id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
      </div>

      {/* Company Footer */}
      <footer className="company-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo-icon">🪑</div>
            <div className="logo-text">
              <h3>FurniVision</h3>
              <p className="tagline">Design Your Dream Space</p>
            </div>
          </div>
          <div className="footer-divider"></div>
          <div className="footer-info">
            <p className="copyright">© 2026 FurniVision Inc. All rights reserved.</p>
            <p className="motto">Transforming spaces, one design at a time</p>
          </div>
          <div className="footer-social">
            <a href="https://www.instagram.com/furnivision" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@furnivision" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@furnivision" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this design? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="btn-confirm-delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
