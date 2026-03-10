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
import { createSVGPlaceholder } from '../utils/thumbnailGenerator';
import { useToast } from '../components/Toast';
import './MyDesignsPage.css';

export const MyDesignsPage = () => {
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
      // Error handled by thunk
    }
  };

  const handleNewDesign = () => {
    if (!user) return;

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
      // Error handled by thunk
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
      // Error handled by thunk
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  const handleLogout = () => {
    navigate('/');
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

  return (
    <div className="my-designs-page">
      <header className="my-designs-header">
        <div className="header-content">
          <h1>🪑 My Designs</h1>
          <div className="header-actions">
            <button type="button" onClick={handleNewDesign} className="btn-new-design">
              + New Design
            </button>
            <button type="button" onClick={handleLogout} className="btn-back">
              Back to Home
            </button>
          </div>
        </div>
      </header>

      <main className="my-designs-content">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your designs...</p>
          </div>
        ) : saved.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h2>No designs yet</h2>
            <p>Start creating your first furniture design!</p>
            <button type="button" onClick={handleNewDesign} className="btn-create-first">
              Create Your First Design
            </button>
          </div>
        ) : (
          <div className="designs-grid">
            {saved.map((design) => {
              const thumbnail = createSVGPlaceholder(design.room.shape, design.furniture.length);
              
              return (
                <div key={design.id} className="design-card">
                  <div className="card-thumbnail">
                    <img 
                      src={thumbnail} 
                      alt={design.name}
                      className="thumbnail-image"
                    />
                    <div className="card-overlay">
                      <button
                        type="button"
                        onClick={() => handleLoadDesign(design.id)}
                        className="btn-open-design"
                      >
                        Open Design
                      </button>
                    </div>
                  </div>
                  <div className="card-info">
                    <h3 className="design-name">{design.name}</h3>
                    <div className="design-meta">
                      <span className="meta-item">
                        <span className="meta-icon">🏠</span>
                        {design.room.shape}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">🪑</span>
                        {design.furniture.length} items
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">📏</span>
                        {design.room.dimensions.width} × {design.room.dimensions.length} {design.room.unit}
                      </span>
                    </div>
                    <div className="design-date">
                      Last updated: {formatDate(design.updatedAt)}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      type="button"
                      onClick={() => handleLoadDesign(design.id)}
                      className="btn-edit"
                    >
                      Edit
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
            })}
          </div>
        )}
      </main>

      {deleteConfirmId && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Design?</h2>
            <p>Are you sure you want to delete this design? This action cannot be undone.</p>
            <div className="modal-actions">
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
