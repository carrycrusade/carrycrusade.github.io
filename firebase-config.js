// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCytQbLoITdBU_aCREDVIr0FTiSxBcnP7Q",
    authDomain: "calculator-website-df17c.firebaseapp.com",
    projectId: "calculator-website-df17c",
    storageBucket: "calculator-website-df17c.firebasestorage.app",
    messagingSenderId: "764596980386",
    appId: "1:764596980386:web:d6a6adfa6aff47b5a425fb",
    measurementId: "G-0QPZZY6QJM"
};

// Initialize Firebase (will be initialized after Firebase SDK loads)
let app, auth, db, googleProvider;

// Wait for Firebase to load, then initialize
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded. Make sure Firebase scripts are included in HTML.');
        return false;
    }
    
    try {
        // Only initialize if not already initialized
        if (!app) {
            app = firebase.initializeApp(firebaseConfig);
        }
        auth = firebase.auth();
        db = firebase.firestore();
        googleProvider = new firebase.auth.GoogleAuthProvider();
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}

// Authentication Functions
async function signInWithGoogle() {
    if (!auth) {
        if (!initializeFirebase()) {
            throw new Error('Firebase not initialized. Please check that Firebase SDK is loaded.');
        }
    }
    
    // Ensure Google provider is set up
    if (!googleProvider) {
        googleProvider = new firebase.auth.GoogleAuthProvider();
    }
    
    try {
        const result = await auth.signInWithPopup(googleProvider);
        return result.user;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        // Re-throw with more context
        if (error.code) {
            error.message = `Firebase Auth Error (${error.code}): ${error.message}`;
        }
        throw error;
    }
}

async function signOutUser() {
    if (!auth) return;
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

function getCurrentUser() {
    if (!auth) return null;
    return auth.currentUser;
}

function onAuthChange(callback) {
    if (!auth) {
        if (!initializeFirebase()) {
            return () => {};
        }
    }
    return auth.onAuthStateChanged(callback);
}

// Firestore Functions for Saved Properties
async function savePropertyToFirestore(userId, property) {
    if (!db) {
        if (!initializeFirebase()) {
            throw new Error('Firebase not initialized');
        }
    }
    try {
        const propertyRef = db.collection('users').doc(userId).collection('properties').doc(property.id);
        await propertyRef.set(property);
        return true;
    } catch (error) {
        console.error('Error saving property to Firestore:', error);
        throw error;
    }
}

async function getPropertiesFromFirestore(userId) {
    if (!db) {
        if (!initializeFirebase()) {
            throw new Error('Firebase not initialized');
        }
    }
    try {
        const propertiesRef = db.collection('users').doc(userId).collection('properties');
        const querySnapshot = await propertiesRef.get();
        const properties = [];
        querySnapshot.forEach((doc) => {
            properties.push(doc.data());
        });
        return properties;
    } catch (error) {
        console.error('Error getting properties from Firestore:', error);
        throw error;
    }
}

function subscribeToProperties(userId, callback) {
    if (!db) {
        if (!initializeFirebase()) {
            return () => {};
        }
    }
    const propertiesRef = db.collection('users').doc(userId).collection('properties');
    return propertiesRef.onSnapshot((snapshot) => {
        const properties = [];
        snapshot.forEach((doc) => {
            properties.push(doc.data());
        });
        callback(properties);
    });
}

async function deletePropertyFromFirestore(userId, propertyId) {
    if (!db) {
        if (!initializeFirebase()) {
            throw new Error('Firebase not initialized');
        }
    }
    try {
        const propertyRef = db.collection('users').doc(userId).collection('properties').doc(propertyId);
        await propertyRef.delete();
        return true;
    } catch (error) {
        console.error('Error deleting property from Firestore:', error);
        throw error;
    }
}

// Firestore Functions for Net Worth Data
async function saveNetWorthToFirestore(userId, netWorthData) {
    if (!db) {
        if (!initializeFirebase()) {
            throw new Error('Firebase not initialized');
        }
    }
    try {
        const netWorthRef = db.collection('users').doc(userId).collection('data').doc('netWorth');
        await netWorthRef.set({
            ...netWorthData,
            lastUpdated: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error saving net worth data to Firestore:', error);
        throw error;
    }
}

async function getNetWorthFromFirestore(userId) {
    if (!db) {
        if (!initializeFirebase()) {
            throw new Error('Firebase not initialized');
        }
    }
    try {
        const netWorthRef = db.collection('users').doc(userId).collection('data').doc('netWorth');
        const docSnap = await netWorthRef.get();
        if (docSnap.exists) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting net worth data from Firestore:', error);
        throw error;
    }
}

function subscribeToNetWorth(userId, callback) {
    if (!db) {
        if (!initializeFirebase()) {
            return () => {};
        }
    }
    const netWorthRef = db.collection('users').doc(userId).collection('data').doc('netWorth');
    return netWorthRef.onSnapshot((doc) => {
        if (doc.exists) {
            callback(doc.data());
        } else {
            callback(null);
        }
    });
}

// Make functions available globally
window.firebaseAuth = {
    signInWithGoogle,
    signOutUser,
    getCurrentUser,
    onAuthChange
};

window.firebaseFirestore = {
    savePropertyToFirestore,
    getPropertiesFromFirestore,
    subscribeToProperties,
    deletePropertyFromFirestore,
    saveNetWorthToFirestore,
    getNetWorthFromFirestore,
    subscribeToNetWorth
};
