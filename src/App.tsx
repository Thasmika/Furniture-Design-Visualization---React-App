import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import { initializeFirebase } from './services';
import { initializeAuthListener } from './store/slices/authThunks';
import { LoginPage, RegisterPage, EditorPage, DesignListPage } from './pages';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import './App.css';

// Initialize Firebase on app load
initializeFirebase();

function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state listener
    const unsubscribe = store.dispatch(initializeAuthListener());
    setInitialized(true);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  if (!initialized) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Provider store={store}>
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
    </Provider>
  );
}

export default App;
