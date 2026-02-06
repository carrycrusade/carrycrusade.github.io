# Troubleshooting Firebase Sign-In Issues

If you're getting "Failed to sign in. Please try again." error, follow these steps:

## Step 1: Check Browser Console

1. Open your website
2. Press **F12** (or right-click → Inspect)
3. Go to the **Console** tab
4. Try to sign in again
5. Look for any error messages - they will now be more specific

## Step 2: Verify Firebase Setup

### Enable Google Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **calculator-website-df17c**
3. Click **Authentication** in the left sidebar
4. Click **Get started** (if you haven't already)
5. Go to the **Sign-in method** tab
6. Find **Google** in the list
7. Click on it
8. Toggle **Enable** to **ON**
9. Set a **Project support email** (your email address)
10. Click **Save**

### Add Authorized Domains

1. Still in **Authentication** → **Sign-in method**
2. Scroll down to **Authorized domains**
3. Make sure these domains are listed:
   - `localhost` (for local testing)
   - Your actual domain (if deployed)
   - `calculator-website-df17c.firebaseapp.com` (Firebase hosting)

If testing locally, `localhost` should already be there. If not, click **Add domain** and add it.

## Step 3: Check for Popup Blockers

1. Check if your browser is blocking popups
2. Look for a popup blocker icon in your browser's address bar
3. Allow popups for your site
4. Try signing in again

## Step 4: Verify Firebase SDK is Loading

1. Open browser console (F12)
2. Type: `typeof firebase`
3. It should return: `"object"`
4. If it returns `"undefined"`, the Firebase SDK isn't loading

**If Firebase SDK isn't loading:**
- Check your internet connection
- Verify the Firebase script tags are in your HTML
- Check browser console for script loading errors

## Step 5: Check Firestore Database

1. Go to Firebase Console
2. Click **Firestore Database**
3. If you see "Create database", click it and create the database
4. Choose **Start in test mode** for now

## Step 6: Common Error Codes

The improved error handling will now show specific messages:

- **`auth/popup-blocked`**: Browser is blocking the popup
  - Solution: Allow popups for your site

- **`auth/popup-closed-by-user`**: You closed the popup
  - Solution: Try again and complete the sign-in

- **`auth/unauthorized-domain`**: Domain not authorized
  - Solution: Add your domain in Firebase Console → Authentication → Settings → Authorized domains

- **`auth/operation-not-allowed`**: Google sign-in not enabled
  - Solution: Enable Google in Firebase Console → Authentication → Sign-in method

- **`auth/network-request-failed`**: Network issue
  - Solution: Check your internet connection

## Step 7: Test in Incognito/Private Mode

Sometimes browser extensions or cached data can cause issues:
1. Open your site in an incognito/private window
2. Try signing in again

## Step 8: Verify Firebase Config

Make sure `firebase-config.js` has your correct config values. It should look like:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyCytQbLoITdBU_aCREDVIr0FTiSxBcnP7Q",
    authDomain: "calculator-website-df17c.firebaseapp.com",
    projectId: "calculator-website-df17c",
    // ... etc
};
```

## Still Having Issues?

1. Check the browser console for the exact error message
2. The error message should now be more descriptive
3. Share the specific error code/message for further help

## Quick Checklist

- [ ] Google Authentication enabled in Firebase Console
- [ ] Authorized domains include `localhost` (or your domain)
- [ ] Firestore Database created
- [ ] No popup blockers active
- [ ] Firebase SDK loading (check console)
- [ ] Correct Firebase config in `firebase-config.js`
