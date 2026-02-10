import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';
import type { User } from '../store/types';

/**
 * Convert Firebase User to application User type
 */
const mapFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || undefined,
  };
};

/**
 * Register a new user with email and password
 * @param email User email address
 * @param password User password
 * @returns Promise resolving to User object
 * @throws Error if registration fails
 */
export const registerUser = async (email: string, password: string): Promise<User> => {
  const auth = getFirebaseAuth();
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return mapFirebaseUser(userCredential.user);
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * Authenticate user with email and password
 * @param email User email address
 * @param password User password
 * @returns Promise resolving to User object
 * @throws Error if authentication fails
 */
export const authenticateUser = async (email: string, password: string): Promise<User> => {
  const auth = getFirebaseAuth();
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return mapFirebaseUser(userCredential.user);
  } catch (error: any) {
    throw new Error(error.message || 'Authentication failed');
  }
};

/**
 * Log out the current user
 * @returns Promise that resolves when logout is complete
 * @throws Error if logout fails
 */
export const logoutUser = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
  }
};

/**
 * Set up listener for authentication state changes
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const setupAuthStateListener = (
  callback: (user: User | null) => void
): (() => void) => {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(mapFirebaseUser(firebaseUser));
    } else {
      callback(null);
    }
  });
};
