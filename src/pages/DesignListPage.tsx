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

  return (
    <div className="design-list-page">
      <header className="design-list-header">
        <h1>🪑 My Designs</h1>
        <button type="button" onClick={handleNewDesign} className="new-design-button">
          + New Design
        </button>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div>Loading designs...</div>
        </div>
      ) : (
        <div className="designs-grid">
          {saved.length === 0 ? (
            <div className="empty-state">
              <p>No designs yet. Create your first design!</p>
            </div>
          ) : (
            saved.map((design) => (
              <div key={design.id} className="design-card">
                <div className="design-card-header">
                  <h3>{design.name}</h3>
                  <span className="design-date">
                    {formatDate(design.updatedAt)}
                  </span>
                </div>
                <div className="design-card-info">
                  <p>Room: {design.room.shape}</p>
                  <p>Furniture: {design.furniture.length} pieces</p>
                </div>
                <div className="design-card-actions">
                  <button
                    type="button"
                    onClick={() => handleLoadDesign(design.id)}
                    className="load-button"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(design.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this design? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="confirm-delete-button"
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
