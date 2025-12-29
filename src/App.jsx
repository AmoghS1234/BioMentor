import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useFirebase } from './hooks/useFirebase';
import { useTour } from './context/TourContext'; 
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'; 
import { Loader } from 'lucide-react';

// --- COMPONENTS ---
import Sidebar from './components/Sidebar';
import TourMenu from './components/TourMenu'; 
import GuestWelcome from './components/GuestWelcome';

// --- PAGES ---
import Home from './pages/Home';
import ChatInterface from './pages/ChatInterface';
import BioTools from './pages/BioTools';
import SequenceAligner from './pages/SequenceAligner';
import PubmedSearch from './pages/PubmedSearch';
import LabProtocols from './pages/LabProtocols';
import CodonTable from './pages/CodonTable';
import ProteinViewer from './pages/ProteinViewer';
import Resources from './pages/Resources';
import Tutorials from './pages/Tutorials';
import StudyDeck from './pages/StudyDeck';
import QuizInterface from './pages/QuizInterface';
import ProblemSolver from './pages/ProblemSolver';
import BioNotes from './pages/BioNotes';
import LoginPage from './pages/LoginPage';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import Feedback from './pages/Feedback'; // Added

export default function App() {
    const { user, isAuthReady, db } = useFirebase();
    const { startMainTour } = useTour();
    
    const [showGuestModal, setShowGuestModal] = useState(false);
    const hasCheckedTour = useRef(false);

    // --- ONBOARDING LOGIC ---
    useEffect(() => {
        const checkOnboarding = async () => {
            if (!user || !db || hasCheckedTour.current) return;
            
            hasCheckedTour.current = true;

            // SCENARIO 1: GUEST USER
            if (user.isAnonymous) {
                const sessionGuest = sessionStorage.getItem('guestWelcomeSeen');
                if (!sessionGuest) {
                    setShowGuestModal(true);
                    sessionStorage.setItem('guestWelcomeSeen', 'true');
                }
                return;
            }

            // SCENARIO 2: REGISTERED USER
            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    if (!data.hasSeenTour) {
                        startMainTour();
                        await updateDoc(userRef, { hasSeenTour: true });
                    }
                } else {
                    // New user doc creation fallback
                    startMainTour();
                    await setDoc(userRef, { 
                        email: user.email, 
                        hasSeenTour: true,
                        createdAt: new Date()
                    }, { merge: true });
                }
            } catch (err) {
                console.error("Error checking tour status:", err);
            }
        };

        if (isAuthReady && user) {
            checkOnboarding();
        }
    }, [user, isAuthReady, db, startMainTour]);


    // 1. Loading State
    if (!isAuthReady) {
        return (
            <div className="min-h-screen bg-page flex flex-col items-center justify-center text-txt-secondary transition-colors duration-300">
                <Loader className="animate-spin mb-4 text-brand" size={32} />
                <p className="text-sm font-bold uppercase tracking-widest">Loading Workspace...</p>
            </div>
        );
    }

    // 2. Not Logged In
    if (!user) {
        return (
            <Routes>
                <Route path="*" element={<LoginPage />} />
            </Routes>
        );
    }

    // 3. Logged In
    return (
        <div className="min-h-screen bg-page flex text-txt-primary font-sans selection:bg-brand/30 selection:text-white transition-colors duration-300">
            
            <TourMenu /> 
            
            {showGuestModal && <GuestWelcome onClose={() => setShowGuestModal(false)} />}
            
            <Sidebar />

            <main className="flex-1 md:ml-64 transition-all duration-300">
                <div className="max-w-[1600px] mx-auto px-6 py-8 md:py-12 animate-fadeIn min-h-screen">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/chat" element={<ChatInterface />} />
                        <Route path="/notes" element={<BioNotes />} />
                        <Route path="/profile" element={<UserProfile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/feedback" element={<Feedback />} /> {/* Added */}

                        <Route path="/tools" element={<BioTools />} />
                        <Route path="/aligner" element={<SequenceAligner />} />
                        <Route path="/pubmed" element={<PubmedSearch />} />
                        <Route path="/viewer" element={<ProteinViewer />} />

                        <Route path="/protocols" element={<LabProtocols />} />
                        <Route path="/codon" element={<CodonTable />} />
                        <Route path="/resources" element={<Resources />} />

                        <Route path="/tutorials" element={<Tutorials />} />
                        <Route path="/quiz" element={<QuizInterface />} />
                        <Route path="/flashcards" element={<StudyDeck />} />
                        <Route path="/problems" element={<ProblemSolver />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}