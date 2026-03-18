# Design Document: Admin Panel

## Overview

The Admin Panel feature introduces role-based access control (RBAC) to FurniVision, enabling designated administrators to manage the furniture library through a dedicated management interface. The design extends the existing authentication system with role resolution via Firestore, modifies the login flow to support dual-purpose authentication buttons, and creates a new protected admin route with CRUD operations for furniture items.

The architecture maintains separation of concerns by:
- Extending the existing Redux auth state to include role information
- Creating a new role resolution service that integrates with Firebase Auth
- Implementing a reusable AdminRoute guard component parallel to the existing ProtectedRoute
- Building a standalone ManagePage component for furniture management
- Modifying the FurnitureLibraryPanel to fetch from Firestore instead of using only static data

This design preserves backward compatibility—all existing user features remain unchanged, and admin users retain full access to regular user functionality while gaining additional management capabilities.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
├─────────────────────────────────────────────────────────────┤
│  LoginPage (dual buttons)                                    │
│  ├─ User Login Button → /editor                             │
│  └─ Admin Login Button → /manage                            │
│                                                              │
│  Route Guards                                                │
│  ├─ PublicRoute (existing)                                  │
│  ├─ ProtectedRoute (existing)                               │
│  └─ AdminRoute (new) → checks role === "admin"              │
│                                                              │
│  Pages                                                       │
│  ├─ ManagePage (new) → CRUD for furniture                   │
│  └─ EditorPage (modified) → uses Firestore furniture        │
│                                                              │
│  Components                                                  │
│  ├─ AppNavBar (modified) → conditional "Manage" link        │
│  └─ FurnitureLibraryPanel (modified) → Firestore fetch      │
├─────────────────────────────────────────────────────────────┤
│                      State Management                        │
├─────────────────────────────────────────────────────────────┤
│  Redux Store                                                 │
│  ├─ authSlice (extended)                                    │
│  │   └─ user: { uid, email, displayName, role }            │
│  └─ furnitureSlice (new)                                    │
│      └─ { items: [], loading, error }                       │
├─────────────────────────────────────────────────────────────┤
│                       Service Layer                          │
├─────────────────────────────────────────────────────────────┤
│  authService (extended)                                      │
│  ├─ authenticateUser()                                      │
│  ├─ resolveUserRole() → reads Firestore users/{uid}        │
│  └─ setupAuthStateListener() → includes role resolution     │
│                                                              │
│  furnitureService (new)                                      │
│  ├─ fetchFurnitureItems()                                   │
│  ├─ addFurnitureItem()                                      │
│  ├─ updateFurnitureItem()                                   │
│  └─ deleteFurnitureItem()                                   │
├─────────────────────────────────────────────────────────────┤
│                      Firebase Backend                        │
├─────────────────────────────────────────────────────────────┤
│  Firebase Auth → user authentication                         │
│                                                              │
│  Firestore Collections                                       │
│  ├─ users/{uid}                                             │
│  │   └─ { email, role: "user" | "admin" }                  │
│  └─ furniture/{itemId}                                      │
│      └─ { name, type, color, price, imageUrl }             │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
User enters credentials → LoginPage
                           │
                           ├─ Clicks "User Login"
                           │   └─> authenticateUser()
                           │       └─> resolveUserRole()
                           │           └─> navigate("/editor")
                           │
                           └─ Clicks "Admin Login"
                               └─> authenticateUser()
                                   └─> resolveUserRole()
                                       └─> navigate("/manage")
```

### Role Resolution Flow

```
Firebase Auth Success
    │
    └─> Read Firestore: users/{uid}
        │
        ├─> Document exists with role field
        │   └─> Return role value ("user" | "admin")
        │
        └─> Document missing or no role field
            └─> Return default "user"
```

### Route Protection Flow

```
User navigates to /manage
    │
    └─> AdminRoute guard checks:
        │
        ├─> Not authenticated?
        │   └─> Redirect to /login
        │
        ├─> Authenticated but role !== "admin"?
        │   └─> Redirect to /editor
        │
        └─> Authenticated and role === "admin"
            └─> Render ManagePage
```

## Components and Interfaces

### 1. Extended User Type

```typescript
// src/store/types.ts
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'user' | 'admin'; // NEW FIELD
}
```

### 2. Furniture Item Type

```typescript
// src/models/FurnitureItem.ts
export interface FurnitureItem {
  id: string;
  name: string;
  type: FurnitureType; // 'chair' | 'table' | 'couch' | 'bed' | 'desk' | 'shelf' | 'cabinet' | 'lamp'
  color: string; // hex color code
  price: number; // in smallest currency unit (cents)
  imageUrl: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export type FurnitureType = 
  | 'chair' 
  | 'table' 
  | 'couch' 
  | 'bed' 
  | 'desk' 
  | 'shelf' 
  | 'cabinet' 
  | 'lamp';
```

### 3. Furniture State

```typescript
// src/store/slices/furnitureSlice.ts
export interface FurnitureState {
  items: FurnitureItem[];
  loading: boolean;
  error: string | null;
}
```

### 4. Auth Service Extensions

```typescript
// src/services/authService.ts

/**
 * Resolve user role from Firestore
 * @param uid User ID
 * @returns Promise resolving to user role
 */
export const resolveUserRole = async (uid: string): Promise<'user' | 'admin'> => {
  // Read from Firestore users/{uid}
  // Return role field or default to "user"
};

/**
 * Authenticate user and resolve role
 * @param email User email
 * @param password User password
 * @returns Promise resolving to User with role
 */
export const authenticateUserWithRole = async (
  email: string, 
  password: string
): Promise<User> => {
  // Call Firebase Auth
  // Resolve role from Firestore
  // Return complete User object
};
```

### 5. Furniture Service

```typescript
// src/services/furnitureService.ts

/**
 * Fetch all furniture items from Firestore
 * @returns Promise resolving to array of FurnitureItem
 */
export const fetchFurnitureItems = async (): Promise<FurnitureItem[]> => {
  // Query furniture collection
  // Map documents to FurnitureItem[]
};

/**
 * Add new furniture item to Firestore
 * @param item Furniture item data (without id)
 * @returns Promise resolving to created FurnitureItem
 */
export const addFurnitureItem = async (
  item: Omit<FurnitureItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FurnitureItem> => {
  // Validate item
  // Add to Firestore with auto-generated ID
  // Return created item with ID
};

/**
 * Update existing furniture item
 * @param id Item ID
 * @param updates Partial item data
 * @returns Promise resolving when update completes
 */
export const updateFurnitureItem = async (
  id: string,
  updates: Partial<Omit<FurnitureItem, 'id' | 'createdAt'>>
): Promise<void> => {
  // Validate updates
  // Update Firestore document
  // Set updatedAt timestamp
};

/**
 * Delete furniture item from Firestore
 * @param id Item ID
 * @returns Promise resolving when deletion completes
 */
export const deleteFurnitureItem = async (id: string): Promise<void> => {
  // Delete Firestore document
};
```

### 6. AdminRoute Component

```typescript
// src/components/AdminRoute.tsx

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Route guard that restricts access to admin users only
 * - Redirects unauthenticated users to /login
 * - Redirects non-admin users to /editor
 * - Renders children for admin users
 */
export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/editor" replace />;
  }
  
  return <>{children}</>;
};
```

### 7. ManagePage Component

```typescript
// src/pages/ManagePage.tsx

/**
 * Admin-only page for managing furniture library
 * Features:
 * - Table view of all furniture items
 * - Add new item form
 * - Edit existing item (inline or modal)
 * - Delete item with confirmation
 * - Real-time sync with Firestore
 */
export const ManagePage = () => {
  // State for furniture items, loading, error
  // State for add/edit forms
  // Handlers for CRUD operations
  // Render table with action buttons
};
```

### 8. Modified LoginPage

```typescript
// src/pages/LoginPage.tsx (modified)

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState<'user' | 'admin' | null>(null);
  
  const handleUserLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginType('user');
    // Authenticate and navigate to /editor
  };
  
  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginType('admin');
    // Authenticate and navigate to /manage
  };
  
  // Render form with two submit buttons
};
```

### 9. Modified AppNavBar

The AppNavBar component (or AppHeader) will be extended to conditionally render a "Manage" link:

```typescript
// Conditional rendering logic
{user?.role === 'admin' && (
  <Link to="/manage" className="nav-link">
    Manage
  </Link>
)}
```

### 10. Modified FurnitureLibraryPanel

```typescript
// src/components/FurnitureLibraryPanel.tsx (modified)

export const FurnitureLibraryPanel = () => {
  const [firestoreFurniture, setFirestoreFurniture] = useState<FurnitureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch furniture from Firestore
    fetchFurnitureItems()
      .then(items => {
        setFirestoreFurniture(items);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        // Fall back to static FURNITURE_CATEGORIES
      });
  }, []);
  
  // Merge Firestore items with static categories
  // Display with fallback to static data on error
};
```

## Data Models

### Firestore Schema

#### users Collection

```
users/{uid}
  ├─ email: string
  ├─ displayName: string | null
  ├─ role: "user" | "admin"
  ├─ createdAt: timestamp
  └─ updatedAt: timestamp
```

#### furniture Collection

```
furniture/{itemId}
  ├─ name: string
  ├─ type: string (FurnitureType enum)
  ├─ color: string (hex code)
  ├─ price: number (cents)
  ├─ imageUrl: string
  ├─ createdAt: timestamp
  └─ updatedAt: timestamp
```

### Redux State Shape

```typescript
{
  auth: {
    user: {
      uid: string;
      email: string;
      displayName: string | null;
      role: 'user' | 'admin';
    } | null;
    loading: boolean;
    error: string | null;
  },
  furniture: {
    items: FurnitureItem[];
    loading: boolean;
    error: string | null;
  },
  // ... existing design and ui slices
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Authentication Error Display

*For any* authentication attempt (user or admin login) that fails, the error message returned by the auth service should be displayed on the login page without navigation occurring.

**Validates: Requirements 1.4**

### Property 2: Role Resolution from Firestore

*For any* authenticated user with a Firestore document containing a role field, the role resolver should return the exact value of that role field.

**Validates: Requirements 2.1**

### Property 3: Role Persistence in Redux

*For any* successfully authenticated user, the Redux auth state should contain the user object with the resolved role field populated.

**Validates: Requirements 2.3**

### Property 4: Conditional Admin Navigation

*For any* authenticated user, the "Manage" navigation link should be visible if and only if the user's role is "admin".

**Validates: Requirements 3.1, 3.2**

### Property 5: Admin Route Protection

*For any* navigation attempt to `/manage`, the AdminRoute guard should:
- Redirect to `/login` if the user is not authenticated
- Redirect to `/editor` if the user is authenticated but role is not "admin"
- Render the ManagePage if the user is authenticated and role is "admin"

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 6: Furniture Display Completeness

*For any* furniture item in the Firestore collection, when displayed in the ManagePage table, all required fields (name, type, color, price, imageUrl) should be visible.

**Validates: Requirements 5.1, 5.2**

### Property 7: Add Furniture Validation

*For any* furniture item data submitted via the add form:
- If all required fields are valid, the item should be written to Firestore and appear in the table
- If any required field is invalid or empty, a validation error should be displayed and no Firestore write should occur

**Validates: Requirements 6.2, 6.3**

### Property 8: Edit Furniture Round-Trip

*For any* furniture item, clicking the edit action should populate the edit form with the item's current values, and submitting valid changes should update the Firestore document and refresh the table display.

**Validates: Requirements 7.1, 7.2**

### Property 9: Edit Validation

*For any* furniture item update submitted via the edit form with invalid or empty required fields, a validation error should be displayed and no Firestore write should occur.

**Validates: Requirements 7.3**

### Property 10: Delete Confirmation Flow

*For any* furniture item, activating the delete action should display a confirmation prompt, and confirming should delete the Firestore document and remove the item from the table.

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 11: Furniture Library Synchronization

*For any* CRUD operation (add, edit, delete) performed on the furniture collection via ManagePage, the changes should be reflected in the FurnitureLibraryPanel the next time it fetches data.

**Validates: Requirements 9.2**

### Property 12: Admin Access to Regular Features

*For any* authenticated admin user, all routes and navigation links available to regular users should also be accessible and visible.

**Validates: Requirements 10.1, 10.2**

## Error Handling

### Authentication Errors

- **Invalid Credentials**: Display Firebase Auth error messages (e.g., "Invalid email or password")
- **Network Errors**: Display "Unable to connect. Please check your internet connection."
- **Rate Limiting**: Display "Too many login attempts. Please try again later."
- **Form Validation**: Display field-level errors for empty email/password before submission

### Role Resolution Errors

- **Firestore Read Failure**: Log error and default to "user" role, display warning toast
- **Missing User Document**: Silently default to "user" role (expected for new users)
- **Permission Denied**: Display "Unable to verify account permissions" and log out user

### Furniture Service Errors

- **Fetch Failure**: Display error message in ManagePage, fall back to empty state with retry button
- **Add/Update Failure**: Display error toast with Firebase error message, retain form values
- **Delete Failure**: Display error toast, do not remove item from table
- **Validation Errors**: Display field-level errors inline with form fields

### Route Protection Errors

- **Auth State Loading**: Display loading spinner while auth state initializes
- **Unauthorized Access**: Silently redirect to appropriate page (login or editor)
- **Network Interruption**: Maintain last known auth state, show reconnection toast

### FurnitureLibraryPanel Errors

- **Firestore Fetch Failure**: Fall back to static hardcoded furniture list, display non-blocking warning banner
- **Partial Data**: Display available items, log warning for items with missing fields
- **Empty Collection**: Display "No furniture available" message with admin contact info

## Testing Strategy

### Unit Testing Approach

Unit tests will focus on specific examples, edge cases, and integration points:

- **LoginPage**: Test dual button rendering, form submission with each button, error display, loading states
- **AdminRoute**: Test redirect behavior for unauthenticated, regular user, and admin user scenarios
- **ManagePage**: Test form rendering, CRUD operation handlers, error states, empty states
- **Role Resolution**: Test default role for missing documents, role extraction from valid documents
- **Furniture Service**: Test Firestore CRUD operations with mocked Firestore, error handling
- **FurnitureLibraryPanel**: Test Firestore fetch, fallback to static data, item display

### Property-Based Testing Approach

Property tests will verify universal properties across randomized inputs using a property-based testing library (e.g., fast-check for TypeScript):

**Configuration**: Each property test will run a minimum of 100 iterations with randomized inputs.

**Test Tagging**: Each property test will include a comment tag referencing the design document property:
```typescript
// Feature: admin-panel, Property 1: Authentication Error Display
```

**Property Test Coverage**:

1. **Property 1 (Authentication Error Display)**: Generate random error messages, verify display without navigation
2. **Property 2 (Role Resolution)**: Generate random user documents with various role values, verify correct resolution
3. **Property 3 (Role Persistence)**: Generate random authenticated users, verify Redux state contains role
4. **Property 4 (Conditional Admin Navigation)**: Generate random users with different roles, verify link visibility
5. **Property 5 (Admin Route Protection)**: Generate random auth states, verify correct redirect/render behavior
6. **Property 6 (Furniture Display)**: Generate random furniture items, verify all fields displayed
7. **Property 7 (Add Validation)**: Generate random valid/invalid furniture data, verify add behavior
8. **Property 8 (Edit Round-Trip)**: Generate random furniture items and edits, verify form population and updates
9. **Property 9 (Edit Validation)**: Generate random invalid edit data, verify validation errors
10. **Property 10 (Delete Confirmation)**: Generate random furniture items, verify delete flow
11. **Property 11 (Furniture Sync)**: Generate random CRUD operations, verify panel reflects changes
12. **Property 12 (Admin Access)**: Generate random admin users and regular routes, verify access

**Generators for Property Tests**:

- **User Generator**: Random uid, email, displayName, role ("user" | "admin")
- **Furniture Item Generator**: Random name, type (from FurnitureType enum), color (hex), price (positive integer), imageUrl (valid URL)
- **Invalid Data Generator**: Empty strings, null values, invalid types, out-of-range numbers
- **Auth State Generator**: null (unauthenticated), user with role "user", user with role "admin"

### Integration Testing

- **End-to-End Login Flow**: Test complete flow from login page through role resolution to correct dashboard
- **Admin CRUD Workflow**: Test adding, editing, and deleting furniture items with Firestore emulator
- **Role-Based Access**: Test navigation between pages as different user types
- **Furniture Library Sync**: Test that ManagePage changes appear in FurnitureLibraryPanel

### Edge Cases to Test

- Empty furniture collection (Requirement 5.3)
- Missing or absent role field in Firestore (Requirement 2.2)
- Firestore fetch failure with fallback (Requirement 9.3)
- Concurrent edits to same furniture item
- Very long furniture names or URLs
- Special characters in furniture names
- Zero or negative prices
- Invalid color hex codes

### Testing Tools

- **Unit Tests**: Jest + React Testing Library
- **Property Tests**: fast-check (TypeScript property-based testing library)
- **Integration Tests**: Jest + Firestore Emulator
- **E2E Tests**: Playwright or Cypress for critical user flows
- **Mocking**: Mock Service Worker (MSW) for Firebase API mocking

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% line coverage for new components and services
- **Property Test Coverage**: All 12 correctness properties implemented as property tests
- **Integration Test Coverage**: All critical user flows (login, CRUD operations, role-based access)
- **Edge Case Coverage**: All edge cases identified in requirements tested explicitly

