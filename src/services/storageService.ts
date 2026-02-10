import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import type { Design } from '../models/Design';

/**
 * Database structure: users/{userId}/designs/{designId}
 * 
 * This service provides functions for persisting and retrieving furniture designs
 * from Firebase Firestore with retry logic and error handling.
 */

interface FirestoreDesign {
  id: string;
  userId: string;
  name: string;
  room: any;
  furniture: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
}

/**
 * Convert Design to Firestore format (Date -> Timestamp)
 */
function designToFirestore(design: Design): FirestoreDesign {
  return {
    ...design,
    createdAt: Timestamp.fromDate(design.createdAt),
    updatedAt: Timestamp.fromDate(design.updatedAt),
  };
}

/**
 * Convert Firestore format to Design (Timestamp -> Date)
 */
function firestoreToDesign(data: FirestoreDesign): Design {
  return {
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

/**
 * Save a design to Firestore with retry logic (3 attempts)
 * Requirements: 6.1, 6.2, 12.1, 12.2
 */
export async function saveDesign(design: Design): Promise<void> {
  const maxAttempts = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const db = getFirebaseFirestore();
      const designRef = doc(db, 'users', design.userId, 'designs', design.id);
      const firestoreData = designToFirestore(design);
      
      await setDoc(designRef, firestoreData);
      
      // Verify successful persistence
      const savedDoc = await getDoc(designRef);
      if (!savedDoc.exists()) {
        throw new Error('Save verification failed: document does not exist after save');
      }
      
      return; // Success
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a network error that should be retried
      const isNetworkError = 
        error instanceof Error && 
        (error.message.includes('network') || 
         error.message.includes('offline') ||
         error.message.includes('unavailable'));
      
      if (!isNetworkError || attempt === maxAttempts) {
        break; // Don't retry non-network errors or if max attempts reached
      }
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
    }
  }
  
  throw new Error(`Failed to save design after ${maxAttempts} attempts: ${lastError?.message}`);
}

/**
 * Load all designs for a specific user
 * Requirements: 6.3
 */
export async function loadDesigns(userId: string): Promise<Design[]> {
  try {
    const db = getFirebaseFirestore();
    const designsRef = collection(db, 'users', userId, 'designs');
    const querySnapshot = await getDocs(designsRef);
    
    const designs: Design[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreDesign;
      designs.push(firestoreToDesign(data));
    });
    
    return designs;
  } catch (error) {
    throw new Error(`Failed to load designs: ${(error as Error).message}`);
  }
}

/**
 * Load a single design by ID
 * Requirements: 6.4
 */
export async function loadDesign(userId: string, designId: string): Promise<Design> {
  try {
    const db = getFirebaseFirestore();
    const designRef = doc(db, 'users', userId, 'designs', designId);
    const docSnapshot = await getDoc(designRef);
    
    if (!docSnapshot.exists()) {
      throw new Error(`Design not found: ${designId}`);
    }
    
    const data = docSnapshot.data() as FirestoreDesign;
    return firestoreToDesign(data);
  } catch (error) {
    throw new Error(`Failed to load design: ${(error as Error).message}`);
  }
}

/**
 * Update an existing design (preserves design ID)
 * Requirements: 7.2
 */
export async function updateDesign(design: Design): Promise<void> {
  try {
    const db = getFirebaseFirestore();
    const designRef = doc(db, 'users', design.userId, 'designs', design.id);
    
    // Check if design exists
    const docSnapshot = await getDoc(designRef);
    if (!docSnapshot.exists()) {
      throw new Error(`Cannot update non-existent design: ${design.id}`);
    }
    
    const firestoreData = designToFirestore(design);
    await updateDoc(designRef, { ...firestoreData });
  } catch (error) {
    throw new Error(`Failed to update design: ${(error as Error).message}`);
  }
}

/**
 * Delete a design
 * Requirements: 7.4
 */
export async function deleteDesign(userId: string, designId: string): Promise<void> {
  try {
    const db = getFirebaseFirestore();
    const designRef = doc(db, 'users', userId, 'designs', designId);
    await deleteDoc(designRef);
  } catch (error) {
    throw new Error(`Failed to delete design: ${(error as Error).message}`);
  }
}
