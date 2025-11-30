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
  browserLocalPersistence // Use LOCAL persistence for everyone so reloads work
} from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';

const FirebaseContext = createContext();

// ⚠️ REPLACE THIS WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyDXZJsf2qDRFtsbkYPesQOqtKulsqvQ5w8",
  authDomain: "biomentor-8fda7.firebaseapp.com",
  projectId: "biomentor-8fda7",
  storageBucket: "biomentor-8fda7.firebasestorage.app",
  messagingSenderId: "674891766546",
  appId: "1:674891766546:web:fb992aa3f5222ef6bbf1cb",
  measurementId: "G-V4CDZVEZ25"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Helper: Ensure the user document exists
  const ensureUserProfile = async (uid, email) => {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) {
        await setDoc(userRef, {
            uid,
            email: email || 'Anonymous',
            createdAt: Date.now(),
            lastLogin: Date.now(),
            xp: 0,
            aiModel: 'gemini-2.5-flash',
            aiEndpoint: '/api/gemini'
        });
    } else {
        await updateDoc(userRef, { lastLogin: Date.now() });
    }
  };

  // --- AUTH ACTIONS ---
  const loginAsGuest = async () => {
    try { 
        await setPersistence(auth, browserLocalPersistence);
        await signInAnonymously(auth); 
    } 
    catch (error) { console.error("Guest Login Failed:", error); throw error; }
  };

  const loginWithEmail = async (email, password, rememberMe = true) => {
    try { 
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password); 
    } catch (error) { throw error; }
  };

  const registerWithEmail = async (email, password, name) => {
    try { 
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: name });
      await ensureUserProfile(res.user.uid, email);
    } catch (error) { throw error; }
  };

  const logout = async () => {
    try { 
      await firebaseSignOut(auth); 
      setProfile(null);
      setUser(null);
    } catch (error) { console.error("Logout Failed:", error); }
  };

  const updateProfileSetting = async (data) => {
    if (user) {
      try {
        const profileRef = doc(db, 'users', user.uid);
        await updateDoc(profileRef, data);
      } catch (e) { console.error("Failed to update profile:", e); }
    }
  };

  // --- OBSERVER ---
  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);

      if (currentUser) {
        // Force creation of the parent document immediately
        await ensureUserProfile(currentUser.uid, currentUser.email);

        const profileRef = doc(db, 'users', currentUser.uid);
        unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
            if (docSnap.exists()) setProfile(docSnap.data());
        });
      } else {
        setProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
      }
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

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};

export const useFirebase = () => useContext(FirebaseContext);