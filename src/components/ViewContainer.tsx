import React, { useRef, useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { Canvas2D } from './Canvas2D';
import { Scene3D } from './Scene3D';
import './ViewContainer.css';

export const ViewContainer: React.FC = () => {
  const activeView = useAppSelector((state) => state.ui.activeView);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Update dimensions when view mode changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    // Small delay to allow layout to settle
    setTimeout(updateDimensions, 50);
  }, [activeView]);

  const renderView = () => {
    switch (activeView) {
      case '2d':
        return (
          <div className="view-single" ref={containerRef}>
            <Canvas2D width={dimensions.width} height={dimensions.height} />
          </div>
        );
      
      case '3d':
        return (
          <div className="view-single" ref={containerRef}>
            <Scene3D />
          </div>
        );
      
      case 'split':
        return (
          <div className="view-split" ref={containerRef}>
            <div className="view-split-pane">
              <div className="view-label">2D View</div>
              <Canvas2D 
                width={Math.floor(dimensions.width / 2) - 20} 
                height={dimensions.height - 40} 
              />
            </div>
            <div className="view-split-divider" />
            <div className="view-split-pane">
              <div className="view-label">3D View</div>
              <Scene3D />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="view-container">
      {renderView()}
    </div>
  );
};
