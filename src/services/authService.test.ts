import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  registerUser,
  authenticateUser,
  logoutUser,
  setupAuthStateListener,
  resolveUserRole,
} from './authService';
import * as firebaseAuth from 'firebase/auth';
import * as firebaseFirestore from 'firebase/firestore';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  getAuth: vi.fn(),
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  getFirestore: vi.fn(),
}));

vi.mock('./firebase', () => ({
  getFirebaseAuth: vi.fn(() => ({ name: 'mock-auth' })),
  getFirebaseFirestore: vi.fn(() => ({ name: 'mock-firestore' })),
  initializeFirebase: vi.fn(),
}));

describe('Authentication Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock for Firestore - returns user role by default
    const mockDocRef = { id: 'mock-doc-ref' };
    vi.mocked(firebaseFirestore.doc).mockReturnValue(mockDocRef as any);
    vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'user' }),
    } as any);
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
        displayName: null,
        role: 'user',
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
        role: 'user',
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
    it('should call callback with user when auth state changes to logged in', async () => {
      const mockCallback = vi.fn();
      const mockUser = {
        uid: 'test-uid-789',
        email: 'listener@example.com',
        displayName: 'Listener User',
      };

      const mockUnsubscribe = vi.fn();

      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation(
        (_auth: any, callback: any) => {
          // Immediately call the callback with a user (async)
          callback(mockUser);
          return mockUnsubscribe;
        }
      );

      const unsubscribe = setupAuthStateListener(mockCallback);

      // Wait for async role resolution
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockCallback).toHaveBeenCalledWith({
        uid: 'test-uid-789',
        email: 'listener@example.com',
        displayName: 'Listener User',
        role: 'user',
      });
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback with null when auth state changes to logged out', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation(
        (_auth: any, callback: any) => {
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

  describe('resolveUserRole', () => {
    it('should return admin role when Firestore document has admin role', async () => {
      const mockDocRef = { id: 'mock-doc-ref' };
      vi.mocked(firebaseFirestore.doc).mockReturnValue(mockDocRef as any);
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ role: 'admin' }),
      } as any);

      const role = await resolveUserRole('test-uid');

      expect(role).toBe('admin');
      expect(firebaseFirestore.doc).toHaveBeenCalledWith(
        { name: 'mock-firestore' },
        'users',
        'test-uid'
      );
    });

    it('should return user role when Firestore document has user role', async () => {
      const mockDocRef = { id: 'mock-doc-ref' };
      vi.mocked(firebaseFirestore.doc).mockReturnValue(mockDocRef as any);
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ role: 'user' }),
      } as any);

      const role = await resolveUserRole('test-uid');

      expect(role).toBe('user');
    });

    it('should return default user role when Firestore document does not exist', async () => {
      const mockDocRef = { id: 'mock-doc-ref' };
      vi.mocked(firebaseFirestore.doc).mockReturnValue(mockDocRef as any);
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({
        exists: () => false,
        data: () => null,
      } as any);

      const role = await resolveUserRole('test-uid');

      expect(role).toBe('user');
    });

    it('should return default user role when role field is missing', async () => {
      const mockDocRef = { id: 'mock-doc-ref' };
      vi.mocked(firebaseFirestore.doc).mockReturnValue(mockDocRef as any);
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ email: 'test@example.com' }), // No role field
      } as any);

      const role = await resolveUserRole('test-uid');

      expect(role).toBe('user');
    });

    it('should return default user role when role field has invalid value', async () => {
      const mockDocRef = { id: 'mock-doc-ref' };
      vi.mocked(firebaseFirestore.doc).mockReturnValue(mockDocRef as any);
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ role: 'superadmin' }), // Invalid role
      } as any);

      const role = await resolveUserRole('test-uid');

      expect(role).toBe('user');
    });

    it('should return default user role and log error when Firestore read fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockDocRef = { id: 'mock-doc-ref' };
      vi.mocked(firebaseFirestore.doc).mockReturnValue(mockDocRef as any);
      vi.mocked(firebaseFirestore.getDoc).mockRejectedValue(
        new Error('Firestore read failed')
      );

      const role = await resolveUserRole('test-uid');

      expect(role).toBe('user');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error resolving user role:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
