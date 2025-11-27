import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import ChatInterface from './pages/ChatInterface';
import BioTools from './pages/BioTools';
import SequenceAligner from './pages/SequenceAligner';
import PubmedSearch from './pages/PubmedSearch';
import LabProtocols from './pages/LabProtocols';
import CodonTable from './pages/CodonTable';
import Resources from './pages/Resources';
import Tutorials from './pages/Tutorials';
import StudyDeck from './pages/StudyDeck';
import QuizInterface from './pages/QuizInterface';
import ProblemSolver from './pages/ProblemSolver';
import BioNotes from './pages/BioNotes';
// import ProteinViewer from './pages/ProteinViewer'; // Uncomment if file exists

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-page flex text-txt-primary font-sans selection:bg-brand/30 selection:text-white">
        {/* Sidebar stays visible on all pages */}
        <Sidebar />
        
        {/* Main Content Area changes based on URL */}
        <main className="flex-1 md:ml-64 transition-all duration-300">
          <div className="max-w-[1600px] mx-auto px-6 py-8 md:py-12 animate-fadeIn min-h-screen">
            <Routes>
              {/* Core */}
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<ChatInterface />} />
              <Route path="/notes" element={<BioNotes />} />

              {/* Tools */}
              <Route path="/tools" element={<BioTools />} />
              <Route path="/aligner" element={<SequenceAligner />} />
              <Route path="/pubmed" element={<PubmedSearch />} />
              {/* <Route path="/viewer" element={<ProteinViewer />} /> */}

              {/* References */}
              <Route path="/protocols" element={<LabProtocols />} />
              <Route path="/codon" element={<CodonTable />} />
              <Route path="/resources" element={<Resources />} />

              {/* Learning */}
              <Route path="/tutorials" element={<Tutorials />} />
              <Route path="/quiz" element={<QuizInterface />} />
              <Route path="/flashcards" element={<StudyDeck />} />
              <Route path="/problems" element={<ProblemSolver />} />
              
              {/* Redirect unknown paths to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}