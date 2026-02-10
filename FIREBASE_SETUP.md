# Firebase Setup Guide

This application uses Firebase for authentication and cloud storage. Follow these steps to set up Firebase for your project.

## Prerequisites

- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "Furniture Design Visualizer")
4. (Optional) Enable Google Analytics if you want usage tracking
5. Click **"Create project"** and wait for it to be ready

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **web icon** (`</>`) to add a web app
2. Enter an app nickname (e.g., "Furniture Design Visualizer Web")
3. **Do NOT** check "Set up Firebase Hosting" (unless you want to use it)
4. Click **"Register app"**
5. Firebase will display your app's configuration - **keep this page open**, you'll need these values

## Step 3: Enable Authentication

1. In the Firebase Console sidebar, click **"Authentication"**
2. Click **"Get started"** if this is your first time
3. Go to the **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Toggle **"Enable"** to ON
6. Click **"Save"**

## Step 4: Enable Firestore Database

1. In the Firebase Console sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   - Note: Test mode allows read/write access for 30 days. You'll need to update security rules for production.
4. Select a **Cloud Firestore location** (choose one closest to your users)
5. Click **"Enable"**

## Step 5: Configure Your Application

1. In your project root directory, copy the `.env.example` file to `.env`:
   ```bash
   copy .env.example .env
   ```
   (On Mac/Linux: `cp .env.example .env`)

2. Open the `.env` file in your text editor

3. Go back to your Firebase Console and copy the configuration values:
   - From the Firebase Console, go to **Project Settings** (gear icon) → **General** tab
   - Scroll down to **"Your apps"** section
   - Click on your web app
   - Copy the values from the `firebaseConfig` object

4. Replace the placeholder values in your `.env` file:
   ```
   VITE_FIREBASE_API_KEY=AIzaSyC...your-actual-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
   ```

5. **Save the `.env` file**

## Step 6: Test Your Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the application in your browser (usually `http://localhost:5173`)

3. Try to register a new account:
   - Go to the Register page
   - Enter an email and password
   - Click "Register"
   - If successful, you should be redirected to the editor

4. Check Firebase Console:
   - Go to **Authentication** → **Users** tab
   - You should see your newly registered user

## Security Notes

- **Never commit your `.env` file to version control** - it's already in `.gitignore`
- The `.env.example` file is safe to commit (it only contains placeholders)
- For production, update Firestore security rules to restrict access appropriately

## Firestore Security Rules (Production)

When you're ready for production, update your Firestore security rules:

1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own designs
    match /users/{userId}/designs/{designId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that your `VITE_FIREBASE_API_KEY` is correct
- Make sure there are no extra spaces or quotes

### "Firebase: Error (auth/project-not-found)"
- Check that your `VITE_FIREBASE_PROJECT_ID` matches your Firebase project

### Authentication not working
- Verify Email/Password is enabled in Firebase Console → Authentication → Sign-in method
- Check browser console for detailed error messages

### Designs not saving
- Verify Firestore Database is created and enabled
- Check that security rules allow writes (test mode for development)
- Check browser console for permission errors

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firestore Getting Started](https://firebase.google.com/docs/firestore)
