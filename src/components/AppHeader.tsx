import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import { logout } from '../store/slices/authThunks';
import { undo, redo, canUndo, canRedo } from '../store';
import { SaveDesignDialog } from './SaveDesignDialog';
import './AppHeader.css';

export const AppHeader = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isDirty } = useSelector((state: RootState) => state.design);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [undoEnabled, setUndoEnabled] = useState(false);
  const [redoEnabled, setRedoEnabled] = useState(false);

  // Update undo/redo button states
  useEffect(() => {
    const updateButtonStates = () => {
      setUndoEnabled(canUndo());
      setRedoEnabled(canRedo());
    };

    // Update immediately
    updateButtonStates();

    // Update on any state change
    const interval = setInterval(updateButtonStates, 100);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          dispatch(undo());
        }
      }
      // Ctrl+Y or Cmd+Shift+Z for redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        if (canRedo()) {
          dispatch(redo());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  const handleUndo = () => {
    if (canUndo()) {
      dispatch(undo());
    }
  };

  const handleRedo = () => {
    if (canRedo()) {
      dispatch(redo());
    }
  };

  const handleSaveClick = () => {
    setShowSaveDialog(true);
  };

  const handleCloseSaveDialog = () => {
    setShowSaveDialog(false);
  };

  const handleMyDesigns = () => {
    navigate('/designs');
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      navigate('/login');
    } catch (err) {
      // Error handled by Redux
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <h1>🪑 Furniture Design Visualizer</h1>
        </div>
        
        <div className="header-center">
          <button
            type="button"
            onClick={handleUndo}
            className="header-button undo-button"
            disabled={!undoEnabled}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            type="button"
            onClick={handleRedo}
            className="header-button redo-button"
            disabled={!redoEnabled}
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            className="header-button save-button"
          >
            💾 Save
            {isDirty && <span className="unsaved-indicator">●</span>}
          </button>
          <button
            type="button"
            onClick={handleMyDesigns}
            className="header-button designs-button"
          >
            📁 My Designs
          </button>
        </div>

        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="header-button logout-button"
          >
            Logout
          </button>
        </div>
      </header>

      {showSaveDialog && <SaveDesignDialog onClose={handleCloseSaveDialog} />}
    </>
  );
};
