import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { saveDesign as saveDesignThunk } from '../store/slices/designThunks';
import { generateDesignThumbnail } from '../utils/thumbnailGenerator';
import { useToast } from './Toast';
import './SaveDesignDialog.css';

interface SaveDesignDialogProps {
  onClose: () => void;
}

export const SaveDesignDialog = ({ onClose }: SaveDesignDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { current, loading, error } = useSelector((state: RootState) => state.design);
  const [designName, setDesignName] = useState(current?.name || 'Untitled Design');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSave = async () => {
    if (!current) return;

    // Generate thumbnail from 3D canvas or create placeholder
    const thumbnail = generateDesignThumbnail(
      current.room.shape,
      current.furniture.length
    );

    // Update design name and thumbnail
    const designToSave = {
      ...current,
      name: designName,
      thumbnail,
      updatedAt: new Date(),
    };

    try {
      await dispatch(
        saveDesignThunk(
          designToSave,
          () => {
            setSaveSuccess(true);
            showSuccess('Design saved successfully!');
            // Auto-close after showing success message
            setTimeout(() => {
              onClose();
            }, 1500);
          },
          (errorMsg) => {
            showError(errorMsg);
          }
        )
      );
    } catch (err) {
      // Error already handled by thunk callback
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDesignName(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleSave();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content save-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Save Design</h2>
        
        {saveSuccess ? (
          <div className="success-message">
            ✓ Design saved successfully!
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="design-name">Design Name</label>
              <input
                id="design-name"
                type="text"
                value={designName}
                onChange={handleNameChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter design name"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="cancel-button"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="save-button"
                disabled={loading || !designName.trim()}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
