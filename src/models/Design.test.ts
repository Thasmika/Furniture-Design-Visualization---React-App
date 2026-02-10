import { describe, test, expect } from 'vitest';
import { createDesign, addFurniture, removeFurniture, updateFurniture } from './Design';
import { createRoom } from './Room';
import { createFurniture } from './FurniturePiece';

describe('Design Model - Unit Tests', () => {
  test('createDesign creates a valid design with empty furniture array', () => {
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    });

    const design = createDesign('user123', 'My Living Room', room);

    expect(design.id).toBeDefined();
    expect(design.userId).toBe('user123');
    expect(design.name).toBe('My Living Room');
    expect(design.room).toEqual(room);
    expect(design.furniture).toEqual([]);
    expect(design.createdAt).toBeInstanceOf(Date);
    expect(design.updatedAt).toBeInstanceOf(Date);
    expect(design.version).toBe(1);
  });

  test('addFurniture adds a furniture piece to the design', () => {
    const room = createRoom('square', { width: 15 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    });

    const design = createDesign('user123', 'My Office', room);
    const chair = createFurniture('chair', '#FF0000');

    const updatedDesign = addFurniture(design, chair);

    expect(updatedDesign.furniture).toHaveLength(1);
    expect(updatedDesign.furniture[0]).toEqual(chair);
    expect(updatedDesign.updatedAt.getTime()).toBeGreaterThanOrEqual(design.updatedAt.getTime());
    expect(updatedDesign.id).toBe(design.id);
  });

  test('addFurniture preserves existing furniture', () => {
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    });

    const design = createDesign('user123', 'My Room', room);
    const chair = createFurniture('chair', '#FF0000');
    const table = createFurniture('table', '#00FF00');

    const withChair = addFurniture(design, chair);
    const withBoth = addFurniture(withChair, table);

    expect(withBoth.furniture).toHaveLength(2);
    expect(withBoth.furniture[0]).toEqual(chair);
    expect(withBoth.furniture[1]).toEqual(table);
  });

  test('removeFurniture removes the specified furniture piece', () => {
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    });

    const design = createDesign('user123', 'My Room', room);
    const chair = createFurniture('chair', '#FF0000');
    const table = createFurniture('table', '#00FF00');

    const withFurniture = addFurniture(addFurniture(design, chair), table);
    const afterRemoval = removeFurniture(withFurniture, chair.id);

    expect(afterRemoval.furniture).toHaveLength(1);
    expect(afterRemoval.furniture[0]).toEqual(table);
    expect(afterRemoval.updatedAt.getTime()).toBeGreaterThanOrEqual(withFurniture.updatedAt.getTime());
  });

  test('removeFurniture does nothing if furniture ID not found', () => {
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    });

    const design = createDesign('user123', 'My Room', room);
    const chair = createFurniture('chair', '#FF0000');

    const withFurniture = addFurniture(design, chair);
    const afterRemoval = removeFurniture(withFurniture, 'non-existent-id');

    expect(afterRemoval.furniture).toHaveLength(1);
    expect(afterRemoval.furniture[0]).toEqual(chair);
  });

  test('updateFurniture updates the specified furniture piece', () => {
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    });

    const design = createDesign('user123', 'My Room', room);
    const chair = createFurniture('chair', '#FF0000');

    const withFurniture = addFurniture(design, chair);
    const afterUpdate = updateFurniture(withFurniture, chair.id, {
      color: '#0000FF',
      scale: 1.5,
    });

    expect(afterUpdate.furniture).toHaveLength(1);
    expect(afterUpdate.furniture[0].id).toBe(chair.id);
    expect(afterUpdate.furniture[0].color).toBe('#0000FF');
    expect(afterUpdate.furniture[0].scale).toBe(1.5);
    expect(afterUpdate.furniture[0].type).toBe('chair');
    expect(afterUpdate.updatedAt.getTime()).toBeGreaterThanOrEqual(withFurniture.updatedAt.getTime());
  });

  test('updateFurniture does nothing if furniture ID not found', () => {
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    });

    const design = createDesign('user123', 'My Room', room);
    const chair = createFurniture('chair', '#FF0000');

    const withFurniture = addFurniture(design, chair);
    const afterUpdate = updateFurniture(withFurniture, 'non-existent-id', {
      color: '#0000FF',
    });

    expect(afterUpdate.furniture).toHaveLength(1);
    expect(afterUpdate.furniture[0]).toEqual(chair);
  });

  test('updateFurniture preserves other furniture pieces', () => {
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    });

    const design = createDesign('user123', 'My Room', room);
    const chair = createFurniture('chair', '#FF0000');
    const table = createFurniture('table', '#00FF00');

    const withFurniture = addFurniture(addFurniture(design, chair), table);
    const afterUpdate = updateFurniture(withFurniture, chair.id, {
      color: '#0000FF',
    });

    expect(afterUpdate.furniture).toHaveLength(2);
    expect(afterUpdate.furniture[0].color).toBe('#0000FF');
    expect(afterUpdate.furniture[1]).toEqual(table);
  });
});

// **Validates: Requirements 6.1, 7.1**
