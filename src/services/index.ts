// Firebase services
export { initializeFirebase, getFirebaseAuth, getFirebaseFirestore } from './firebase';
export {
  registerUser,
  authenticateUser,
  logoutUser,
  setupAuthStateListener,
} from './authService';
export {
  saveDesign,
  loadDesigns,
  loadDesign,
  updateDesign,
  deleteDesign,
} from './storageService';
export {
  cacheDesign,
  getCachedDesign,
  clearCache,
  setLastSaveTimestamp,
  getLastSaveTimestamp,
} from './cacheService';
