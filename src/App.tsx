import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import { initializeFirebase } from './services';
import { initializeAuthListener } from './store/slices/authThunks';
import { LoginPage, RegisterPage, EditorPage, DesignListPage } from './pages';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { RecoveryDialog } from './components/RecoveryDialog';
import { checkForRecovery, restoreCachedDesign, discardCachedDesign } from './services/recoveryService';
import { createDesign } from './store/slices/designSlice';
import type { RecoveryData } from './services/recoveryService';
import './App.css';

// Initialize Firebase on app load
initializeFirebase();

function App() {
  const [initialized, setInitialized] = useState(false);
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);

  useEffect(() => {
    // Check for cached design on startup
    const recovery = checkForRecovery();
    if (recovery) {
      setRecoveryData(recovery);
    }

    // Initialize auth state listener
    const unsubscribe = store.dispatch(initializeAuthListener());
    setInitialized(true);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleRestore = () => {
    if (recoveryData) {
      const design = restoreCachedDesign(recoveryData);
      store.dispatch(createDesign(design));
      setRecoveryData(null);
    }
  };

  const handleDiscard = () => {
    discardCachedDesign();
    setRecoveryData(null);
  };

  if (!initialized) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <ToastProvider>
          {recoveryData && (
            <RecoveryDialog
              recoveryData={recoveryData}
              onRestore={handleRestore}
              onDiscard={handleDiscard}
            />
          )}
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/designs"
                element={
                  <ProtectedRoute>
                    <DesignListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editor"
                element={
                  <ProtectedRoute>
                    <EditorPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
