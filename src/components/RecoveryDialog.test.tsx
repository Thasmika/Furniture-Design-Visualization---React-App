import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecoveryDialog } from './RecoveryDialog';
import { createDesign } from '../models/Design';
import { createRoom } from '../models/Room';
import type { RecoveryData } from '../services/recoveryService';

describe('RecoveryDialog', () => {
  const createMockRecoveryData = (): RecoveryData => {
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    }, 'feet');
    const design = createDesign('user123', 'Test Design', room);
    
    return {
      design,
      cacheTimestamp: new Date(),
      lastSavedTimestamp: new Date(Date.now() - 60000), // 1 minute ago
      hasUnsavedChanges: true,
    };
  };

  test('renders recovery dialog with design name', () => {
    const recoveryData = createMockRecoveryData();
    const onRestore = vi.fn();
    const onDiscard = vi.fn();
    
    render(
      <RecoveryDialog
        recoveryData={recoveryData}
        onRestore={onRestore}
        onDiscard={onDiscard}
      />
    );
    
    expect(screen.getByText('Unsaved Changes Detected')).toBeInTheDocument();
    expect(screen.getByText(/Test Design/)).toBeInTheDocument();
  });

  test('displays cache timestamp', () => {
    const recoveryData = createMockRecoveryData();
    const onRestore = vi.fn();
    const onDiscard = vi.fn();
    
    render(
      <RecoveryDialog
        recoveryData={recoveryData}
        onRestore={onRestore}
        onDiscard={onDiscard}
      />
    );
    
    expect(screen.getByText('Cached at:')).toBeInTheDocument();
  });

  test('displays last saved timestamp when available', () => {
    const recoveryData = createMockRecoveryData();
    const onRestore = vi.fn();
    const onDiscard = vi.fn();
    
    render(
      <RecoveryDialog
        recoveryData={recoveryData}
        onRestore={onRestore}
        onDiscard={onDiscard}
      />
    );
    
    expect(screen.getByText('Last saved:')).toBeInTheDocument();
  });

  test('does not display last saved timestamp when not available', () => {
    const recoveryData = createMockRecoveryData();
    recoveryData.lastSavedTimestamp = null;
    const onRestore = vi.fn();
    const onDiscard = vi.fn();
    
    render(
      <RecoveryDialog
        recoveryData={recoveryData}
        onRestore={onRestore}
        onDiscard={onDiscard}
      />
    );
    
    expect(screen.queryByText('Last saved:')).not.toBeInTheDocument();
  });

  test('calls onRestore when restore button is clicked', () => {
    const recoveryData = createMockRecoveryData();
    const onRestore = vi.fn();
    const onDiscard = vi.fn();
    
    render(
      <RecoveryDialog
        recoveryData={recoveryData}
        onRestore={onRestore}
        onDiscard={onDiscard}
      />
    );
    
    const restoreButton = screen.getByText('Restore Changes');
    fireEvent.click(restoreButton);
    
    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  test('calls onDiscard when discard button is clicked', () => {
    const recoveryData = createMockRecoveryData();
    const onRestore = vi.fn();
    const onDiscard = vi.fn();
    
    render(
      <RecoveryDialog
        recoveryData={recoveryData}
        onRestore={onRestore}
        onDiscard={onDiscard}
      />
    );
    
    const discardButton = screen.getByText('Discard Changes');
    fireEvent.click(discardButton);
    
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  test('disables buttons while processing', () => {
    const recoveryData = createMockRecoveryData();
    const onRestore = vi.fn();
    const onDiscard = vi.fn();
    
    render(
      <RecoveryDialog
        recoveryData={recoveryData}
        onRestore={onRestore}
        onDiscard={onDiscard}
      />
    );
    
    const restoreButton = screen.getByText('Restore Changes');
    const discardButton = screen.getByText('Discard Changes');
    
    // Click restore button
    fireEvent.click(restoreButton);
    
    // Buttons should be disabled
    expect(restoreButton).toBeDisabled();
    expect(discardButton).toBeDisabled();
  });

  test('displays relative time for recent cache', () => {
    const recoveryData = createMockRecoveryData();
    recoveryData.cacheTimestamp = new Date(Date.now() - 30000); // 30 seconds ago
    const onRestore = vi.fn();
    const onDiscard = vi.fn();
    
    render(
      <RecoveryDialog
        recoveryData={recoveryData}
        onRestore={onRestore}
        onDiscard={onDiscard}
      />
    );
    
    expect(screen.getByText('just now')).toBeInTheDocument();
  });

  test('displays minutes for cache older than 1 minute', () => {
    const recoveryData = createMockRecoveryData();
    recoveryData.cacheTimestamp = new Date(Date.now() - 120000); // 2 minutes ago
    const onRestore = vi.fn();
    const onDiscard = vi.fn();
    
    render(
      <RecoveryDialog
        recoveryData={recoveryData}
        onRestore={onRestore}
        onDiscard={onDiscard}
      />
    );
    
    expect(screen.getByText('2 minutes ago')).toBeInTheDocument();
  });

  test('displays hours for cache older than 1 hour', () => {
    const recoveryData = createMockRecoveryData();
    recoveryData.cacheTimestamp = new Date(Date.now() - 7200000); // 2 hours ago
    const onRestore = vi.fn();
    const onDiscard = vi.fn();
    
    render(
      <RecoveryDialog
        recoveryData={recoveryData}
        onRestore={onRestore}
        onDiscard={onDiscard}
      />
    );
    
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });
});

// **Validates: Requirements 12.3, 12.4**
