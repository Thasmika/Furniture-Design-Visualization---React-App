/**
 * FurnitureItem model for admin-managed furniture library
 */

export type FurnitureType = 
  | 'chair' 
  | 'table' 
  | 'couch' 
  | 'bed' 
  | 'desk' 
  | 'shelf' 
  | 'cabinet' 
  | 'lamp';

export interface FurnitureItem {
  id: string;
  name: string;
  type: FurnitureType;
  color: string; // hex color code
  price: number; // in smallest currency unit (cents)
  imageUrl: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}
