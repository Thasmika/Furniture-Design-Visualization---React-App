import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { createDesign } from '../store/slices/designSlice';
import { createDesign as createDesignModel } from '../models/Design';
import { createRoom } from '../models/Room';
import { AppHeader, AppLayout } from '../components';
import './EditorPage.css';

export const EditorPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { current } = useSelector((state: RootState) => state.design);

  // Initialize a default design if none exists
  useEffect(() => {
    if (!current && user) {
      const defaultRoom = createRoom(
        'rectangular',
        { width: 20, length: 15 },
        { walls: '#E8E8E8', floor: '#D4C5B9', ceiling: '#FFFFFF' },
        'feet'
      );

      const newDesign = createDesignModel(
        user.uid,
        'Untitled Design',
        defaultRoom
      );

      dispatch(createDesign(newDesign));
    }
  }, [current, user, dispatch]);

  return (
    <div className="editor-page">
      <AppHeader />
      <AppLayout />
    </div>
  );
};
