# Firebase Setup Instructions

This guide will help you set up Firebase for your website to enable cross-device data synchronization.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter a project name
   - (Optional) Enable Google Analytics
   - Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Click on the **Sign-in method** tab
4. Click on **Google** provider
5. Toggle **Enable** to ON
6. Set a **Project support email** (your email)
7. Click **Save**

## Step 3: Create Firestore Database

1. In your Firebase project, go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development)
   - **Important**: For production, you'll need to set up security rules
4. Choose a location for your database (select the closest to your users)
5. Click **Enable**

## Step 4: Get Your Firebase Configuration

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. Click the **</>** (web) icon to add a web app
5. Register your app:
   - Enter an app nickname (e.g., "Website")
   - (Optional) Check "Also set up Firebase Hosting"
   - Click **Register app**
6. Copy the `firebaseConfig` object that appears

## Step 5: Update firebase-config.js

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## Step 6: Set Up Firestore Security Rules (Important!)

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with these (for authenticated users only):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /properties/{propertyId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /data/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. Click **Publish**

## Step 7: Test Your Setup

1. Open your website in a browser
2. Click "Sign in with Google"
3. Complete the Google sign-in process
4. Your data should now sync to Firebase!

## Troubleshooting

### "Firebase not initialized" error
- Make sure you've updated `firebase-config.js` with your actual Firebase credentials
- Check that the Firebase SDK scripts are loading in the HTML

### "Permission denied" error
- Check your Firestore security rules
- Make sure you're signed in (check the user info in the top right)

### Data not syncing
- Open browser console (F12) and check for errors
- Verify that you're signed in
- Check that Firestore database is created and rules are published

## Security Notes

- The security rules above allow any authenticated user to access only their own data
- For production, consider adding additional validation
- Never commit your Firebase config with sensitive data if your repo is public
- Consider using environment variables for production deployments

## Next Steps

Once set up, your website will:
- ✅ Save data to Firebase when users are signed in
- ✅ Sync data across all devices automatically
- ✅ Keep localStorage as a backup
- ✅ Work offline and sync when connection is restored
