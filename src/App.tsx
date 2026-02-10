import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { initializeFirebase } from './services';
import './App.css';

// Initialize Firebase on app load
initializeFirebase();

function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setInitialized(true);
  }, []);

  if (!initialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h1>🪑 Furniture Design Visualizer</h1>
        <p style={{ color: '#666' }}>
          Backend infrastructure ready. UI components coming soon.
        </p>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px',
          maxWidth: '500px'
        }}>
          <h3 style={{ marginTop: 0 }}>✅ Completed:</h3>
          <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
            <li>Core data models (Room, Furniture, Design)</li>
            <li>Validation engine & coordinate system</li>
            <li>Redux state management</li>
            <li>Firebase authentication service</li>
            <li>124 tests passing</li>
          </ul>
        </div>
      </div>
    </Provider>
  );
}

export default App;
