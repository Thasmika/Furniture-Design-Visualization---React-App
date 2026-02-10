import type { Room } from '../models/Room';

export interface Position2D {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Converts 2D coordinates to 3D coordinates
 * 2D coordinate system: Origin (0, 0) at top-left corner of room
 * 3D coordinate system: Origin (0, 0, 0) at center of room floor
 * 
 * @param pos2D - 2D position with x and y coordinates
 * @param room - Room object containing dimensions
 * @returns 3D position with x, y, and z coordinates
 */
export function convert2Dto3D(pos2D: Position2D, room: Room): Vector3 {
  // Get room dimensions based on shape
  const width = room.shape === 'circular' ? room.dimensions.radius * 2 : room.dimensions.width;
  const length = room.shape === 'circular' ? room.dimensions.radius * 2 : room.dimensions.length;
  
  // Center the 3D coordinates
  const centerX = width / 2;
  const centerZ = length / 2;
  
  return {
    x: pos2D.x - centerX,
    y: 0, // furniture sits on floor
    z: pos2D.y - centerZ
  };
}

/**
 * Converts 3D coordinates to 2D coordinates
 * 3D coordinate system: Origin (0, 0, 0) at center of room floor
 * 2D coordinate system: Origin (0, 0) at top-left corner of room
 * 
 * @param pos3D - 3D position with x, y, and z coordinates
 * @param room - Room object containing dimensions
 * @returns 2D position with x and y coordinates
 */
export function convert3Dto2D(pos3D: Vector3, room: Room): Position2D {
  // Get room dimensions based on shape
  const width = room.shape === 'circular' ? room.dimensions.radius * 2 : room.dimensions.width;
  const length = room.shape === 'circular' ? room.dimensions.radius * 2 : room.dimensions.length;
  
  const centerX = width / 2;
  const centerZ = length / 2;
  
  return {
    x: pos3D.x + centerX,
    y: pos3D.z + centerZ
  };
}
