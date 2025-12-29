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
  browserSessionPersistence,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  getDoc,
  collection,   // <--- Added
  getDocs,      // <--- Added
  deleteDoc     // <--- Added
} from 'firebase/firestore';

const FirebaseContext = createContext();

// ⚠️ REPLACE WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // ... (Helper: ensureUserProfile remains the same)
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
              hasSeenTour: false, // Ensure tour state is tracked
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
      sessionStorage.removeItem('guestWelcomeSeen'); // Reset guest tour flag on logout
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

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  // --- NEW: WIPE DATA FUNCTION ---
// --- NEW: WIPE DATA FUNCTION (AGGRESSIVE) ---
  const clearAccountData = async () => {
    if (!user || !db) return;

    try {
      // 1. Delete "flashcards" Sub-collection
      const cardsRef = collection(db, `users/${user.uid}/flashcards`);
      const cardSnap = await getDocs(cardsRef);
      const cardPromises = cardSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(cardPromises);

      // 2. Delete "chats" Sub-collection (This was missing!)
      const chatsRef = collection(db, `users/${user.uid}/chats`);
      const chatSnap = await getDocs(chatsRef);
      const chatPromises = chatSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(chatPromises);

      // 3. Reset Main User Document (Wipe XP, settings, etc.)
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || 'Anonymous',
        displayName: user.displayName || 'Guest',
        createdAt: Date.now(),
        lastLogin: Date.now(),
        xp: 0,
        hasSeenTour: false, // Reset tour
        aiModel: 'gemini-2.5-flash',
        aiEndpoint: '/api/gemini'
      });

      // 4. Clear ALL Local Storage items used by the app
      localStorage.removeItem('bioNotes');
      localStorage.removeItem('custom-protocols');
      localStorage.removeItem('bio-chat-sessions'); // Clear any cached chat lists
      
      sessionStorage.clear();

      // 5. Reload page to force a fresh state
      window.location.reload();

    } catch (err) {
      console.error("Failed to clear data:", err);
      throw new Error("Could not clear data. Please try again.");
    }
  };

  // --- AUTH OBSERVER ---
  useEffect(() => {
    if (!auth) return;

    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        await ensureUserProfile(currentUser.uid, currentUser.email, currentUser.displayName);

        const profileRef = doc(db, 'users', currentUser.uid);
        unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
            if (docSnap.exists()) setProfile(docSnap.data());
        });
      } else {
        setProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
      }
      setIsAuthReady(true);
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const value = {
    user, profile, isAuthReady, db, auth,
    loginWithEmail, 
    registerWithEmail, 
    loginAsGuest, 
    logout, 
    updateProfileSetting, 
    resetPassword,
    clearAccountData // <--- Exported here
  };

  if (!app) return <div className="p-10 text-center text-red-500">Error: Firebase config missing.</div>;

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};

export const useFirebase = () => useContext(FirebaseContext);