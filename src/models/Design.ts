import type { Room } from './Room';
import type { FurniturePiece } from './FurniturePiece';

export interface Design {
  id: string;
  userId: string;
  name: string;
  room: Room;
  furniture: FurniturePiece[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export function createDesign(userId: string, name: string, room: Room): Design {
  const now = new Date();
  
  return {
    id: crypto.randomUUID(),
    userId,
    name,
    room,
    furniture: [],
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

export function addFurniture(design: Design, furniture: FurniturePiece): Design {
  return {
    ...design,
    furniture: [...design.furniture, furniture],
    updatedAt: new Date(),
  };
}

export function removeFurniture(design: Design, furnitureId: string): Design {
  return {
    ...design,
    furniture: design.furniture.filter(f => f.id !== furnitureId),
    updatedAt: new Date(),
  };
}

export function updateFurniture(
  design: Design,
  furnitureId: string,
  updates: Partial<FurniturePiece>
): Design {
  return {
    ...design,
    furniture: design.furniture.map(f =>
      f.id === furnitureId ? { ...f, ...updates } : f
    ),
    updatedAt: new Date(),
  };
}
