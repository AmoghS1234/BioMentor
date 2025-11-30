import { useState, useEffect, useContext, createContext } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';

const FirebaseContext = createContext();

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
// We add a check to ensure config exists to prevent white-screen crashes if .env is missing
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Helper: Ensure the user document exists in Firestore
  const ensureUserProfile = async (uid, email, name) => {
    if (!db) return;
    const userRef = doc(db, 'users', uid);
    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
          await setDoc(userRef, {
              uid,
              email: email || 'Anonymous',
              displayName: name || 'Guest',
              createdAt: Date.now(),
              lastLogin: Date.now(),
              xp: 0,
              aiModel: 'gemini-2.5-flash', 
              aiEndpoint: '/api/gemini'
          });
      } else {
          await updateDoc(userRef, { lastLogin: Date.now() });
      }
    } catch (e) {
      console.error("Profile creation error:", e);
    }
  };

  // --- AUTH ACTIONS ---
  const loginAsGuest = async () => {
    try { 
        await setPersistence(auth, browserLocalPersistence);
        await signInAnonymously(auth); 
    } catch (error) { throw error; }
  };

  const loginWithEmail = async (email, password, rememberMe = true) => {
    try { 
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      await signInWithEmailAndPassword(auth, email, password); 
    } catch (error) { throw error; }
  };

  const registerWithEmail = async (email, password, name) => {
    try { 
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: name });
      await ensureUserProfile(res.user.uid, email, name);
    } catch (error) { throw error; }
  };

  const logout = async () => {
    try { 
      await firebaseSignOut(auth); 
      setProfile(null);
      setUser(null);
    } catch (error) { console.error("Logout Error:", error); }
  };

  const updateProfileSetting = async (data) => {
    if (user && db) {
      try {
        const profileRef = doc(db, 'users', user.uid);
        await updateDoc(profileRef, data);
      } catch (e) { console.error("Profile Update Error:", e); }
    }
  };

  // --- AUTH OBSERVER ---
  useEffect(() => {
    if (!auth) return;

    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // 1. Ensure DB Profile Exists
        await ensureUserProfile(currentUser.uid, currentUser.email, currentUser.displayName);

        // 2. Subscribe to Profile Updates
        const profileRef = doc(db, 'users', currentUser.uid);
        unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
            if (docSnap.exists()) setProfile(docSnap.data());
        });
      } else {
        setProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
      }
      
      // 3. Mark app as ready
      setIsAuthReady(true);
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const value = {
    user, profile, isAuthReady, db, auth,
    loginWithEmail, registerWithEmail, loginAsGuest, logout, updateProfileSetting
  };

  if (!app) return <div className="p-10 text-center text-red-500">Error: Firebase config missing in .env file.</div>;

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};

export const useFirebase = () => useContext(FirebaseContext);