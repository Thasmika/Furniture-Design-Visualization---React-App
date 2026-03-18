# Implementation Plan: Admin Panel

## Overview

This implementation plan extends FurniVision with role-based access control, enabling admin users to manage the furniture library through a dedicated management interface. The implementation follows an incremental approach: first extending the data models and types, then building the service layer, followed by UI components, and finally integrating everything with comprehensive testing.

## Tasks

- [x] 1. Extend data models and types
  - [x] 1.1 Add role field to User type
    - Extend User interface in src/store/types.ts to include role: 'user' | 'admin'
    - Update all User type references to include the new role field
    - _Requirements: 2.1, 2.3_
  
  - [x] 1.2 Create FurnitureItem model and types
    - Create src/models/FurnitureItem.ts with FurnitureItem interface
    - Define FurnitureType enum with all furniture categories
    - Export types for use across the application
    - _Requirements: 5.2, 6.1_

- [x] 2. Create furniture Redux slice
  - [x] 2.1 Implement furnitureSlice with state management
    - Create src/store/slices/furnitureSlice.ts with FurnitureState interface
    - Add reducers for setItems, setLoading, setError
    - Add async thunks for fetch, add, update, delete operations
    - _Requirements: 5.1, 6.2, 7.2, 8.3_
  
  - [ ]* 2.2 Write unit tests for furnitureSlice
    - Test all reducers and state transitions
    - Test async thunk success and error cases
    - _Requirements: 5.1, 6.2, 7.2, 8.3_


- [x] 3. Extend authService with role resolution
  - [x] 3.1 Implement resolveUserRole function
    - Add resolveUserRole function to src/services/authService.ts
    - Read Firestore users/{uid} document and extract role field
    - Return "user" as default if document or role field is missing
    - _Requirements: 2.1, 2.2_
  
  - [x] 3.2 Extend authenticateUserWithRole function
    - Modify existing login function to call resolveUserRole after authentication
    - Return complete User object with role field populated
    - _Requirements: 2.1, 2.3_
  
  - [x] 3.3 Update auth state listener to include role resolution
    - Modify setupAuthStateListener to call resolveUserRole on auth state changes
    - Update Redux auth state with resolved role
    - _Requirements: 2.4_
  
  - [ ]* 3.4 Write unit tests for role resolution
    - Test resolveUserRole with various Firestore document states
    - Test default role behavior for missing documents
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 3.5 Write property test for role resolution
    - **Property 2: Role Resolution from Firestore**
    - **Validates: Requirements 2.1**
    - Generate random user documents with various role values
    - Verify correct role extraction and default behavior

- [x] 4. Create furnitureService for Firestore operations
  - [x] 4.1 Implement fetchFurnitureItems function
    - Create src/services/furnitureService.ts
    - Query furniture collection from Firestore
    - Map Firestore documents to FurnitureItem array
    - _Requirements: 5.1, 9.1_
  
  - [x] 4.2 Implement addFurnitureItem function
    - Validate furniture item data
    - Add document to Firestore with auto-generated ID
    - Set createdAt and updatedAt timestamps
    - Return created item with ID
    - _Requirements: 6.2_
  
  - [x] 4.3 Implement updateFurnitureItem function
    - Validate update data
    - Update Firestore document by ID
    - Set updatedAt timestamp
    - _Requirements: 7.2_
  
  - [x] 4.4 Implement deleteFurnitureItem function
    - Delete Firestore document by ID
    - _Requirements: 8.3_
  
  - [ ]* 4.5 Write unit tests for furnitureService
    - Mock Firestore operations
    - Test all CRUD functions with success and error cases
    - Test validation logic
    - _Requirements: 5.1, 6.2, 7.2, 8.3_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 6. Create AdminRoute guard component
  - [x] 6.1 Implement AdminRoute component
    - Create src/components/AdminRoute.tsx
    - Check authentication status from Redux auth state
    - Redirect to /login if not authenticated
    - Redirect to /editor if authenticated but role is not "admin"
    - Render children if authenticated and role is "admin"
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 6.2 Write unit tests for AdminRoute
    - Test redirect behavior for unauthenticated users
    - Test redirect behavior for regular users
    - Test rendering for admin users
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 6.3 Write property test for admin route protection
    - **Property 5: Admin Route Protection**
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - Generate random auth states (null, user, admin)
    - Verify correct redirect/render behavior for each state

- [x] 7. Create ManagePage for furniture management
  - [x] 7.1 Create ManagePage component structure
    - Create src/pages/ManagePage.tsx and src/pages/ManagePage.css
    - Set up component state for furniture items, loading, error
    - Fetch furniture items on mount using furnitureService
    - Display loading spinner while fetching
    - _Requirements: 5.1, 5.3, 5.4_
  
  - [x] 7.2 Implement furniture table display
    - Render table with columns: name, type, color, price, imageUrl, actions
    - Display empty state message when no items exist
    - Display error message on fetch failure
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [x] 7.3 Implement add furniture form
    - Create form with fields: name, type (select), color, price, imageUrl
    - Add field-level validation for required fields
    - Handle form submission with addFurnitureItem service call
    - Clear form and refresh table on success
    - Display validation errors and retain form values on failure
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 7.4 Implement edit furniture functionality
    - Add edit button for each table row
    - Populate edit form with current item values when edit is clicked
    - Handle edit form submission with updateFurnitureItem service call
    - Close form and refresh table on success
    - Display validation errors and retain form values on failure
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 7.5 Implement delete furniture functionality
    - Add delete button for each table row
    - Display confirmation dialog before deletion
    - Call deleteFurnitureItem service on confirmation
    - Remove item from table on success
    - Display error message on failure
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 7.6 Write unit tests for ManagePage
    - Test table rendering with various data states
    - Test add form validation and submission
    - Test edit form population and submission
    - Test delete confirmation flow
    - Test error handling for all operations
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3_
  
  - [ ]* 7.7 Write property test for furniture display completeness
    - **Property 6: Furniture Display Completeness**
    - **Validates: Requirements 5.1, 5.2**
    - Generate random furniture items
    - Verify all required fields are visible in table
  
  - [ ]* 7.8 Write property test for add furniture validation
    - **Property 7: Add Furniture Validation**
    - **Validates: Requirements 6.2, 6.3**
    - Generate random valid and invalid furniture data
    - Verify correct add behavior and validation errors


- [x] 8. Modify LoginPage to add dual login buttons
  - [x] 8.1 Update LoginPage component
    - Modify src/pages/LoginPage.tsx to add two submit buttons
    - Add "User Login" button that navigates to /editor on success
    - Add "Admin Login" button that navigates to /manage on success
    - Both buttons use the same email/password form fields
    - Disable both buttons and form fields during authentication
    - Display error messages without navigation on authentication failure
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 8.2 Write unit tests for dual login buttons
    - Test rendering of both buttons
    - Test navigation to /editor for user login
    - Test navigation to /manage for admin login
    - Test error display without navigation
    - Test button and field disabling during authentication
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 8.3 Write property test for authentication error display
    - **Property 1: Authentication Error Display**
    - **Validates: Requirements 1.4**
    - Generate random error messages
    - Verify error display without navigation for both login types

- [x] 9. Modify AppNavBar to show conditional "Manage" link
  - [x] 9.1 Update AppNavBar component
    - Modify src/components/AppHeader.tsx (or AppNavBar if separate)
    - Add conditional rendering for "Manage" link based on user role
    - Display "Manage" link pointing to /manage only when user.role === "admin"
    - Hide "Manage" link for regular users
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 9.2 Write unit tests for conditional navigation
    - Test "Manage" link visibility for admin users
    - Test "Manage" link hidden for regular users
    - Test navigation to /manage when link is clicked
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 9.3 Write property test for conditional admin navigation
    - **Property 4: Conditional Admin Navigation**
    - **Validates: Requirements 3.1, 3.2**
    - Generate random users with different roles
    - Verify "Manage" link visibility matches role

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 11. Modify FurnitureLibraryPanel to fetch from Firestore
  - [x] 11.1 Update FurnitureLibraryPanel component
    - Modify src/components/FurnitureLibraryPanel.tsx
    - Add state for Firestore furniture items, loading, and error
    - Fetch furniture items from Firestore on component mount
    - Merge Firestore items with static hardcoded categories
    - Fall back to static data if Firestore fetch fails
    - Display non-blocking warning banner on fetch failure
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ]* 11.2 Write unit tests for FurnitureLibraryPanel
    - Test Firestore fetch on mount
    - Test fallback to static data on fetch failure
    - Test warning banner display on error
    - Test item display with Firestore data
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ]* 11.3 Write property test for furniture library synchronization
    - **Property 11: Furniture Library Synchronization**
    - **Validates: Requirements 9.2**
    - Generate random CRUD operations
    - Verify panel reflects changes on next fetch

- [x] 12. Update App.tsx routing
  - [x] 12.1 Add AdminRoute to routing configuration
    - Modify src/App.tsx to import AdminRoute component
    - Add route for /manage wrapped in AdminRoute guard
    - Ensure ManagePage is rendered for /manage route
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 12.2 Verify admin access to regular user routes
    - Ensure all existing ProtectedRoute routes remain accessible to admin users
    - Verify admin users can access /editor, /my-designs, /reviews, /contact, /profile
    - _Requirements: 10.1, 10.2_
  
  - [ ]* 12.3 Write integration tests for routing
    - Test navigation to /manage as admin user
    - Test redirect from /manage as regular user
    - Test redirect from /manage as unauthenticated user
    - Test admin access to all regular user routes
    - _Requirements: 4.1, 4.2, 4.3, 10.1, 10.2_

- [x] 13. Update Redux store configuration
  - [x] 13.1 Add furnitureSlice to store
    - Modify src/store/index.ts to import and add furnitureSlice reducer
    - Update RootState type to include furniture state
    - _Requirements: 5.1_
  
  - [x] 13.2 Update auth state initialization
    - Ensure auth state listener includes role resolution
    - Verify role is populated on app initialization for returning users
    - _Requirements: 2.4_

- [x] 14. Write additional property-based tests
  - [ ]* 14.1 Write property test for role persistence in Redux
    - **Property 3: Role Persistence in Redux**
    - **Validates: Requirements 2.3**
    - Generate random authenticated users
    - Verify Redux state contains role field
  
  - [ ]* 14.2 Write property test for edit furniture round-trip
    - **Property 8: Edit Furniture Round-Trip**
    - **Validates: Requirements 7.1, 7.2**
    - Generate random furniture items and edits
    - Verify form population and successful updates
  
  - [ ]* 14.3 Write property test for edit validation
    - **Property 9: Edit Validation**
    - **Validates: Requirements 7.3**
    - Generate random invalid edit data
    - Verify validation errors are displayed
  
  - [ ]* 14.4 Write property test for delete confirmation flow
    - **Property 10: Delete Confirmation Flow**
    - **Validates: Requirements 8.1, 8.2, 8.3**
    - Generate random furniture items
    - Verify delete confirmation and completion
  
  - [ ]* 14.5 Write property test for admin access to regular features
    - **Property 12: Admin Access to Regular Features**
    - **Validates: Requirements 10.1, 10.2**
    - Generate random admin users and regular routes
    - Verify access to all regular user features

- [-] 15. Final checkpoint and integration verification
  - [ ] 15.1 Run all tests and verify passing
    - Execute full test suite (unit, property, integration)
    - Fix any failing tests
    - Verify test coverage meets minimum 80% for new code
  
  - [ ] 15.2 Manual verification of critical flows
    - Test complete login flow with both buttons
    - Test admin CRUD operations on ManagePage
    - Test furniture library updates reflected in editor
    - Test role-based navigation and route protection
    - Verify error handling for all edge cases
  
  - [ ] 15.3 Final checkpoint
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across randomized inputs
- Unit tests validate specific examples, edge cases, and integration points
- The implementation follows an incremental approach: models → services → components → integration
- All new code should maintain TypeScript strict mode compliance
- Firestore operations should include proper error handling and fallback behavior
