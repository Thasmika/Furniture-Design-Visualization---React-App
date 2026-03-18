# Requirements Document

## Introduction

The Admin Panel feature extends FurniVision with a role-based access control system. It introduces an admin role that can manage the furniture library (add, edit, delete items) through an exclusive "Manage" page. The login page gains two distinct login buttons routing users to their respective dashboards. Admin users retain full access to all regular user features plus the new admin-only management interface. Role detection uses Firestore user documents with a `role` field. The furniture library managed by admins is the same library surfaced in the editor's FurnitureLibraryPanel for all users.

## Glossary

- **Admin_User**: An authenticated user whose Firestore user document contains `role: "admin"`.
- **Regular_User**: An authenticated user whose Firestore user document contains `role: "user"` or has no role field.
- **Auth_Service**: The Firebase Authentication and Firestore service layer responsible for sign-in and role resolution.
- **Login_Page**: The `/login` route presenting the shared email/password form with two login buttons.
- **Admin_Route_Guard**: The route protection component that restricts `/manage` to Admin_Users only.
- **Manage_Page**: The admin-exclusive page at `/manage` for CRUD operations on the furniture library.
- **Furniture_Library**: The Firestore collection storing furniture items displayed in the FurnitureLibraryPanel.
- **AppNavBar**: The application navigation bar rendered for authenticated users across all protected pages.
- **FurnitureLibraryPanel**: The sidebar panel in the editor that displays furniture items from the Furniture_Library.
- **Role_Resolver**: The service function that reads the Firestore user document and returns the user's role after sign-in.

## Requirements

### Requirement 1: Dual Login Buttons on Login Page

**User Story:** As a visitor, I want separate "User Login" and "Admin Login" buttons on the login form, so that I am routed to the correct dashboard after authenticating.

#### Acceptance Criteria

1. THE Login_Page SHALL display two submit buttons: one labelled "User Login" and one labelled "Admin Login", both using the same email and password fields.
2. WHEN a visitor submits the form via the "User Login" button, THE Auth_Service SHALL authenticate the user and THE Login_Page SHALL navigate to `/editor` upon success.
3. WHEN a visitor submits the form via the "Admin Login" button, THE Auth_Service SHALL authenticate the user and THE Login_Page SHALL navigate to `/manage` upon success.
4. IF authentication fails for either button, THEN THE Login_Page SHALL display the error message returned by Auth_Service without navigating away.
5. WHILE authentication is in progress, THE Login_Page SHALL disable both login buttons and all form fields to prevent duplicate submissions.

---

### Requirement 2: Role Resolution After Sign-In

**User Story:** As the system, I want to resolve a user's role from Firestore immediately after sign-in, so that the correct permissions and navigation are applied throughout the session.

#### Acceptance Criteria

1. WHEN a user successfully authenticates, THE Role_Resolver SHALL read the Firestore document at `users/{uid}` and return the value of the `role` field.
2. IF the Firestore document does not exist or the `role` field is absent, THEN THE Role_Resolver SHALL return `"user"` as the default role.
3. THE Auth_Service SHALL store the resolved role alongside the user object in the Redux auth state.
4. WHEN the Firebase Auth state listener detects a returning authenticated session, THE Role_Resolver SHALL re-resolve the role and update the Redux auth state.
5. WHEN a user logs out, THE Auth_Service SHALL clear the role from the Redux auth state.

---

### Requirement 3: Admin Navigation Link

**User Story:** As an Admin_User, I want a "Manage" link in the navigation bar, so that I can access the furniture management page from anywhere in the app.

#### Acceptance Criteria

1. WHILE a user is authenticated as an Admin_User, THE AppNavBar SHALL display a "Manage" navigation link pointing to `/manage`.
2. WHILE a user is authenticated as a Regular_User, THE AppNavBar SHALL NOT display the "Manage" navigation link.
3. WHEN an Admin_User clicks the "Manage" link, THE AppNavBar SHALL navigate to `/manage`.

---

### Requirement 4: Admin Route Protection

**User Story:** As a system administrator, I want the `/manage` route to be accessible only to Admin_Users, so that Regular_Users cannot access furniture management.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to `/manage`, THE Admin_Route_Guard SHALL redirect the user to `/login`.
2. WHEN a Regular_User navigates to `/manage`, THE Admin_Route_Guard SHALL redirect the user to `/editor`.
3. WHEN an Admin_User navigates to `/manage`, THE Admin_Route_Guard SHALL render the Manage_Page.
4. THE Admin_Route_Guard SHALL evaluate the role from the Redux auth state without making additional Firestore reads.

---

### Requirement 5: View Furniture Library

**User Story:** As an Admin_User, I want to view all furniture items in a table on the Manage page, so that I can see the current library contents at a glance.

#### Acceptance Criteria

1. WHEN an Admin_User loads the Manage_Page, THE Manage_Page SHALL fetch all documents from the Furniture_Library Firestore collection and display them in a table.
2. THE Manage_Page SHALL display the following columns for each furniture item: name, type/category, color, price, and image URL.
3. WHEN the Furniture_Library collection is empty, THE Manage_Page SHALL display a message indicating no furniture items exist.
4. IF the Firestore fetch fails, THEN THE Manage_Page SHALL display a descriptive error message.

---

### Requirement 6: Add Furniture Item

**User Story:** As an Admin_User, I want to add new furniture items to the library, so that users can access new furniture in the editor.

#### Acceptance Criteria

1. THE Manage_Page SHALL provide a form to add a new furniture item with fields: name (text), type/category (select from valid FurnitureType values), color (color picker or hex text input), price (numeric, in smallest currency unit), and image URL (text).
2. WHEN an Admin_User submits the add form with all required fields valid, THE Manage_Page SHALL write a new document to the Furniture_Library Firestore collection and refresh the displayed table.
3. IF any required field is empty or invalid when the add form is submitted, THEN THE Manage_Page SHALL display a field-level validation error and SHALL NOT write to Firestore.
4. WHEN the Firestore write succeeds, THE Manage_Page SHALL clear the add form and display a success confirmation.
5. IF the Firestore write fails, THEN THE Manage_Page SHALL display a descriptive error message and retain the form values.

---

### Requirement 7: Edit Furniture Item

**User Story:** As an Admin_User, I want to edit existing furniture items, so that I can correct or update library entries.

#### Acceptance Criteria

1. THE Manage_Page SHALL provide an edit action for each furniture item row that populates an edit form with the item's current values.
2. WHEN an Admin_User submits the edit form with all required fields valid, THE Manage_Page SHALL update the corresponding Firestore document in the Furniture_Library collection and refresh the displayed table.
3. IF any required field is empty or invalid when the edit form is submitted, THEN THE Manage_Page SHALL display a field-level validation error and SHALL NOT write to Firestore.
4. WHEN the Firestore update succeeds, THE Manage_Page SHALL close the edit form and display a success confirmation.
5. IF the Firestore update fails, THEN THE Manage_Page SHALL display a descriptive error message and retain the edit form values.

---

### Requirement 8: Delete Furniture Item

**User Story:** As an Admin_User, I want to delete furniture items from the library, so that outdated or incorrect entries are removed.

#### Acceptance Criteria

1. THE Manage_Page SHALL provide a delete action for each furniture item row.
2. WHEN an Admin_User activates the delete action, THE Manage_Page SHALL display a confirmation prompt before deleting.
3. WHEN an Admin_User confirms deletion, THE Manage_Page SHALL delete the corresponding Firestore document from the Furniture_Library collection and remove the item from the displayed table.
4. WHEN an Admin_User cancels the confirmation prompt, THE Manage_Page SHALL take no action and dismiss the prompt.
5. IF the Firestore delete fails, THEN THE Manage_Page SHALL display a descriptive error message.

---

### Requirement 9: Furniture Library Reflects Admin Changes in Editor

**User Story:** As a Regular_User, I want the furniture library in the editor to show the latest items managed by the admin, so that I always have access to the current catalogue.

#### Acceptance Criteria

1. WHEN the FurnitureLibraryPanel is mounted, THE FurnitureLibraryPanel SHALL fetch furniture items from the Furniture_Library Firestore collection instead of using only the static hardcoded list.
2. WHEN an Admin_User adds, edits, or deletes a furniture item via the Manage_Page, THE FurnitureLibraryPanel SHALL reflect those changes the next time it fetches data.
3. IF the Firestore fetch in FurnitureLibraryPanel fails, THEN THE FurnitureLibraryPanel SHALL fall back to the static hardcoded furniture list and display a non-blocking warning.

---

### Requirement 10: Admin Access to All Regular User Pages

**User Story:** As an Admin_User, I want access to all pages available to Regular_Users, so that I can use the full application while also performing admin tasks.

#### Acceptance Criteria

1. WHILE a user is authenticated as an Admin_User, THE Admin_Route_Guard SHALL permit access to all routes that ProtectedRoute permits for Regular_Users (including `/editor`, `/my-designs`, `/reviews`, `/contact`, `/profile`).
2. THE AppNavBar SHALL display all navigation links available to Regular_Users when the authenticated user is an Admin_User.
