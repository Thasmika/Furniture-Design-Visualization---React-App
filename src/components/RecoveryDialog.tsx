import { useState } from 'react';
import type { RecoveryData } from '../services/recoveryService';
import './RecoveryDialog.css';

interface RecoveryDialogProps {
  recoveryData: RecoveryData;
  onRestore: () => void;
  onDiscard: () => void;
}

export function RecoveryDialog({ recoveryData, onRestore, onDiscard }: RecoveryDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRestore = () => {
    setIsProcessing(true);
    onRestore();
  };

  const handleDiscard = () => {
    setIsProcessing(true);
    onDiscard();
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString();
  };

  const getTimeSinceCache = () => {
    const now = new Date();
    const diffMs = now.getTime() - recoveryData.cacheTimestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <div className="recovery-dialog-overlay">
      <div className="recovery-dialog">
        <div className="recovery-dialog-header">
          <h2>Unsaved Changes Detected</h2>
        </div>
        
        <div className="recovery-dialog-content">
          <p className="recovery-message">
            We found unsaved changes to your design "{recoveryData.design.name}".
          </p>
          
          <div className="recovery-details">
            <div className="recovery-detail-item">
              <span className="recovery-detail-label">Last modified:</span>
              <span className="recovery-detail-value">{getTimeSinceCache()}</span>
            </div>
            
            <div className="recovery-detail-item">
              <span className="recovery-detail-label">Cached at:</span>
              <span className="recovery-detail-value">
                {formatTimestamp(recoveryData.cacheTimestamp)}
              </span>
            </div>
            
            {recoveryData.lastSavedTimestamp && (
              <div className="recovery-detail-item">
                <span className="recovery-detail-label">Last saved:</span>
                <span className="recovery-detail-value">
                  {formatTimestamp(recoveryData.lastSavedTimestamp)}
                </span>
              </div>
            )}
          </div>
          
          <p className="recovery-question">
            Would you like to restore your unsaved changes?
          </p>
        </div>
        
        <div className="recovery-dialog-actions">
          <button
            className="recovery-button recovery-button-secondary"
            onClick={handleDiscard}
            disabled={isProcessing}
          >
            Discard Changes
          </button>
          <button
            className="recovery-button recovery-button-primary"
            onClick={handleRestore}
            disabled={isProcessing}
          >
            Restore Changes
          </button>
        </div>
      </div>
    </div>
  );
}
