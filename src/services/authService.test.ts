import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  registerUser,
  authenticateUser,
  logoutUser,
  setupAuthStateListener,
} from './authService';
import * as firebaseAuth from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  getAuth: vi.fn(),
}));

vi.mock('./firebase', () => ({
  getFirebaseAuth: vi.fn(() => ({ name: 'mock-auth' })),
  initializeFirebase: vi.fn(),
}));

describe('Authentication Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user with valid credentials', async () => {
      const mockUser = {
        uid: 'test-uid-123',
        email: 'test@example.com',
        displayName: null,
      };

      const mockUserCredential = {
        user: mockUser,
      };

      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockResolvedValue(
        mockUserCredential as any
      );

      const result = await registerUser('test@example.com', 'password123');

      expect(result).toEqual({
        uid: 'test-uid-123',
        email: 'test@example.com',
      });
      expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        { name: 'mock-auth' },
        'test@example.com',
        'password123'
      );
    });

    it('should throw error when registration fails', async () => {
      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockRejectedValue(
        new Error('Email already in use')
      );

      await expect(registerUser('test@example.com', 'password123')).rejects.toThrow(
        'Email already in use'
      );
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
      const mockUser = {
        uid: 'test-uid-456',
        email: 'user@example.com',
        displayName: 'Test User',
      };

      const mockUserCredential = {
        user: mockUser,
      };

      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValue(
        mockUserCredential as any
      );

      const result = await authenticateUser('user@example.com', 'password123');

      expect(result).toEqual({
        uid: 'test-uid-456',
        email: 'user@example.com',
        displayName: 'Test User',
      });
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        { name: 'mock-auth' },
        'user@example.com',
        'password123'
      );
    });

    it('should throw error when authentication fails', async () => {
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValue(
        new Error('Invalid credentials')
      );

      await expect(authenticateUser('user@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('logoutUser', () => {
    it('should logout user successfully', async () => {
      vi.mocked(firebaseAuth.signOut).mockResolvedValue(undefined);

      await expect(logoutUser()).resolves.toBeUndefined();
      expect(firebaseAuth.signOut).toHaveBeenCalledWith({ name: 'mock-auth' });
    });

    it('should throw error when logout fails', async () => {
      vi.mocked(firebaseAuth.signOut).mockRejectedValue(new Error('Logout failed'));

      await expect(logoutUser()).rejects.toThrow('Logout failed');
    });
  });

  describe('setupAuthStateListener', () => {
    it('should call callback with user when auth state changes to logged in', () => {
      const mockCallback = vi.fn();
      const mockUser = {
        uid: 'test-uid-789',
        email: 'listener@example.com',
        displayName: 'Listener User',
      };

      const mockUnsubscribe = vi.fn();

      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation(
        (auth: any, callback: any) => {
          // Immediately call the callback with a user
          callback(mockUser);
          return mockUnsubscribe;
        }
      );

      const unsubscribe = setupAuthStateListener(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith({
        uid: 'test-uid-789',
        email: 'listener@example.com',
        displayName: 'Listener User',
      });
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback with null when auth state changes to logged out', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation(
        (auth: any, callback: any) => {
          // Immediately call the callback with null
          callback(null);
          return mockUnsubscribe;
        }
      );

      const unsubscribe = setupAuthStateListener(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should return unsubscribe function', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      vi.mocked(firebaseAuth.onAuthStateChanged).mockReturnValue(mockUnsubscribe);

      const unsubscribe = setupAuthStateListener(mockCallback);

      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });
});
