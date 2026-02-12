import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import { logout } from '../store/slices/authThunks';
import { undo, redo, canUndo, canRedo } from '../store';
import { SaveDesignDialog } from './SaveDesignDialog';
import { Tooltip } from './Tooltip';
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

  const handleHome = () => {
    navigate('/designs');
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
          <Tooltip content="Go to dashboard">
            <button
              type="button"
              onClick={handleHome}
              className="header-button home-button"
            >
              🏠 Home
            </button>
          </Tooltip>
          <h1>🪑 Furniture Design Visualizer</h1>
        </div>
        
        <div className="header-center">
          <Tooltip content="Undo last action" shortcut="Ctrl+Z">
            <button
              type="button"
              onClick={handleUndo}
              className="header-button undo-button"
              disabled={!undoEnabled}
            >
              ↶ Undo
            </button>
          </Tooltip>
          <Tooltip content="Redo last undone action" shortcut="Ctrl+Y">
            <button
              type="button"
              onClick={handleRedo}
              className="header-button redo-button"
              disabled={!redoEnabled}
            >
              ↷ Redo
            </button>
          </Tooltip>
          <Tooltip content="Save current design to cloud">
            <button
              type="button"
              onClick={handleSaveClick}
              className="header-button save-button"
            >
              💾 Save
              {isDirty && <span className="unsaved-indicator">●</span>}
            </button>
          </Tooltip>
          <Tooltip content="View all saved designs">
            <button
              type="button"
              onClick={handleMyDesigns}
              className="header-button designs-button"
            >
              📁 My Designs
            </button>
          </Tooltip>
        </div>

        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <Tooltip content="Sign out of your account">
            <button
              type="button"
              onClick={handleLogout}
              className="header-button logout-button"
            >
              Logout
            </button>
          </Tooltip>
        </div>
      </header>

      {showSaveDialog && <SaveDesignDialog onClose={handleCloseSaveDialog} />}
    </>
  );
};
