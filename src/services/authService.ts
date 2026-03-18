import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type UserCredential,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore } from './firebase';
import type { User } from '../store/types';

/**
 * Resolve user role from Firestore
 * Reads the users/{uid} document and returns the role field
 * Returns "user" as default if document or role field is missing
 * @param uid User ID
 * @returns Promise resolving to user role
 */
export const resolveUserRole = async (uid: string): Promise<'user' | 'admin'> => {
  try {
    const db = getFirebaseFirestore();
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const role = data?.role;
      
      // Validate role is one of the expected values
      if (role === 'admin' || role === 'user') {
        return role;
      }
    }
    
    // Default to "user" if document doesn't exist or role field is missing/invalid
    return 'user';
  } catch (error) {
    // Log error but return default role to prevent auth flow interruption
    console.error('Error resolving user role:', error);
    return 'user';
  }
};

/**
 * Convert Firebase User to application User type with role resolution
 */
const mapFirebaseUserWithRole = async (firebaseUser: FirebaseUser): Promise<User> => {
  const role = await resolveUserRole(firebaseUser.uid);
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || null,
    role,
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
    return await mapFirebaseUserWithRole(userCredential.user);
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * Authenticate user with email and password
 * Resolves user role from Firestore after authentication
 * @param email User email address
 * @param password User password
 * @returns Promise resolving to User object with role
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
    return await mapFirebaseUserWithRole(userCredential.user);
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
 * Resolves user role from Firestore when auth state changes
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const setupAuthStateListener = (
  callback: (user: User | null) => void
): (() => void) => {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user = await mapFirebaseUserWithRole(firebaseUser);
      callback(user);
    } else {
      callback(null);
    }
  });
};
