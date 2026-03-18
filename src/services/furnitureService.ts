/**
 * Furniture Service
 * Handles Firestore CRUD operations for furniture items
 */

import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import type { FurnitureItem, FurnitureType } from '../models/FurnitureItem';

const FURNITURE_COLLECTION = 'furniture';

/**
 * Fetch all furniture items from Firestore
 * @returns Promise resolving to array of FurnitureItem
 */
export const fetchFurnitureItems = async (): Promise<FurnitureItem[]> => {
  const db = getFirebaseFirestore();
  const furnitureCollection = collection(db, FURNITURE_COLLECTION);
  
  const snapshot = await getDocs(furnitureCollection);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      type: data.type as FurnitureType,
      color: data.color,
      price: data.price,
      imageUrl: data.imageUrl,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : data.updatedAt,
    };
  });
};

/**
 * Validate furniture item data
 * @param item Furniture item data to validate
 * @throws Error if validation fails
 */
const validateFurnitureItem = (
  item: Partial<Omit<FurnitureItem, 'id' | 'createdAt' | 'updatedAt'>>
): void => {
  if (!item.name || item.name.trim() === '') {
    throw new Error('Furniture name is required');
  }
  
  if (!item.type) {
    throw new Error('Furniture type is required');
  }
  
  const validTypes: FurnitureType[] = ['chair', 'table', 'couch', 'bed', 'desk', 'shelf', 'cabinet', 'lamp'];
  if (!validTypes.includes(item.type)) {
    throw new Error(`Invalid furniture type. Must be one of: ${validTypes.join(', ')}`);
  }
  
  if (!item.color || item.color.trim() === '') {
    throw new Error('Furniture color is required');
  }
  
  // Validate hex color format
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexColorRegex.test(item.color)) {
    throw new Error('Color must be a valid hex code (e.g., #FF5733)');
  }
  
  if (item.price === undefined || item.price === null) {
    throw new Error('Furniture price is required');
  }
  
  if (typeof item.price !== 'number' || item.price < 0) {
    throw new Error('Price must be a non-negative number');
  }
  
  if (!item.imageUrl || item.imageUrl.trim() === '') {
    throw new Error('Furniture image URL is required');
  }
};

/**
 * Add new furniture item to Firestore
 * @param item Furniture item data (without id, createdAt, updatedAt)
 * @returns Promise resolving to created FurnitureItem with ID
 */
export const addFurnitureItem = async (
  item: Omit<FurnitureItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FurnitureItem> => {
  // Validate item data
  validateFurnitureItem(item);
  
  const db = getFirebaseFirestore();
  const furnitureCollection = collection(db, FURNITURE_COLLECTION);
  
  const now = Date.now();
  const docData = {
    name: item.name.trim(),
    type: item.type,
    color: item.color.trim(),
    price: item.price,
    imageUrl: item.imageUrl.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(furnitureCollection, docData);
  
  return {
    id: docRef.id,
    name: item.name.trim(),
    type: item.type,
    color: item.color.trim(),
    price: item.price,
    imageUrl: item.imageUrl.trim(),
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Update existing furniture item
 * @param id Item ID
 * @param updates Partial item data
 * @returns Promise resolving when update completes
 */
export const updateFurnitureItem = async (
  id: string,
  updates: Partial<Omit<FurnitureItem, 'id' | 'createdAt'>>
): Promise<void> => {
  if (!id || id.trim() === '') {
    throw new Error('Furniture item ID is required');
  }
  
  // Validate update data
  validateFurnitureItem(updates);
  
  const db = getFirebaseFirestore();
  const furnitureDoc = doc(db, FURNITURE_COLLECTION, id);
  
  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  
  if (updates.name !== undefined) {
    updateData.name = updates.name.trim();
  }
  if (updates.type !== undefined) {
    updateData.type = updates.type;
  }
  if (updates.color !== undefined) {
    updateData.color = updates.color.trim();
  }
  if (updates.price !== undefined) {
    updateData.price = updates.price;
  }
  if (updates.imageUrl !== undefined) {
    updateData.imageUrl = updates.imageUrl.trim();
  }
  
  await updateDoc(furnitureDoc, updateData);
};

/**
 * Delete furniture item from Firestore
 * @param id Item ID
 * @returns Promise resolving when deletion completes
 */
export const deleteFurnitureItem = async (id: string): Promise<void> => {
  if (!id || id.trim() === '') {
    throw new Error('Furniture item ID is required');
  }
  
  const db = getFirebaseFirestore();
  const furnitureDoc = doc(db, FURNITURE_COLLECTION, id);
  
  await deleteDoc(furnitureDoc);
};
