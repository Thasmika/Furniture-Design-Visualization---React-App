# Implementation Plan: Furniture Design Visualizer

## Overview

This implementation plan breaks down the furniture design visualizer into discrete, incremental coding tasks. The approach follows a bottom-up strategy: building core data models and business logic first, then adding visualization layers, and finally integrating persistence and authentication. Each task builds on previous work, ensuring the application remains functional at each checkpoint.

The implementation uses React with TypeScript for type safety, Redux for state management, react-konva for 2D canvas rendering, react-three-fiber for 3D WebGL rendering, and Firebase for authentication and cloud storage.

## Tasks

- [x] 1. Project setup and core infrastructure
  - Initialize React + TypeScript project with Vite or Create React App
  - Install dependencies: Redux Toolkit, react-konva, react-three-fiber, three, Firebase SDK, fast-check
  - Configure TypeScript with strict mode
  - Set up project structure: /src/models, /src/components, /src/store, /src/services, /src/utils
  - Configure Jest and React Testing Library for testing
  - _Requirements: 10.1, 10.2_

- [x] 2. Implement core data models
  - [x] 2.1 Create Room model with TypeScript interfaces and factory functions
    - Define Room interface with shape, dimensions, colorScheme, unit
    - Implement createRoom factory function
    - Implement dimension validation function (1-100 feet bounds)
    - Implement color validation function (hex code format)
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [x] 2.2 Write property test for Room model
    - **Property 1: Room Creation Accepts Valid Inputs**
    - **Property 2: Dimension Validation Rejects Invalid Inputs**
    - **Property 3: Color Scheme Acceptance**
    - **Validates: Requirements 1.1, 1.2, 1.4, 1.5, 1.6**
  
  - [x] 2.3 Create FurniturePiece model with TypeScript interfaces and factory functions
    - Define FurniturePiece interface with type, dimensions, position, color, scale
    - Implement createFurniture factory function with default dimensions per type
    - Implement furniture dimension validation (0.5-20 feet bounds)
    - Implement update functions: updatePosition, updateScale, updateColor
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_
  
  - [x] 2.4 Write property test for FurniturePiece model
    - **Property 4: Furniture Type Instantiation**
    - **Property 5: Furniture Property Updates**
    - **Property 2: Dimension Validation Rejects Invalid Inputs** (furniture dimensions)
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.6**
  
  - [x] 2.5 Create Design model with TypeScript interfaces
    - Define Design interface with id, userId, name, room, furniture array, timestamps
    - Implement createDesign factory function
    - Implement addFurniture, removeFurniture, updateFurniture functions
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [x] 2.6 Write unit tests for Design model operations
    - Test adding furniture to design
    - Test removing furniture from design
    - Test updating furniture in design
    - _Requirements: 6.1, 7.1_

- [x] 3. Implement validation and collision detection
  - [x] 3.1 Create validation engine
    - Implement validatePosition function (checks room boundaries)
    - Implement checkCollision function (bounding box intersection)
    - Implement validateDesign function (comprehensive design validation)
    - _Requirements: 3.4, 3.5, 12.5_
  
  - [x] 3.2 Write property tests for validation
    - **Property 9: Boundary Validation**
    - **Property 10: Collision Detection**
    - **Property 34: Pre-Save Validation**
    - **Validates: Requirements 3.4, 3.5, 12.5**

- [x] 4. Implement coordinate system utilities
  - [x] 4.1 Create coordinate conversion functions
    - Implement convert2Dto3D function
    - Implement convert3Dto2D function
    - Add unit tests for edge cases (room corners, center)
    - _Requirements: 4.6_
  
  - [x] 4.2 Write property test for coordinate round trip
    - **Property 13: 2D-3D Coordinate Round Trip**
    - **Validates: Requirements 4.6**

- [x] 5. Set up Redux store and state management
  - [x] 5.1 Configure Redux store with TypeScript
    - Create store configuration with Redux Toolkit
    - Define AppState interface matching design document
    - Set up Redux DevTools integration
    - _Requirements: All (state management foundation)_
  
  - [x] 5.2 Create auth slice
    - Define auth state shape (user, loading, error)
    - Create actions: login, logout, register, authStateChanged
    - Create reducers for auth state updates
    - Create selectors: isAuthenticated, getCurrentUser
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [x] 5.3 Create design slice
    - Define design state shape (current, saved, loading, error, isDirty)
    - Create actions: createDesign, loadDesign, saveDesign, deleteDesign, updateDesign
    - Create actions: updateRoom, addFurniture, removeFurniture, updateFurniturePosition, updateFurnitureScale, updateFurnitureColor
    - Create reducers for design state updates
    - Create selectors: getCurrentDesign, getSelectedFurniture, getFurnitureList, getRoom, isDirty
    - _Requirements: 1.1, 2.2, 2.3, 2.4, 6.1, 6.3, 6.4, 7.1, 7.2, 7.4_
  
  - [x] 5.4 Create UI slice
    - Define UI state shape (selectedFurnitureId, activeView, showGrid, snapToGrid, sidebarOpen)
    - Create actions: selectFurniture, setActiveView, toggleGrid, toggleSnapToGrid
    - Create reducers for UI state updates
    - _Requirements: 3.2, 3.6_
  
  - [x] 5.5 Write unit tests for Redux slices
    - Test auth actions and reducers
    - Test design actions and reducers
    - Test UI actions and reducers
    - Test selectors return correct values
    - _Requirements: All state management_

- [x] 6. Checkpoint - Core models and state management complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Firebase authentication service
  - [x] 7.1 Set up Firebase configuration
    - Initialize Firebase app with configuration
    - Set up Firebase Authentication
    - Create authentication service wrapper
    - _Requirements: 8.1, 8.2, 8.5_
  
  - [x] 7.2 Implement authentication functions
    - Implement registerUser function (email/password)
    - Implement authenticateUser function (login)
    - Implement logout function
    - Implement onAuthStateChanged listener
    - Integrate with Redux auth slice
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [x] 7.3 Write unit tests for authentication service
    - Test registration with valid credentials
    - Test login with valid credentials
    - Test logout clears session
    - Test auth state persistence
    - _Requirements: 8.1, 8.2, 8.5, 8.6_

- [x] 8. Implement Firebase Firestore storage service
  - [x] 8.1 Set up Firestore configuration
    - Initialize Firestore database
    - Define database structure (users/{userId}/designs/{designId})
    - Create storage service wrapper
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.2, 7.4_
  
  - [x] 8.2 Implement design persistence functions
    - Implement saveDesign function with retry logic (3 attempts)
    - Implement loadDesigns function (fetch all user designs)
    - Implement loadDesign function (fetch single design by ID)
    - Implement updateDesign function (preserve design ID)
    - Implement deleteDesign function
    - Add error handling for network failures
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.2, 7.4, 12.1, 12.2_
  
  - [x] 8.3 Write property tests for storage service
    - **Property 17: Design Persistence Round Trip**
    - **Property 18: User Association**
    - **Property 19: User Design Filtering**
    - **Property 20: Design ID Uniqueness**
    - **Property 23: Design ID Preservation During Updates**
    - **Property 24: Design Deletion Completeness**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 7.2, 7.4**
  
  - [x] 8.4 Write property tests for error handling
    - **Property 21: Save Failure State Preservation**
    - **Property 25: Deletion Failure Preservation**
    - **Property 30: Save Verification**
    - **Property 31: Retry Logic on Failure**
    - **Validates: Requirements 6.6, 7.5, 12.1, 12.2**

- [x] 9. Implement local cache service
  - [x] 9.1 Create local storage cache wrapper
    - Implement cacheDesign function (debounced 500ms)
    - Implement getCachedDesign function
    - Implement clearCache function
    - Store timestamp of last save
    - _Requirements: 12.3, 12.4_
  
  - [x] 9.2 Write property tests for cache service
    - **Property 32: Local Cache Persistence**
    - **Property 33: Cache Recovery Availability**
    - **Validates: Requirements 12.3, 12.4**

- [x] 10. Checkpoint - Backend services complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement 2D visualization with react-konva
  - [x] 11.1 Create Canvas2D component
    - Set up Konva Stage and Layer components
    - Implement coordinate scaling (1 foot = 20 pixels)
    - Connect to Redux store for room and furniture data
    - _Requirements: 3.1, 3.3_
  
  - [x] 11.2 Create RoomLayer component
    - Render room boundaries based on shape (Rect for rectangular/square, Circle for circular)
    - Apply room color scheme to floor
    - Render room outline
    - _Requirements: 3.1_
  
  - [x] 11.3 Create GridLayer component
    - Render measurement grid with 1-foot spacing
    - Show/hide based on UI state (showGrid)
    - _Requirements: 3.6_
  
  - [x] 11.4 Create FurnitureLayer component
    - Render each furniture piece as Rect or Circle shape
    - Apply furniture colors
    - Display furniture labels
    - Highlight selected furniture
    - Implement drag-and-drop with Konva draggable
    - Dispatch updateFurniturePosition action on drag end
    - Implement boundary validation (prevent dragging outside room)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 11.5 Write property tests for 2D rendering
    - **Property 6: 2D Rendering Completeness**
    - **Property 7: Furniture Position Updates**
    - **Property 8: Scale Preservation**
    - **Validates: Requirements 3.1, 3.2, 3.3**
  
  - [x] 11.6 Write unit tests for 2D components
    - Test RoomLayer renders correct shapes
    - Test FurnitureLayer renders all furniture
    - Test drag-and-drop updates position
    - Test boundary validation prevents invalid placement
    - _Requirements: 3.1, 3.2, 3.4_

- [x] 12. Implement 3D visualization with react-three-fiber
  - [x] 12.1 Create Scene3D component
    - Set up Canvas component from react-three-fiber
    - Configure perspective camera
    - Add ambient and directional lighting
    - Connect to Redux store for room and furniture data
    - _Requirements: 4.1, 4.7_
  
  - [x] 12.2 Create RoomMesh component
    - Create plane geometry for floor with room dimensions
    - Create plane geometry for ceiling
    - Create box geometries for walls
    - Apply room color scheme materials
    - _Requirements: 4.1, 4.7_
  
  - [x] 12.3 Create FurnitureMesh component
    - Create box geometry for each furniture piece based on dimensions
    - Apply furniture color materials
    - Position furniture using convert2Dto3D
    - Highlight selected furniture with emissive material
    - _Requirements: 4.1_
  
  - [x] 12.4 Create CameraController component
    - Implement OrbitControls from drei
    - Configure rotation, zoom, and pan controls
    - Add reset camera button
    - Dispatch camera state changes to Redux
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [x] 12.5 Write property tests for 3D rendering
    - **Property 11: 3D Rendering Completeness**
    - **Property 12: Camera Transformation Correctness**
    - **Property 14: Color Application in 3D**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.7**
  
  - [x] 12.6 Write unit tests for 3D components
    - Test RoomMesh creates correct geometries
    - Test FurnitureMesh renders all furniture
    - Test camera controls update position
    - Test color materials match design colors
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7_

- [x] 13. Implement view synchronization
  - [x] 13.1 Create rendering coordinator
    - Subscribe to Redux store changes
    - Trigger re-renders in both 2D and 3D views on state changes
    - Ensure coordinate conversion is applied consistently
    - _Requirements: 4.6, 5.6_
  
  - [x] 13.2 Write property test for view synchronization
    - **Property 16: View Synchronization**
    - **Validates: Requirements 5.6**

- [x] 14. Checkpoint - Visualization layers complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement UI components for room configuration
  - [x] 15.1 Create RoomConfigPanel component
    - Add shape selector (rectangular, square, circular)
    - Add dimension inputs (width, length/radius based on shape)
    - Add unit selector (feet, meters)
    - Add color pickers for walls, floor, ceiling
    - Dispatch updateRoom action on changes
    - Display validation errors inline
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 15.2 Write unit tests for RoomConfigPanel
    - Test shape selector changes dimension inputs
    - Test dimension validation displays errors
    - Test color pickers update room colors
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 16. Implement UI components for furniture management
  - [x] 16.1 Create FurnitureLibraryPanel component
    - Display furniture type buttons (chair, table, couch, bed, desk, shelf)
    - Dispatch addFurniture action on button click
    - Show furniture count in design
    - _Requirements: 2.1, 2.2_
  
  - [x] 16.2 Create PropertyEditorPanel component
    - Show selected furniture properties
    - Add dimension input fields
    - Add scale slider (0.5-3.0 range)
    - Add color picker
    - Add delete button
    - Dispatch update actions on changes
    - Display validation errors
    - _Requirements: 2.3, 2.4, 2.6, 5.1, 5.2, 5.3, 5.4_
  
  - [x] 16.3 Write property tests for furniture operations
    - **Property 15: Proportional Scaling with Aspect Ratio Preservation**
    - **Validates: Requirements 5.2, 5.5**
  
  - [x] 16.4 Write unit tests for furniture UI components
    - Test FurnitureLibraryPanel creates furniture
    - Test PropertyEditorPanel updates properties
    - Test scale slider maintains aspect ratio
    - Test color picker updates furniture color
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.2, 5.4_

- [x] 17. Implement authentication UI
  - [x] 17.1 Create LoginPage component
    - Add email and password input fields
    - Add login button
    - Add link to registration page
    - Dispatch login action
    - Display authentication errors
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [x] 17.2 Create RegisterPage component
    - Add email and password input fields
    - Add register button
    - Add link to login page
    - Dispatch register action
    - Display registration errors
    - _Requirements: 8.1_
  
  - [x] 17.3 Create authentication route guards
    - Redirect unauthenticated users to login page
    - Redirect authenticated users from login/register to app
    - _Requirements: 8.3, 8.4_
  
  - [x] 17.4 Write property test for authorization
    - **Property 26: Authorization Access Control**
    - **Property 27: Session Persistence**
    - **Validates: Requirements 8.3, 8.4, 8.6**

- [x] 18. Implement design management UI
  - [x] 18.1 Create DesignListPage component
    - Display list of saved designs
    - Add "New Design" button
    - Add load, edit, delete buttons for each design
    - Show confirmation dialog for delete
    - Dispatch loadDesign and deleteDesign actions
    - _Requirements: 6.3, 6.4, 7.3, 7.4_
  
  - [x] 18.2 Create SaveDesignDialog component
    - Add design name input field
    - Add save button
    - Dispatch saveDesign action
    - Show save progress and success/error messages
    - _Requirements: 6.1, 6.6, 12.1_
  
  - [x] 18.3 Create app header with save/load controls
    - Add save button (shows SaveDesignDialog)
    - Add "My Designs" button (navigates to DesignListPage)
    - Add logout button
    - Show unsaved changes indicator (isDirty)
    - _Requirements: 6.1, 6.3, 7.1, 8.5_
  
  - [x] 18.4 Write unit tests for design management UI
    - Test DesignListPage displays designs
    - Test delete confirmation dialog
    - Test SaveDesignDialog saves design
    - Test unsaved changes indicator
    - _Requirements: 6.1, 6.3, 6.4, 7.3, 7.4_

- [x] 19. Implement undo/redo functionality
  - [x] 19.1 Create history middleware for Redux
    - Track design state changes
    - Maintain undo/redo stacks
    - Implement undo and redo actions
    - Limit history size (50 operations)
    - _Requirements: 11.4_
  
  - [x] 19.2 Add undo/redo UI controls
    - Add undo button to toolbar
    - Add redo button to toolbar
    - Add keyboard shortcuts (Ctrl+Z, Ctrl+Y)
    - Disable buttons when stacks are empty
    - _Requirements: 11.4_
  
  - [x] 19.3 Write property test for undo functionality
    - **Property 28: Undo Reverses Changes**
    - **Validates: Requirements 11.4**

- [x] 20. Implement error handling and user feedback
  - [x] 20.1 Create ErrorBoundary component
    - Catch React rendering errors
    - Display error message to user
    - Log errors for debugging
    - Offer to reload application
    - _Requirements: 11.3_
  
  - [x] 20.2 Create Toast notification system
    - Display success messages (design saved, etc.)
    - Display error messages (save failed, network error, etc.)
    - Auto-dismiss after 5 seconds
    - Allow manual dismissal
    - _Requirements: 11.3, 12.6_
  
  - [x] 20.3 Add error handling to all async operations
    - Wrap Firebase calls in try-catch
    - Display toast notifications for errors
    - Implement retry logic for network errors
    - _Requirements: 6.6, 7.5, 12.2, 12.6_
  
  - [x] 20.4 Write property test for error messages
    - **Property 29: Error Messages Presence**
    - **Validates: Requirements 11.3, 12.6**

- [x] 21. Implement crash recovery
  - [x] 21.1 Create recovery service
    - Check for cached design on app startup
    - Compare cached timestamp with last saved timestamp
    - Show recovery dialog if unsaved changes detected
    - Offer to restore or discard cached design
    - _Requirements: 12.3, 12.4_
  
  - [x] 21.2 Integrate cache service with Redux
    - Subscribe to design state changes
    - Debounce cache writes (500ms)
    - Update cache on every design modification
    - Clear cache after successful save
    - _Requirements: 12.3_
  
  - [x] 21.3 Write unit tests for crash recovery
    - Test recovery dialog shows on startup with cached design
    - Test restore loads cached design
    - Test discard clears cache
    - _Requirements: 12.3, 12.4_

- [x] 22. Checkpoint - UI and error handling complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 23. Implement main application layout
  - [x] 23.1 Create AppLayout component
    - Set up responsive layout with header, sidebar, main content
    - Add view mode selector (2D, 3D, split view)
    - Integrate RoomConfigPanel in sidebar
    - Integrate FurnitureLibraryPanel in sidebar
    - Integrate PropertyEditorPanel in sidebar
    - Add collapsible sidebar
    - _Requirements: 11.1_
  
  - [x] 23.2 Create ViewContainer component
    - Render Canvas2D for 2D view mode
    - Render Scene3D for 3D view mode
    - Render both side-by-side for split view mode
    - Handle view mode switching
    - _Requirements: 3.1, 4.1_
  
  - [x] 23.3 Write unit tests for layout components
    - Test AppLayout renders all panels
    - Test ViewContainer switches between view modes
    - Test sidebar collapse/expand
    - _Requirements: 11.1_

- [x] 24. Implement routing and navigation
  - [x] 24.1 Set up React Router
    - Configure routes: /login, /register, /designs, /editor
    - Implement route guards for authentication
    - Add navigation between pages
    - _Requirements: 8.3, 8.4_
  
  - [x] 24.2 Create App component
    - Set up Router with routes
    - Add authentication state listener
    - Initialize Firebase on mount
    - Render ErrorBoundary
    - _Requirements: 8.6_

- [x] 25. Add tooltips and help text
  - [x] 25.1 Create Tooltip component
    - Display on hover for UI controls
    - Add tooltips to all major features
    - Include keyboard shortcuts in tooltips
    - _Requirements: 11.2_
  
  - [x] 25.2 Write unit tests for tooltips
    - Test tooltips appear on hover
    - Test tooltip content is descriptive
    - _Requirements: 11.2_

- [x] 26. Performance optimization
  - [x] 26.1 Optimize 2D rendering
    - Implement canvas layer caching
    - Use Konva's hitGraph optimization
    - Debounce drag events
    - _Requirements: 9.1_
  
  - [x] 26.2 Optimize 3D rendering
    - Use instanced meshes for repeated furniture
    - Implement frustum culling
    - Reduce polygon count for furniture models
    - Enable anti-aliasing
    - _Requirements: 9.2, 9.5_
  
  - [x] 26.3 Optimize state updates
    - Use Redux Toolkit's createSelector for memoization
    - Implement React.memo for expensive components
    - Use useCallback and useMemo hooks
    - _Requirements: 9.3_

- [x] 27. Cross-platform testing and compatibility
  - [x] 27.1 Set up Electron for desktop packaging
    - Configure Electron main process
    - Configure Electron renderer process
    - Set up build scripts for Windows and macOS
    - _Requirements: 10.1, 10.2_
  
  - [x] 27.2 Test on Windows
    - Test all features on Windows 10/11
    - Verify UI consistency
    - Test file paths and platform-specific APIs
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [x] 27.3 Test on macOS
    - Test all features on macOS Catalina and later
    - Verify UI consistency
    - Test file paths and platform-specific APIs
    - _Requirements: 10.2, 10.3, 10.4_

- [x] 28. Final integration and end-to-end testing
  - [x] 28.1 Write E2E tests for critical workflows
    - Test complete user journey: register → create design → save → load → edit → delete
    - Test authentication flow
    - Test design persistence
    - Test 2D and 3D visualization
    - _Requirements: All_
  
  - [x] 28.2 Run all property tests with increased iterations
    - Run all 34 property tests with 1000 iterations
    - Fix any failures discovered
    - Document any edge cases found
    - _Requirements: All_

- [x] 29. Final checkpoint - Complete application
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all 12 requirements are implemented
  - Verify all 34 correctness properties are tested
  - Verify application runs on both Windows and macOS

## Notes

- All tasks are required for comprehensive implementation with full test coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples, edge cases, and component integration
- The implementation follows a bottom-up approach: models → services → visualization → UI
- TypeScript provides type safety throughout the application
- Redux provides centralized state management with time-travel debugging
- Firebase provides authentication and cloud storage without backend development
- react-konva and react-three-fiber provide declarative 2D and 3D rendering
