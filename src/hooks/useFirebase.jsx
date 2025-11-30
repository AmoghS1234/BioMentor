import { useState, useEffect, useContext, createContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

const FirebaseContext = createContext();

// ⚠️ REPLACE THIS WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123..."
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper: Update a user's profile data
const updateProfileSetting = async (uid, data) => {
    if (!uid) return;
    const profileRef = doc(db, 'users', uid);
    try {
        await updateDoc(profileRef, data);
    } catch (error) {
        console.error("Error updating profile:", error);
    }
};

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // 1. Auto-Sign In (Anonymous)
    signInAnonymously(auth).catch((err) => {
        console.error("Auth Error:", err);
    });

    // 2. Listen for Auth Changes
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        // 3. If logged in, sync User Profile (XP, Settings)
        const profileRef = doc(db, 'users', currentUser.uid);
        
        // Create profile if it doesn't exist
        setDoc(profileRef, {
          uid: currentUser.uid,
          lastLogin: Date.now()
        }, { merge: true });

        // Listen for real-time profile updates
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          }
        });

        return () => unsubscribeProfile();
      }
      setProfile(null);
    });

    return () => unsubscribeAuth();
  }, []);

  const value = {
    user,
    profile,
    isAuthReady,
    db,
    auth,
    updateProfileSetting: (data) => user && updateProfileSetting(user.uid, data),
  };

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};

export const useFirebase = () => {
    return useContext(FirebaseContext);
};