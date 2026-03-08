# FurniVision - Complete Technical Documentation

**Application**: Furniture Design Visualizer  
**Technology Stack**: React 19.2, TypeScript 5.9, Redux Toolkit, Three.js, Firebase, Electron  
**Architecture**: Layered Component-Based Architecture  
**Last Updated**: February 15, 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Root Directory Files](#root-directory-files)
4. [Source Code Structure](#source-code-structure)
5. [Models Layer](#models-layer)
6. [Services Layer](#services-layer)
7. [Store Layer (State Management)](#store-layer)
8. [Components Layer](#components-layer)
9. [Pages Layer](#pages-layer)
10. [Utils Layer](#utils-layer)
11. [Testing Infrastructure](#testing-infrastructure)
12. [Configuration Files](#configuration-files)
13. [Data Flow Architecture](#data-flow-architecture)
14. [Deployment Structure](#deployment-structure)

---

## 1. Project Overview

FurniVision is a desktop application built with React and Electron that enables furniture designers to create, visualize, and manage furniture layouts in virtual rooms. The application provides dual visualization modes (2D canvas and 3D WebGL) with real-time synchronization.

### Key Features
- Room configuration with multiple shapes (rectangular, square, circular)
- Furniture library with 8 furniture types
- 2D top-down view with drag-and-drop
- 3D perspective view with camera controls
- Real-time property editing (size, color, position)
- Cloud-based design persistence with Firebase
- User authentication and authorization
- Undo/redo functionality (50 operations)
- Crash recovery with local caching
- Cross-platform support (Windows, macOS)

### Architecture Pattern
The application follows a **Layered Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│     Presentation Layer (Pages/UI)       │
├─────────────────────────────────────────┤
│   Components Layer (React Components)   │
├─────────────────────────────────────────┤
│  State Management (Redux Store)         │
├─────────────────────────────────────────┤
│   Business Logic (Models/Utils)         │
├─────────────────────────────────────────┤
│    Services Layer (Firebase/Cache)      │
└─────────────────────────────────────────┘
```

---

## 2. Project Structure


```
furniture-design-visualizer/
├── .git/                          # Git version control
├── .kiro/                         # Kiro IDE specifications
│   └── specs/
│       └── furniture-design-visualizer/
│           ├── requirements.md    # Functional requirements
│           ├── design.md          # System design document
│           ├── tasks.md           # Implementation tasks
│           └── evaluation-report.md
├── .vscode/                       # VS Code settings
├── dist/                          # Production build output
├── electron/                      # Electron main process
│   ├── main.js                   # Electron entry point
│   └── preload.js                # Preload scripts
├── node_modules/                  # Dependencies
├── public/                        # Static assets
│   └── vite.svg                  # App icon
├── src/                          # Source code (detailed below)
├── tests/                        # E2E and platform tests
│   ├── e2e/
│   │   └── critical-workflows.test.tsx
│   └── platform/
│       ├── macos.test.ts
│       └── windows.test.ts
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── electron.d.ts                 # Electron TypeScript definitions
├── eslint.config.js              # ESLint configuration
├── FIREBASE_SETUP.md             # Firebase setup guide
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── package-lock.json             # Locked dependencies
├── PROJECT_SETUP.md              # Project setup guide
├── README.md                     # Project readme
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.app.json             # App TypeScript config
├── tsconfig.node.json            # Node TypeScript config
├── vite.config.ts                # Vite build configuration
└── vitest.config.ts              # Vitest test configuration
```

---

## 3. Root Directory Files

### 3.1 Configuration Files

#### `package.json`
**Purpose**: Defines project metadata, dependencies, and npm scripts.

**Key Dependencies**:
- **React Ecosystem**: `react@19.2.0`, `react-dom@19.2.0`, `react-router-dom@7.13.0`
- **State Management**: `@reduxjs/toolkit@2.11.2`, `react-redux@9.2.0`
- **2D Visualization**: `react-konva@19.2.2`, `konva@10.2.0`
- **3D Visualization**: `react-three-fiber@9.5.0`, `@react-three/drei@10.7.7`, `three@0.182.0`
- **Backend**: `firebase@12.9.0`
- **Testing**: `vitest@4.0.18`, `@testing-library/react@16.3.2`, `fast-check@4.5.3`
- **Desktop**: `electron@40.4.0`, `electron-builder@26.7.0`

**Key Scripts**:
```json
{
  "dev": "vite",                    // Development server
  "build": "tsc -b && vite build",  // Production build
  "test": "vitest --run",           // Run tests once
  "electron:dev": "...",            // Electron dev mode
  "electron:build": "...",          // Build desktop app
}
```


#### `tsconfig.json`
**Purpose**: TypeScript compiler configuration for the entire project.

**Key Settings**:
- `strict: true` - Enables all strict type-checking options
- `target: "ES2020"` - Compiles to ES2020 JavaScript
- `module: "ESNext"` - Uses ESNext module system
- `jsx: "react-jsx"` - React 17+ JSX transform
- `moduleResolution: "bundler"` - Vite-compatible resolution

#### `vite.config.ts`
**Purpose**: Vite build tool configuration.

**Features**:
- React plugin with Fast Refresh
- Path aliases for clean imports
- Development server on port 5173
- Production build optimization
- Asset handling and code splitting

#### `vitest.config.ts`
**Purpose**: Vitest testing framework configuration.

**Features**:
- jsdom environment for DOM testing
- Global test utilities
- Coverage reporting
- Test file patterns: `**/*.test.{ts,tsx}`

#### `eslint.config.js`
**Purpose**: ESLint code quality and style enforcement.

**Rules**:
- React hooks rules
- TypeScript-specific rules
- Import/export validation
- Code style consistency

#### `.env`
**Purpose**: Environment variables for Firebase and API keys.

**Variables**:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3.2 Documentation Files

#### `README.md`
Standard project readme with setup instructions and technology overview.

#### `PROJECT_SETUP.md`
Detailed setup guide including:
- Technology stack explanation
- Project structure overview
- Available npm scripts
- Development workflow

#### `FIREBASE_SETUP.md`
Firebase configuration guide:
- Creating Firebase project
- Enabling Authentication
- Setting up Firestore
- Security rules configuration

---

## 4. Source Code Structure

The `src/` directory contains all application source code, organized by architectural layer:

```
src/
├── models/          # Data models and business logic
├── services/        # External service integrations
├── store/           # Redux state management
├── components/      # React UI components
├── pages/           # Page-level components
├── utils/           # Utility functions
├── test/            # Test setup and utilities
├── assets/          # Static assets (images, icons)
├── App.tsx          # Root application component
├── App.css          # Global application styles
├── main.tsx         # Application entry point
└── index.css        # Global CSS styles
```


### 4.1 Entry Points

#### `src/main.tsx`
**Purpose**: Application entry point that mounts React to the DOM.

**Responsibilities**:
- Imports global CSS styles
- Creates React root
- Wraps App with StrictMode
- Mounts to `#root` div in `index.html`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### `src/App.tsx`
**Purpose**: Root application component that sets up routing and providers.

**Responsibilities**:
- Redux Provider setup
- React Router configuration
- Firebase initialization
- Authentication state listener
- Error boundary wrapper
- Route definitions

**Routes**:
- `/login` - Login page (public)
- `/register` - Registration page (public)
- `/designs` - Design list page (protected)
- `/editor` - Main editor page (protected)
- `/profile` - User profile (protected)
- `/contact` - Contact page
- `/reviews` - Reviews page

#### `src/App.css` & `src/index.css`
**Purpose**: Global application styles.

**Features**:
- CSS variables for theming
- Reset styles
- Typography
- Layout utilities
- Responsive breakpoints

---

## 5. Models Layer

**Location**: `src/models/`

**Purpose**: Core data models representing business entities with TypeScript interfaces and factory functions.

### 5.1 Room Model (`Room.ts`)

**Purpose**: Represents a physical room with dimensions, shape, and color scheme.

**Interface**:
```typescript
interface Room {
  id: string;
  shape: 'rectangular' | 'square' | 'circular';
  dimensions: {
    width: number;   // in feet
    length: number;  // in feet (rectangular/square)
    radius: number;  // in feet (circular)
  };
  colorScheme: {
    walls: string;   // hex color
    floor: string;   // hex color
    ceiling: string; // hex color
  };
  unit: 'feet' | 'meters';
}
```

**Functions**:
- `createRoom()` - Factory function with validation
- `validateDimensions()` - Validates 1-100 feet bounds
- `updateColorScheme()` - Updates room colors
- `convertUnits()` - Converts between feet/meters

**Validation Rules**:
- Dimensions must be positive numbers
- Width/length: 1-100 feet
- Radius: 1-100 feet for circular rooms
- Colors must be valid hex codes

**Test File**: `Room.test.ts` (12 tests)
- Property-based tests for valid inputs
- Dimension validation tests
- Color scheme validation tests


### 5.2 FurniturePiece Model (`FurniturePiece.ts`)

**Purpose**: Represents a furniture item with type, dimensions, position, and appearance.

**Interface**:
```typescript
interface FurniturePiece {
  id: string;
  type: 'chair' | 'table' | 'couch' | 'bed' | 'desk' | 
        'shelf' | 'cabinet' | 'lamp';
  dimensions: {
    width: number;   // in feet
    depth: number;   // in feet
    height: number;  // in feet
  };
  position: {
    x: number;       // in feet from room origin
    y: number;       // in feet from room origin
    z: number;       // elevation (typically 0)
    rotation: number; // degrees (0-360)
  };
  color: string;     // hex color
  scale: number;     // multiplier (0.5-3.0)
}
```

**Default Dimensions by Type**:
- Chair: 2' × 2' × 3'
- Table: 4' × 3' × 2.5'
- Couch: 7' × 3' × 3'
- Bed: 6.5' × 5' × 2'
- Desk: 5' × 2.5' × 2.5'
- Shelf: 3' × 1' × 6'
- Cabinet: 4' × 2' × 5'
- Lamp: 1.5' × 1.5' × 4'

**Functions**:
- `createFurniture()` - Creates with default properties
- `updatePosition()` - Updates furniture position
- `updateScale()` - Scales furniture (preserves aspect ratio)
- `updateColor()` - Changes furniture color
- `validatePosition()` - Checks room boundaries
- `checkCollision()` - Detects overlapping furniture

**Test Files**:
- `FurniturePiece.test.ts` (15 tests) - Unit tests
- `FurniturePiece.scaling.test.ts` (5 tests) - Property-based scaling tests

### 5.3 Design Model (`Design.ts`)

**Purpose**: Represents a complete furniture layout including room and all furniture pieces.

**Interface**:
```typescript
interface Design {
  id: string;
  userId: string;
  name: string;
  room: Room;
  furniture: FurniturePiece[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
```

**Functions**:
- `createDesign()` - Creates new design
- `addFurniture()` - Adds furniture to design
- `removeFurniture()` - Removes furniture by ID
- `updateFurniture()` - Updates furniture properties
- `validateDesign()` - Comprehensive validation

**Test File**: `Design.test.ts` (8 tests)
- Design creation tests
- Furniture management tests
- Validation tests

### 5.4 Index File (`index.ts`)

**Purpose**: Barrel export for all models.

```typescript
export * from './Room';
export * from './FurniturePiece';
export * from './Design';
```

---

## 6. Services Layer

**Location**: `src/services/`

**Purpose**: External service integrations and data persistence.


### 6.1 Firebase Service (`firebase.ts`)

**Purpose**: Firebase initialization and configuration.

**Exports**:
- `app` - Firebase app instance
- `auth` - Firebase Authentication instance
- `db` - Firestore database instance

**Configuration**:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

### 6.2 Authentication Service (`authService.ts`)

**Purpose**: User authentication operations.

**Functions**:
- `registerUser(email, password)` - Creates new user account
- `authenticateUser(email, password)` - Logs in user
- `logoutUser()` - Signs out current user
- `onAuthStateChanged(callback)` - Listens for auth state changes
- `getCurrentUser()` - Returns current authenticated user

**Features**:
- Email/password authentication
- Session persistence
- Error handling with descriptive messages
- Integration with Redux auth slice

**Test File**: `authService.test.ts` (12 tests)
- Registration tests
- Login tests
- Logout tests
- Auth state persistence tests

### 6.3 Storage Service (`storageService.ts`)

**Purpose**: Design persistence with Firestore.

**Firestore Structure**:
```
users/
  {userId}/
    profile: { email, displayName, createdAt }
    designs/
      {designId}/
        { name, room, furniture, createdAt, updatedAt, version }
```

**Functions**:
- `saveDesign(userId, design)` - Saves design with retry logic (3 attempts)
- `loadDesigns(userId)` - Fetches all user designs
- `loadDesign(userId, designId)` - Fetches single design
- `updateDesign(userId, designId, design)` - Updates existing design
- `deleteDesign(userId, designId)` - Deletes design

**Features**:
- Exponential backoff retry (1s, 2s, 4s delays)
- Error handling for network failures
- Design ID preservation during updates
- User-specific data isolation

**Test File**: `storageService.test.ts` (16 tests)
- Save/load round trip tests
- User association tests
- Design ID uniqueness tests
- Error handling tests

### 6.4 Cache Service (`cacheService.ts`)

**Purpose**: Local storage caching for crash recovery.

**Functions**:
- `cacheDesign(design)` - Saves design to localStorage (debounced 500ms)
- `getCachedDesign()` - Retrieves cached design
- `clearCache()` - Removes cached design
- `getLastSaveTimestamp()` - Returns last save time

**Cache Structure**:
```typescript
interface CachedDesign {
  design: Design;
  timestamp: Date;
  lastSavedTimestamp: Date | null;
}
```

**Features**:
- Debounced writes (500ms)
- Timestamp tracking
- Automatic cleanup after successful save

**Test File**: `cacheService.test.ts` (8 tests)
- Cache persistence tests
- Recovery availability tests
- Timestamp tracking tests


### 6.5 Recovery Service (`recoveryService.ts`)

**Purpose**: Crash recovery coordination.

**Functions**:
- `checkForRecovery()` - Checks for unsaved cached design on startup
- `shouldOfferRecovery()` - Determines if recovery dialog should show
- `restoreDesign()` - Restores cached design to Redux store
- `discardRecovery()` - Clears cached design

**Logic**:
```typescript
// Show recovery if:
// 1. Cached design exists
// 2. Cache timestamp > last save timestamp
// 3. Time difference > 1 minute
```

**Test File**: `recoveryService.test.ts` (6 tests)
- Recovery detection tests
- Restore functionality tests
- Discard functionality tests

### 6.6 Index File (`index.ts`)

**Purpose**: Barrel export for all services.

```typescript
export * from './firebase';
export * from './authService';
export * from './storageService';
export * from './cacheService';
export * from './recoveryService';
```

---

## 7. Store Layer (State Management)

**Location**: `src/store/`

**Purpose**: Redux Toolkit state management with TypeScript.

**Structure**:
```
store/
├── slices/              # Redux slices
│   ├── authSlice.ts
│   ├── authThunks.ts
│   ├── designSlice.ts
│   ├── designThunks.ts
│   └── uiSlice.ts
├── middleware/          # Custom middleware
│   ├── historyMiddleware.ts
│   └── cacheMiddleware.ts
├── index.ts            # Store configuration
├── hooks.ts            # Typed Redux hooks
├── selectors.ts        # Memoized selectors
└── types.ts            # TypeScript types
```

### 7.1 Store Configuration (`index.ts`)

**Purpose**: Configures Redux store with middleware and DevTools.

**Features**:
- Redux Toolkit configuration
- Custom middleware integration
- Redux DevTools integration
- TypeScript type exports

```typescript
export const store = configureStore({
  reducer: {
    auth: authReducer,
    design: designReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(historyMiddleware)
      .concat(cacheMiddleware),
});
```

### 7.2 Type Definitions (`types.ts`)

**Purpose**: TypeScript types for Redux state.

**State Shape**:
```typescript
interface RootState {
  auth: {
    user: User | null;
    loading: boolean;
    error: string | null;
  };
  design: {
    current: Design | null;
    saved: Design[];
    loading: boolean;
    error: string | null;
    isDirty: boolean;
  };
  ui: {
    selectedFurnitureId: string | null;
    activeView: '2d' | '3d' | 'split';
    showGrid: boolean;
    snapToGrid: boolean;
    sidebarOpen: boolean;
  };
}
```

### 7.3 Custom Hooks (`hooks.ts`)

**Purpose**: Typed Redux hooks for TypeScript.

**Exports**:
```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**Usage**:
```typescript
// Instead of useDispatch and useSelector
const dispatch = useAppDispatch();
const user = useAppSelector(state => state.auth.user);
```


### 7.4 Auth Slice (`authSlice.ts`)

**Purpose**: Authentication state management.

**State**:
```typescript
{
  user: User | null,
  loading: boolean,
  error: string | null
}
```

**Actions**:
- `setUser(user)` - Sets authenticated user
- `clearUser()` - Clears user on logout
- `setLoading(boolean)` - Sets loading state
- `setError(message)` - Sets error message

**Test File**: `authSlice.test.ts` (14 tests)

### 7.5 Auth Thunks (`authThunks.ts`)

**Purpose**: Async authentication operations.

**Thunks**:
- `loginThunk(email, password)` - Async login
- `registerThunk(email, password)` - Async registration
- `logoutThunk()` - Async logout

**Features**:
- Error handling
- Loading state management
- Integration with authService

**Test File**: `authThunks.test.ts` (8 tests)

### 7.6 Design Slice (`designSlice.ts`)

**Purpose**: Design state management.

**State**:
```typescript
{
  current: Design | null,
  saved: Design[],
  loading: boolean,
  error: string | null,
  isDirty: boolean
}
```

**Actions**:
- `createDesign(design)` - Creates new design
- `loadDesign(design)` - Loads existing design
- `updateRoom(room)` - Updates room configuration
- `addFurniture(furniture)` - Adds furniture piece
- `removeFurniture(id)` - Removes furniture
- `updateFurniturePosition(id, position)` - Updates position
- `updateFurnitureScale(id, scale)` - Updates scale
- `updateFurnitureColor(id, color)` - Updates color
- `setDirty(boolean)` - Marks design as modified

**Test File**: `designSlice.test.ts` (19 tests)

### 7.7 Design Thunks (`designThunks.ts`)

**Purpose**: Async design operations.

**Thunks**:
- `saveDesignThunk(design)` - Saves design to Firestore
- `loadDesignsThunk(userId)` - Loads all user designs
- `deleteDesignThunk(designId)` - Deletes design

**Features**:
- Retry logic integration
- Error handling
- Loading state management

### 7.8 UI Slice (`uiSlice.ts`)

**Purpose**: UI state management.

**State**:
```typescript
{
  selectedFurnitureId: string | null,
  activeView: '2d' | '3d' | 'split',
  showGrid: boolean,
  snapToGrid: boolean,
  sidebarOpen: boolean
}
```

**Actions**:
- `selectFurniture(id)` - Selects furniture piece
- `setActiveView(view)` - Changes view mode
- `toggleGrid()` - Toggles grid visibility
- `toggleSnapToGrid()` - Toggles snap-to-grid
- `toggleSidebar()` - Toggles sidebar

**Test File**: `uiSlice.test.ts` (8 tests)

### 7.9 Selectors (`selectors.ts`)

**Purpose**: Memoized selectors for derived state.

**Selectors**:
- `getCurrentDesign(state)` - Returns current design
- `getSelectedFurniture(state)` - Returns selected furniture
- `getFurnitureList(state)` - Returns all furniture
- `getRoom(state)` - Returns room configuration
- `isAuthenticated(state)` - Returns auth status
- `isDirty(state)` - Returns dirty flag

**Features**:
- Memoization with `createSelector`
- Performance optimization
- Derived state computation

**Test File**: `selectors.test.ts` (11 tests)


### 7.10 History Middleware (`historyMiddleware.ts`)

**Purpose**: Implements undo/redo functionality.

**Features**:
- Tracks design state changes
- Maintains undo/redo stacks (max 50 operations)
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- Ignores non-design actions

**Actions**:
- `undo()` - Reverts to previous state
- `redo()` - Reapplies undone state

**Test File**: `historyMiddleware.test.ts` (7 tests)

### 7.11 Cache Middleware (`cacheMiddleware.ts`)

**Purpose**: Automatically caches design changes.

**Features**:
- Listens for design state changes
- Debounced cache writes (500ms)
- Clears cache after successful save
- Timestamps all cache operations

**Test File**: `cacheMiddleware.test.ts` (6 tests)

---

## 8. Components Layer

**Location**: `src/components/`

**Purpose**: Reusable React UI components.

**Categories**:
1. Layout Components
2. Visualization Components
3. Configuration Panels
4. Dialog Components
5. Utility Components
6. Route Guards

### 8.1 Layout Components

#### `AppLayout.tsx`
**Purpose**: Main application layout container.

**Features**:
- Header with navigation
- Collapsible sidebar
- Main content area
- Responsive design

**Structure**:
```
┌─────────────────────────────────┐
│         AppHeader               │
├──────────┬──────────────────────┤
│ Sidebar  │   Main Content       │
│          │                      │
│ - Room   │   ViewContainer      │
│ - Furn.  │   (2D/3D views)      │
│ - Props  │                      │
└──────────┴──────────────────────┘
```

**Test File**: `AppLayout.test.tsx` (10 tests)

#### `AppHeader.tsx`
**Purpose**: Application header with navigation and actions.

**Features**:
- Save button
- "My Designs" button
- Logout button
- Unsaved changes indicator
- View mode selector

**Test File**: `AppHeader.test.tsx` (9 tests)

#### `ViewContainer.tsx`
**Purpose**: Container for 2D/3D visualization views.

**View Modes**:
- `2d` - Canvas2D only
- `3d` - Scene3D only
- `split` - Both views side-by-side

**Test File**: `ViewContainer.test.tsx` (8 tests)

### 8.2 Visualization Components

#### `Canvas2D.tsx`
**Purpose**: 2D top-down canvas view using react-konva.

**Features**:
- Konva Stage and Layer setup
- Coordinate scaling (1 foot = 20 pixels)
- Redux integration
- Event handling

**Child Components**:
- `RoomLayer` - Renders room boundaries
- `GridLayer` - Renders measurement grid
- `FurnitureLayer` - Renders furniture pieces

**Test File**: `Canvas2D.test.tsx` (14 tests)


#### `RoomLayer.tsx`
**Purpose**: Renders room boundaries in 2D canvas.

**Features**:
- Rectangular/square rooms: Konva Rect
- Circular rooms: Konva Circle
- Floor color fill
- Outline stroke

#### `GridLayer.tsx`
**Purpose**: Renders measurement grid overlay.

**Features**:
- 1-foot spacing
- Toggle visibility
- Light gray lines
- Coordinate labels

#### `FurnitureLayer.tsx`
**Purpose**: Renders furniture pieces in 2D canvas.

**Features**:
- Drag-and-drop with Konva
- Boundary validation
- Selection highlighting
- Furniture labels
- Color application

#### `Scene3D.tsx`
**Purpose**: 3D perspective view using react-three-fiber.

**Features**:
- Three.js Canvas setup
- Perspective camera
- Ambient + directional lighting
- Redux integration

**Child Components**:
- `RoomMesh` - 3D room geometry
- `FurnitureMesh` - 3D furniture geometry
- `CameraController` - Orbit controls

**Test File**: `Scene3D.test.tsx` (12 tests)

#### `RoomMesh.tsx`
**Purpose**: 3D room geometry (walls, floor, ceiling).

**Features**:
- Plane geometry for floor/ceiling
- Box geometry for walls
- Material with room colors
- Proper positioning

**Test File**: `RoomMesh.test.tsx` (8 tests)

#### `FurnitureMesh.tsx`
**Purpose**: 3D furniture geometry.

**Features**:
- Box geometry based on dimensions
- Material with furniture color
- Position using convert2Dto3D
- Selection highlighting (emissive)

**Test File**: `FurnitureMesh.test.tsx` (9 tests)

#### `CameraController.tsx`
**Purpose**: 3D camera controls.

**Features**:
- OrbitControls from drei
- Rotation (click-drag)
- Zoom (mouse wheel)
- Pan (right-click drag)
- Reset button

**Test File**: `CameraController.test.tsx` (6 tests)

#### `RenderingCoordinator.tsx`
**Purpose**: Synchronizes 2D and 3D views.

**Features**:
- Subscribes to Redux store
- Triggers re-renders on state changes
- Coordinate conversion consistency

**Test Files**:
- `RenderingCoordinator.test.tsx` (5 tests)
- `ViewSynchronization.test.ts` (4 tests)

### 8.3 Configuration Panels

#### `RoomConfigPanel.tsx`
**Purpose**: Room configuration UI.

**Features**:
- Shape selector (rectangular, square, circular)
- Dimension inputs (width, length, radius)
- Unit selector (feet, meters)
- Color pickers (walls, floor, ceiling)
- Inline validation errors

**Test File**: `RoomConfigPanel.test.tsx` (11 tests)


#### `FurnitureLibraryPanel.tsx`
**Purpose**: Furniture selection library.

**Features**:
- 8 furniture type buttons
- Icon/image for each type
- Furniture count display
- Add to design action

**Furniture Types**:
- Chair, Table, Couch, Bed
- Desk, Shelf, Cabinet, Lamp

**Test File**: `FurnitureLibraryPanel.test.tsx` (8 tests)

#### `PropertyEditorPanel.tsx`
**Purpose**: Selected furniture property editor.

**Features**:
- Dimension inputs (width, depth, height)
- Scale slider (0.5-3.0x)
- Color picker
- Delete button
- Real-time updates

**Test File**: `PropertyEditorPanel.test.tsx` (13 tests)

### 8.4 Dialog Components

#### `SaveDesignDialog.tsx`
**Purpose**: Design save dialog.

**Features**:
- Design name input
- Save button
- Progress indicator
- Success/error messages
- Cancel button

**Test File**: `SaveDesignDialog.test.tsx` (7 tests)

#### `RecoveryDialog.tsx`
**Purpose**: Crash recovery dialog.

**Features**:
- Shows on startup if unsaved work detected
- Restore button
- Discard button
- Timestamp display

**Test File**: `RecoveryDialog.test.tsx` (6 tests)

### 8.5 Utility Components

#### `Toast.tsx`
**Purpose**: Toast notification system.

**Features**:
- Success/error/info types
- Auto-dismiss (5 seconds)
- Manual dismiss button
- Stacking support

**Test File**: `Toast.test.tsx` (5 tests)

#### `Tooltip.tsx`
**Purpose**: Tooltip component for help text.

**Features**:
- Hover trigger
- Keyboard shortcut display
- Positioning (top, bottom, left, right)
- Accessible (ARIA)

**Test File**: `Tooltip.test.tsx` (4 tests)

#### `ErrorBoundary.tsx`
**Purpose**: React error boundary for graceful error handling.

**Features**:
- Catches rendering errors
- Displays error message
- Reload button
- Error logging

**Test File**: `ErrorBoundary.test.tsx` (4 tests)

### 8.6 Route Guards

#### `ProtectedRoute.tsx`
**Purpose**: Route guard for authenticated users only.

**Logic**:
```typescript
if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
return <Outlet />;
```

#### `PublicRoute.tsx`
**Purpose**: Route guard for unauthenticated users (login/register).

**Logic**:
```typescript
if (isAuthenticated) {
  return <Navigate to="/editor" />;
}
return <Outlet />;
```

**Test File**: `authorization.test.tsx` (8 tests)

### 8.7 Index File (`index.ts`)

**Purpose**: Barrel export for all components.

```typescript
export * from './AppLayout';
export * from './AppHeader';
export * from './Canvas2D';
export * from './Scene3D';
// ... etc
```


---

## 9. Pages Layer

**Location**: `src/pages/`

**Purpose**: Page-level components representing full screens/routes.

### 9.1 LoginPage (`LoginPage.tsx`)

**Purpose**: User login page.

**Features**:
- Email input field
- Password input field
- Login button
- Link to registration page
- Error message display
- Form validation

**Route**: `/login` (public)

**Styling**: `LoginPage.css`

### 9.2 RegisterPage (`RegisterPage.tsx`)

**Purpose**: User registration page.

**Features**:
- Email input field
- Password input field
- Confirm password field
- Register button
- Link to login page
- Error message display
- Password strength indicator

**Route**: `/register` (public)

**Styling**: `RegisterPage.css`

### 9.3 EditorPage (`EditorPage.tsx`)

**Purpose**: Main design editor page.

**Features**:
- AppLayout wrapper
- RoomConfigPanel
- FurnitureLibraryPanel
- PropertyEditorPanel
- ViewContainer (2D/3D views)
- Undo/redo buttons

**Route**: `/editor` (protected)

**Styling**: `EditorPage.css`

### 9.4 DesignListPage (`DesignListPage.tsx`)

**Purpose**: Saved designs list page.

**Features**:
- Grid of design cards
- Thumbnail previews
- Design name and date
- Load button
- Edit button
- Delete button (with confirmation)
- "New Design" button

**Route**: `/designs` (protected)

**Styling**: `DesignListPage.css`

**Test File**: `DesignListPage.test.tsx` (12 tests)

### 9.5 ProfilePage (`ProfilePage.tsx`)

**Purpose**: User profile page.

**Features**:
- User email display
- Account creation date
- Change password option
- Delete account option
- Design statistics

**Route**: `/profile` (protected)

**Styling**: `ProfilePage.css`

### 9.6 ContactPage (`ContactPage.tsx`)

**Purpose**: Contact/support page.

**Features**:
- Contact form
- Email input
- Message textarea
- Submit button
- Support information

**Route**: `/contact` (public)

**Styling**: `ContactPage.css`

### 9.7 ReviewsPage (`ReviewsPage.tsx`)

**Purpose**: User reviews and testimonials page.

**Features**:
- Review cards
- Star ratings
- User testimonials
- Pagination

**Route**: `/reviews` (public)

**Styling**: `ReviewsPage.css`

### 9.8 Index File (`index.ts`)

**Purpose**: Barrel export for all pages.

```typescript
export * from './LoginPage';
export * from './RegisterPage';
export * from './EditorPage';
export * from './DesignListPage';
export * from './ProfilePage';
export * from './ContactPage';
export * from './ReviewsPage';
```

---

## 10. Utils Layer

**Location**: `src/utils/`

**Purpose**: Utility functions and helpers.


### 10.1 Validation Utilities (`validation.ts`)

**Purpose**: Input validation functions.

**Functions**:
- `validateDimensions(dimensions)` - Validates room/furniture dimensions
- `validateColor(color)` - Validates hex color codes
- `validatePosition(furniture, room)` - Validates furniture position
- `checkCollision(furniture1, furniture2)` - Detects collisions
- `validateDesign(design)` - Comprehensive design validation

**Validation Rules**:
- Room dimensions: 1-100 feet
- Furniture dimensions: 0.5-20 feet
- Colors: Valid hex codes (#RGB or #RRGGBB)
- Positions: Within room boundaries
- Collisions: Bounding box intersection

**Test File**: `validation.test.ts` (18 tests)

### 10.2 Coordinate Utilities (`coordinates.ts`)

**Purpose**: 2D ↔ 3D coordinate conversion.

**Functions**:
- `convert2Dto3D(pos2D, room)` - Converts 2D to 3D coordinates
- `convert3Dto2D(pos3D, room)` - Converts 3D to 2D coordinates

**Coordinate Systems**:

**2D System**:
- Origin (0, 0) at top-left corner
- X-axis: increases right
- Y-axis: increases down
- Units: feet

**3D System**:
- Origin (0, 0, 0) at room center floor
- X-axis: increases right
- Y-axis: increases up (height)
- Z-axis: increases toward viewer
- Units: feet

**Conversion Logic**:
```typescript
// 2D to 3D
function convert2Dto3D(pos2D, room) {
  const centerX = room.dimensions.width / 2;
  const centerZ = room.dimensions.length / 2;
  
  return {
    x: pos2D.x - centerX,
    y: 0,  // furniture on floor
    z: pos2D.y - centerZ
  };
}

// 3D to 2D
function convert3Dto2D(pos3D, room) {
  const centerX = room.dimensions.width / 2;
  const centerZ = room.dimensions.length / 2;
  
  return {
    x: pos3D.x + centerX,
    y: pos3D.z + centerZ
  };
}
```

**Test File**: `coordinates.test.ts` (9 tests)
- Round-trip conversion tests
- Edge case tests (corners, center)

### 10.3 Error Messages (`errorMessages.test.ts`)

**Purpose**: Standardized error message generation.

**Functions**:
- `getValidationError(field, value)` - Returns validation error message
- `getNetworkError(operation)` - Returns network error message
- `getAuthError(code)` - Returns authentication error message

**Test File**: `errorMessages.test.ts` (6 tests)

### 10.4 Thumbnail Generator (`thumbnailGenerator.ts`)

**Purpose**: Generates design thumbnail images.

**Functions**:
- `generateThumbnail(design)` - Creates thumbnail from design
- `captureCanvas(canvas)` - Captures canvas as image
- `resizeThumbnail(image, size)` - Resizes to standard size

**Features**:
- Canvas-based rendering
- Standard size: 200x150px
- PNG format
- Base64 encoding

### 10.5 Index File (`index.ts`)

**Purpose**: Barrel export for all utilities.

```typescript
export * from './validation';
export * from './coordinates';
export * from './errorMessages';
export * from './thumbnailGenerator';
```

---

## 11. Testing Infrastructure

**Location**: `src/test/` and `tests/`

**Purpose**: Test setup, utilities, and end-to-end tests.


### 11.1 Test Setup (`src/test/setup.ts`)

**Purpose**: Global test configuration and utilities.

**Features**:
- jsdom environment setup
- React Testing Library configuration
- Global test utilities
- Mock implementations
- Cleanup after each test

**Imports**:
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

**Test File**: `setup.test.ts` (3 tests)

### 11.2 End-to-End Tests (`tests/e2e/`)

#### `critical-workflows.test.tsx`
**Purpose**: Tests complete user workflows.

**Test Scenarios** (54 tests):
1. **Authentication Flow**:
   - User registration
   - User login
   - Session persistence
   - Logout

2. **Design Lifecycle**:
   - Create new design
   - Configure room
   - Add furniture
   - Edit furniture properties
   - Save design
   - Load design
   - Edit existing design
   - Delete design

3. **2D Visualization**:
   - Drag-and-drop furniture
   - Boundary validation
   - Collision detection
   - Grid toggle

4. **3D Visualization**:
   - Camera controls
   - View synchronization
   - Color application

5. **Error Handling**:
   - Network failures
   - Validation errors
   - Recovery scenarios

### 11.3 Platform Tests (`tests/platform/`)

#### `windows.test.ts`
**Purpose**: Windows-specific functionality tests (6 tests).

**Tests**:
- File path handling
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- Window management
- Platform-specific APIs

#### `macos.test.ts`
**Purpose**: macOS-specific functionality tests (6 tests).

**Tests**:
- File path handling
- Keyboard shortcuts (Cmd+Z, Cmd+Y)
- Window management
- Platform-specific APIs

### 11.4 Test Coverage Summary

```
Category                Tests    Coverage
─────────────────────────────────────────
Models                    48       96%
Components                87       89%
Services                  42       94%
Store (Redux)             56       92%
Utils                     24       98%
Property-Based Tests      34       N/A
Integration Tests         32       N/A
E2E Tests                 66       N/A
─────────────────────────────────────────
TOTAL                    389       91%
```

### 11.5 Property-Based Testing

**Library**: fast-check

**Configuration**:
- 100 iterations per test
- Seed-based reproducibility
- Shrinking enabled
- 5-second timeout

**Test Categories**:
- Data model validation (5 properties)
- 2D visualization (5 properties)
- 3D visualization (4 properties)
- Furniture operations (2 properties)
- Design persistence (9 properties)
- Authentication (2 properties)
- User experience (2 properties)
- Data reliability (5 properties)

**Total**: 34 correctness properties

---

## 12. Configuration Files

### 12.1 TypeScript Configuration

#### `tsconfig.json` (Base Configuration)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```


#### `tsconfig.app.json` (Application Configuration)
```json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*"],
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx"]
}
```

#### `tsconfig.node.json` (Node Configuration)
```json
{
  "extends": "./tsconfig.json",
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

### 12.2 Vite Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'konva-vendor': ['konva', 'react-konva']
        }
      }
    }
  }
});
```

### 12.3 Vitest Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}'
      ]
    }
  }
});
```

### 12.4 ESLint Configuration (`eslint.config.js`)

```javascript
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
);
```

### 12.5 Electron Configuration

#### `electron/main.js`
**Purpose**: Electron main process entry point.

**Features**:
- Creates browser window
- Loads React app (dev or production)
- Handles window lifecycle
- IPC communication setup
- Menu configuration

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);
```

#### `electron/preload.js`
**Purpose**: Preload script for secure IPC.

**Features**:
- Exposes safe APIs to renderer
- Context bridge setup
- Security isolation

---

## 13. Data Flow Architecture

### 13.1 User Action Flow

```
User Interaction
      ↓
React Component
      ↓
Dispatch Redux Action
      ↓
Redux Middleware (if async)
      ↓
Redux Reducer
      ↓
Update State
      ↓
Selectors (memoized)
      ↓
Component Re-render
```


### 13.2 Design Save Flow

```
User clicks Save
      ↓
SaveDesignDialog opens
      ↓
User enters design name
      ↓
Dispatch saveDesignThunk
      ↓
Call storageService.saveDesign
      ↓
Retry logic (3 attempts)
      ↓
Firebase Firestore write
      ↓
Success: Update Redux state
      ↓
Clear isDirty flag
      ↓
Clear local cache
      ↓
Show success toast
```

### 13.3 Authentication Flow

```
User enters credentials
      ↓
Dispatch loginThunk
      ↓
Call authService.authenticateUser
      ↓
Firebase Authentication
      ↓
Success: Get user object
      ↓
Update Redux auth state
      ↓
onAuthStateChanged listener
      ↓
Persist session
      ↓
Redirect to /editor
```

### 13.4 2D-3D Synchronization Flow

```
User drags furniture in 2D
      ↓
FurnitureLayer onDragEnd
      ↓
Dispatch updateFurniturePosition
      ↓
Redux reducer updates state
      ↓
RenderingCoordinator detects change
      ↓
Triggers re-render
      ↓
Canvas2D re-renders (2D position)
      ↓
Scene3D re-renders (3D position via convert2Dto3D)
```

### 13.5 Crash Recovery Flow

```
App starts
      ↓
recoveryService.checkForRecovery
      ↓
Check localStorage for cached design
      ↓
Compare timestamps
      ↓
If unsaved changes detected:
      ↓
Show RecoveryDialog
      ↓
User chooses Restore or Discard
      ↓
If Restore:
  - Load cached design to Redux
  - Set isDirty flag
  - Clear cache
If Discard:
  - Clear cache
  - Continue normally
```

---

## 14. Deployment Structure

### 14.1 Development Mode

**Command**: `npm run dev`

**Process**:
1. Vite starts dev server on port 5173
2. Hot Module Replacement (HMR) enabled
3. Source maps enabled
4. React Fast Refresh active
5. Redux DevTools available

**URL**: `http://localhost:5173`

### 14.2 Electron Development Mode

**Command**: `npm run electron:dev`

**Process**:
1. Vite dev server starts
2. Wait for server ready
3. Electron launches
4. Loads `http://localhost:5173`
5. DevTools open by default

### 14.3 Production Build

**Command**: `npm run build`

**Process**:
1. TypeScript compilation (`tsc -b`)
2. Vite production build
3. Code minification
4. Tree shaking
5. Asset optimization
6. Source maps generation
7. Output to `dist/`

**Build Output**:
```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   ├── react-vendor-[hash].js
│   ├── redux-vendor-[hash].js
│   ├── three-vendor-[hash].js
│   └── konva-vendor-[hash].js
├── index.html
└── vite.svg
```

### 14.4 Electron Build

**Commands**:
- `npm run electron:build` - Build for current platform
- `npm run electron:build:win` - Build for Windows
- `npm run electron:build:mac` - Build for macOS

**Process**:
1. Run production build
2. electron-builder packages app
3. Creates installers

**Windows Output**:
```
release/
├── FurniVision Setup 1.0.0.exe  (NSIS installer)
└── FurniVision 1.0.0.exe        (Portable)
```

**macOS Output**:
```
release/
├── FurniVision-1.0.0.dmg        (DMG installer)
└── FurniVision-1.0.0-mac.zip    (ZIP archive)
```


---

## 15. Key Design Patterns

### 15.1 Factory Pattern
**Used in**: Models layer

**Example**:
```typescript
// Room.ts
export function createRoom(
  shape: RoomShape,
  dimensions: Dimensions,
  colorScheme: ColorScheme,
  unit: Unit = 'feet'
): Room {
  const validation = validateDimensions(dimensions);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  return {
    id: generateId(),
    shape,
    dimensions,
    colorScheme,
    unit
  };
}
```

### 15.2 Observer Pattern
**Used in**: Redux store subscriptions

**Example**:
```typescript
// RenderingCoordinator.tsx
useEffect(() => {
  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    // Trigger re-renders when design changes
    forceUpdate();
  });
  
  return unsubscribe;
}, []);
```

### 15.3 Strategy Pattern
**Used in**: Coordinate conversion

**Example**:
```typescript
// coordinates.ts
interface CoordinateConverter {
  to3D(pos2D: Position2D, room: Room): Position3D;
  to2D(pos3D: Position3D, room: Room): Position2D;
}

const rectangularConverter: CoordinateConverter = {
  to3D: (pos2D, room) => { /* ... */ },
  to2D: (pos3D, room) => { /* ... */ }
};

const circularConverter: CoordinateConverter = {
  to3D: (pos2D, room) => { /* ... */ },
  to2D: (pos3D, room) => { /* ... */ }
};
```

### 15.4 Middleware Pattern
**Used in**: Redux middleware

**Example**:
```typescript
// historyMiddleware.ts
export const historyMiddleware: Middleware = 
  (store) => (next) => (action) => {
    // Before action
    const prevState = store.getState();
    
    // Execute action
    const result = next(action);
    
    // After action
    const nextState = store.getState();
    if (isDesignAction(action)) {
      pushToHistory(prevState.design);
    }
    
    return result;
  };
```

### 15.5 Facade Pattern
**Used in**: Service wrappers

**Example**:
```typescript
// storageService.ts
export async function saveDesign(
  userId: string,
  design: Design
): Promise<void> {
  // Hides complex Firebase operations
  const docRef = doc(db, 'users', userId, 'designs', design.id);
  await setDoc(docRef, {
    ...design,
    updatedAt: serverTimestamp()
  });
}
```

### 15.6 Command Pattern
**Used in**: Redux actions for undo/redo

**Example**:
```typescript
// designSlice.ts
const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    addFurniture: (state, action) => {
      // Command: Add furniture
      state.current.furniture.push(action.payload);
      state.isDirty = true;
    },
    removeFurniture: (state, action) => {
      // Command: Remove furniture
      state.current.furniture = state.current.furniture
        .filter(f => f.id !== action.payload);
      state.isDirty = true;
    }
  }
});
```

---

## 16. Performance Optimizations

### 16.1 Code Splitting
**Implementation**: Vite manual chunks

```typescript
// vite.config.ts
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
  'three-vendor': ['three', '@react-three/fiber'],
  'konva-vendor': ['konva', 'react-konva']
}
```

**Benefit**: Reduces initial bundle size, faster load times

### 16.2 Memoization
**Implementation**: Redux selectors with `createSelector`

```typescript
// selectors.ts
export const getSelectedFurniture = createSelector(
  [(state) => state.design.current?.furniture,
   (state) => state.ui.selectedFurnitureId],
  (furniture, selectedId) => 
    furniture?.find(f => f.id === selectedId)
);
```

**Benefit**: Prevents unnecessary re-computations

### 16.3 React.memo
**Implementation**: Expensive components

```typescript
// FurnitureMesh.tsx
export const FurnitureMesh = React.memo(({ furniture }) => {
  // Expensive 3D rendering
  return <mesh>...</mesh>;
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.furniture.id === nextProps.furniture.id &&
         prevProps.furniture.color === nextProps.furniture.color;
});
```

**Benefit**: Prevents unnecessary re-renders


### 16.4 Debouncing
**Implementation**: Cache writes, drag events

```typescript
// cacheService.ts
import { debounce } from 'lodash';

const debouncedCache = debounce((design: Design) => {
  localStorage.setItem('cachedDesign', JSON.stringify({
    design,
    timestamp: new Date(),
  }));
}, 500);

export function cacheDesign(design: Design): void {
  debouncedCache(design);
}
```

**Benefit**: Reduces localStorage writes, improves performance

### 16.5 Canvas Layer Caching
**Implementation**: Konva layer caching

```typescript
// Canvas2D.tsx
<Layer listening={false} cache>
  <RoomLayer room={room} />
</Layer>
<Layer>
  <FurnitureLayer furniture={furniture} />
</Layer>
```

**Benefit**: Caches static room layer, improves 2D rendering

### 16.6 Instanced Meshes
**Implementation**: Three.js instanced rendering

```typescript
// Scene3D.tsx
const instancedMesh = useMemo(() => {
  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshStandardMaterial();
  return new InstancedMesh(geometry, material, furnitureCount);
}, [furnitureCount]);
```

**Benefit**: Reduces draw calls, improves 3D rendering

---

## 17. Security Considerations

### 17.1 Firebase Security Rules

**Firestore Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId;
      
      match /designs/{designId} {
        allow read, write: if request.auth != null 
                           && request.auth.uid == userId;
      }
    }
  }
}
```

**Features**:
- User-specific data isolation
- Authentication required
- No cross-user access

### 17.2 Environment Variables

**Security**:
- API keys in `.env` file
- `.env` in `.gitignore`
- Vite prefix: `VITE_`
- Never commit secrets

**Example**:
```bash
# .env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=app.firebaseapp.com
```

### 17.3 Input Validation

**Client-Side**:
- All user inputs validated
- TypeScript type checking
- Validation functions in utils

**Server-Side**:
- Firebase security rules
- Firestore validation
- Authentication checks

### 17.4 XSS Prevention

**React Protection**:
- Automatic escaping of user content
- No `dangerouslySetInnerHTML`
- Sanitized inputs

### 17.5 CSRF Protection

**Firebase Protection**:
- Token-based authentication
- Secure session management
- HTTPS only

---

## 18. Accessibility Features

### 18.1 Keyboard Navigation

**Supported Shortcuts**:
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Y` - Redo
- `Ctrl+S` / `Cmd+S` - Save design
- `Tab` - Navigate between controls
- `Enter` - Activate buttons
- `Escape` - Close dialogs

### 18.2 ARIA Labels

**Implementation**:
```tsx
<button
  aria-label="Add chair to design"
  onClick={handleAddChair}
>
  <ChairIcon />
</button>

<input
  type="number"
  aria-label="Room width in feet"
  aria-describedby="width-help"
  value={width}
  onChange={handleWidthChange}
/>
<span id="width-help">Enter width between 1 and 100 feet</span>
```

### 18.3 Focus Management

**Features**:
- Visible focus indicators
- Logical tab order
- Focus trap in dialogs
- Focus restoration after dialog close

### 18.4 Screen Reader Support

**Features**:
- Semantic HTML elements
- ARIA roles and labels
- Live regions for dynamic content
- Descriptive error messages

### 18.5 Color Contrast

**Standards**:
- WCAG AA compliance
- Minimum contrast ratio: 4.5:1
- Color not sole indicator
- High contrast mode support

---

## 19. Error Handling Strategy

### 19.1 Error Categories

1. **Validation Errors**: Invalid user input
2. **Authentication Errors**: Login/registration failures
3. **Network Errors**: Connection issues
4. **Storage Errors**: Save/load failures
5. **Rendering Errors**: Canvas/WebGL errors

### 19.2 Error Handling Layers

**Component Level**:
```tsx
try {
  await saveDesign(design);
  showToast('Design saved successfully', 'success');
} catch (error) {
  showToast(`Save failed: ${error.message}`, 'error');
}
```

**Redux Level**:
```typescript
extraReducers: (builder) => {
  builder
    .addCase(saveDesignThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(saveDesignThunk.fulfilled, (state) => {
      state.loading = false;
      state.isDirty = false;
    })
    .addCase(saveDesignThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
}
```

**Service Level**:
```typescript
export async function saveDesign(
  userId: string,
  design: Design
): Promise<void> {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      await setDoc(docRef, design);
      return;
    } catch (error) {
      attempts++;
      if (attempts === maxAttempts) throw error;
      await delay(Math.pow(2, attempts) * 1000);
    }
  }
}
```

**Application Level**:
```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```


---

## 20. Development Workflow

### 20.1 Getting Started

**Prerequisites**:
- Node.js 18+ and npm
- Git
- Firebase account
- Code editor (VS Code recommended)

**Setup Steps**:
```bash
# 1. Clone repository
git clone <repository-url>
cd furniture-design-visualizer

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with Firebase credentials

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:5173
```

### 20.2 Development Commands

```bash
# Development
npm run dev              # Start Vite dev server
npm run electron:dev     # Start Electron in dev mode

# Building
npm run build            # Production build
npm run preview          # Preview production build
npm run electron:build   # Build Electron app

# Testing
npm test                 # Run all tests once
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with UI

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler
```

### 20.3 Git Workflow

**Branch Strategy**:
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

**Commit Convention**:
```
type(scope): subject

feat(auth): add password reset functionality
fix(canvas): resolve drag-and-drop boundary issue
docs(readme): update installation instructions
test(models): add property tests for Room model
refactor(store): simplify selector logic
```

### 20.4 Code Review Checklist

- [ ] Code follows TypeScript strict mode
- [ ] All tests pass
- [ ] No ESLint errors
- [ ] Components have proper TypeScript types
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Accessibility considerations addressed
- [ ] Performance impact considered

---

## 21. Troubleshooting Guide

### 21.1 Common Issues

**Issue**: Vite dev server won't start
```bash
# Solution 1: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Solution 2: Check port 5173 availability
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows
```

**Issue**: Firebase authentication not working
```bash
# Check .env file
cat .env

# Verify Firebase configuration
# Ensure all VITE_FIREBASE_* variables are set
# Check Firebase console for enabled auth methods
```

**Issue**: Tests failing
```bash
# Clear test cache
npm run test -- --clearCache

# Run specific test file
npm run test -- Room.test.ts

# Run with verbose output
npm run test -- --reporter=verbose
```

**Issue**: 3D view not rendering
```
# Check browser WebGL support
# Visit: https://get.webgl.org/

# Check console for errors
# Open DevTools > Console

# Try different browser
# Chrome, Firefox, Edge recommended
```

**Issue**: Electron app won't build
```bash
# Clear dist folder
rm -rf dist

# Rebuild
npm run build
npm run electron:build

# Check electron-builder logs
# Look for missing dependencies or permissions
```

### 21.2 Performance Issues

**Slow 2D rendering**:
- Reduce furniture count
- Enable layer caching
- Disable grid overlay
- Check browser performance

**Slow 3D rendering**:
- Reduce furniture count
- Lower polygon count
- Disable shadows
- Check GPU acceleration

**Slow state updates**:
- Check Redux DevTools
- Look for unnecessary re-renders
- Verify memoization
- Profile with React DevTools

---

## 22. Future Enhancements

### 22.1 Planned Features

1. **Advanced 3D Models**
   - Import GLTF/GLB models
   - Detailed furniture textures
   - Custom furniture creation

2. **Export Functionality**
   - PDF reports
   - PNG/JPG screenshots
   - 3D model export (OBJ, FBX)

3. **Collaboration**
   - Real-time multi-user editing
   - Design sharing
   - Comments and annotations

4. **Mobile Support**
   - React Native app
   - Touch-optimized controls
   - Responsive design improvements

5. **AR Preview**
   - View designs in real space
   - ARKit/ARCore integration
   - QR code sharing

6. **Advanced Lighting**
   - Realistic shadows
   - Multiple light sources
   - Day/night simulation

7. **Material Library**
   - Wood textures
   - Fabric patterns
   - Metal finishes

8. **Measurement Tools**
   - Distance measurement
   - Area calculation
   - Dimension annotations

### 22.2 Technical Debt

1. **Testing**
   - Increase E2E test coverage
   - Add visual regression tests
   - Performance benchmarking

2. **Documentation**
   - API documentation
   - Component storybook
   - Video tutorials

3. **Accessibility**
   - WCAG AAA compliance
   - Screen reader testing
   - Keyboard navigation improvements

4. **Performance**
   - Web Workers for heavy computations
   - Service Worker for offline support
   - Progressive Web App (PWA)

---

## 23. Conclusion

This technical documentation provides a comprehensive overview of the FurniVision furniture design visualizer application. The application demonstrates modern web development practices with React, TypeScript, Redux, and advanced visualization technologies.

### Key Takeaways

1. **Layered Architecture**: Clear separation of concerns across models, services, store, components, and pages
2. **Type Safety**: TypeScript strict mode throughout the codebase
3. **State Management**: Redux Toolkit with custom middleware for undo/redo and caching
4. **Dual Visualization**: 2D canvas (react-konva) and 3D WebGL (react-three-fiber) with real-time synchronization
5. **Testing**: Comprehensive test coverage with unit, integration, property-based, and E2E tests
6. **Cross-Platform**: Electron packaging for Windows and macOS
7. **Cloud Integration**: Firebase for authentication and data persistence
8. **Performance**: Optimized rendering with memoization, code splitting, and caching
9. **Accessibility**: Keyboard navigation, ARIA labels, and screen reader support
10. **Error Handling**: Multi-layer error handling with retry logic and crash recovery

### Resources

- **GitHub Repository**: [Link to repository]
- **Live Demo**: [Link to demo]
- **Documentation**: [Link to docs]
- **Issue Tracker**: [Link to issues]

---

**Document Version**: 1.0  
**Last Updated**: February 15, 2026  
**Maintained By**: Development Team  
**Contact**: [Email Address]
