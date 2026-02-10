import { AppHeader } from '../components';
import './EditorPage.css';

export const EditorPage = () => {
  return (
    <div className="editor-page">
      <AppHeader />
      
      <main className="editor-content">
        <div className="placeholder-content">
          <h2>Editor Coming Soon</h2>
          <p>You are successfully authenticated!</p>
          <p>The design editor interface will be implemented in upcoming tasks.</p>
        </div>
      </main>
    </div>
  );
};
