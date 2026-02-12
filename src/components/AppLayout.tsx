import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setActiveView, toggleSidebar } from '../store/slices/uiSlice';
import { RoomConfigPanel } from './RoomConfigPanel';
import { FurnitureLibraryPanel } from './FurnitureLibraryPanel';
import { PropertyEditorPanel } from './PropertyEditorPanel';
import { ViewContainer } from './ViewContainer';
import { Tooltip } from './Tooltip';
import './AppLayout.css';

export const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeView = useAppSelector((state) => state.ui.activeView);
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  const handleViewChange = (view: '2d' | '3d' | 'split') => {
    dispatch(setActiveView(view));
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <div className="app-layout">
      {/* Header with view mode selector */}
      <header className="app-layout-header">
        <div className="view-mode-selector">
          <Tooltip content="Top-down orthographic view for precise placement">
            <button
              type="button"
              className={`view-mode-button ${activeView === '2d' ? 'active' : ''}`}
              onClick={() => handleViewChange('2d')}
            >
              2D View
            </button>
          </Tooltip>
          <Tooltip content="Perspective view with camera controls">
            <button
              type="button"
              className={`view-mode-button ${activeView === '3d' ? 'active' : ''}`}
              onClick={() => handleViewChange('3d')}
            >
              3D View
            </button>
          </Tooltip>
          <Tooltip content="View both 2D and 3D simultaneously">
            <button
              type="button"
              className={`view-mode-button ${activeView === 'split' ? 'active' : ''}`}
              onClick={() => handleViewChange('split')}
            >
              Split View
            </button>
          </Tooltip>
        </div>
        <Tooltip content={sidebarOpen ? 'Hide configuration sidebar' : 'Show configuration sidebar'}>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={handleToggleSidebar}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </Tooltip>
      </header>

      {/* Main content area */}
      <div className="app-layout-content">
        {/* Sidebar with panels */}
        <aside className={`app-layout-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-panels">
            <RoomConfigPanel />
            <FurnitureLibraryPanel />
            <PropertyEditorPanel />
          </div>
        </aside>

        {/* Main view container */}
        <main className="app-layout-main">
          <ViewContainer />
        </main>
      </div>
    </div>
  );
};
