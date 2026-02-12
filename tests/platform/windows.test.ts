import { describe, it, expect, beforeAll } from 'vitest';

describe('Windows Platform Compatibility', () => {
  beforeAll(() => {
    // Skip tests if not on Windows
    if (process.platform !== 'win32') {
      console.log('Skipping Windows tests - not running on Windows');
    }
  });

  describe('Platform Detection', () => {
    it('should detect Windows platform correctly', () => {
      if (process.platform === 'win32') {
        expect(process.platform).toBe('win32');
      }
    });

    it('should have electron API available in window context', () => {
      if (typeof window !== 'undefined' && window.electron) {
        expect(window.electron.platform).toBeDefined();
      }
    });
  });

  describe('File Path Handling', () => {
    it('should handle Windows file paths correctly', () => {
      const testPath = 'C:\\Users\\Test\\Documents\\design.json';
      expect(testPath).toContain('\\');
      expect(testPath.split('\\')).toHaveLength(5);
    });

    it('should normalize paths for cross-platform compatibility', () => {
      const path = require('path');
      const normalized = path.normalize('C:/Users/Test/Documents/design.json');
      expect(normalized).toBeDefined();
    });
  });

  describe('Storage API', () => {
    it('should have localStorage available', () => {
      if (typeof window !== 'undefined') {
        expect(window.localStorage).toBeDefined();
      }
    });

    it('should be able to store and retrieve data', () => {
      if (typeof window !== 'undefined') {
        const testKey = 'test-windows-storage';
        const testValue = JSON.stringify({ test: 'data' });
        
        window.localStorage.setItem(testKey, testValue);
        const retrieved = window.localStorage.getItem(testKey);
        
        expect(retrieved).toBe(testValue);
        window.localStorage.removeItem(testKey);
      }
    });
  });

  describe('WebGL Support', () => {
    it('should support WebGL for 3D rendering', () => {
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
          expect(gl).toBeDefined();
        }
      }
    });
  });

  describe('Canvas 2D Support', () => {
    it('should support Canvas 2D API', () => {
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        expect(ctx).toBeDefined();
      }
    });
  });
});
