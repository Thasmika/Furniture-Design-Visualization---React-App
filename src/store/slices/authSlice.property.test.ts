import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import authReducer, { loginSuccess, authStateChanged } from './authSlice';
import type { User } from '../types';

describe('Auth Slice - Property-Based Tests', () => {
  // Feature: admin-panel, Property 3: Role Persistence in Redux
  // **Validates: Requirements 2.3**
  describe('Property 3: Role Persistence in Redux', () => {
    it('should persist role field in Redux state for any successfully authenticated user', () => {
      fc.assert(
        fc.property(
          fc.record({
            uid: fc.string({ minLength: 1, maxLength: 128 }),
            email: fc.emailAddress(),
            displayName: fc.oneof(
              fc.constant(null),
              fc.string({ minLength: 1, maxLength: 100 })
            ),
            role: fc.constantFrom<'user' | 'admin'>('user', 'admin'),
          }),
          (user: User) => {
            // Test loginSuccess action
            const initialState = {
              user: null,
              loading: false,
              error: null,
            };
            
            const stateAfterLogin = authReducer(initialState, loginSuccess(user));
            
            // Verify user object is stored in Redux state
            expect(stateAfterLogin.user).not.toBeNull();
            expect(stateAfterLogin.user?.uid).toBe(user.uid);
            expect(stateAfterLogin.user?.email).toBe(user.email);
            expect(stateAfterLogin.user?.displayName).toBe(user.displayName);
            
            // Verify role field is populated
            expect(stateAfterLogin.user?.role).toBeDefined();
            expect(stateAfterLogin.user?.role).toBe(user.role);
            expect(['user', 'admin']).toContain(stateAfterLogin.user?.role);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should persist role field when auth state changes', () => {
      fc.assert(
        fc.property(
          fc.record({
            uid: fc.string({ minLength: 1, maxLength: 128 }),
            email: fc.emailAddress(),
            displayName: fc.oneof(
              fc.constant(null),
              fc.string({ minLength: 1, maxLength: 100 })
            ),
            role: fc.constantFrom<'user' | 'admin'>('user', 'admin'),
          }),
          (user: User) => {
            // Test authStateChanged action
            const initialState = {
              user: null,
              loading: true,
              error: null,
            };
            
            const stateAfterChange = authReducer(initialState, authStateChanged(user));
            
            // Verify user object is stored in Redux state
            expect(stateAfterChange.user).not.toBeNull();
            expect(stateAfterChange.user?.uid).toBe(user.uid);
            
            // Verify role field is populated
            expect(stateAfterChange.user?.role).toBeDefined();
            expect(stateAfterChange.user?.role).toBe(user.role);
            expect(['user', 'admin']).toContain(stateAfterChange.user?.role);
            
            // Verify loading is set to false
            expect(stateAfterChange.loading).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
