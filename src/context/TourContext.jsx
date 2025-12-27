import React, { createContext, useContext, useState } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useNavigate } from "react-router-dom";

const TourContext = createContext();

export const TourProvider = ({ children }) => {
  const [showTourMenu, setShowTourMenu] = useState(false);
  const navigate = useNavigate();

  // Helper to create driver instance
  const createDriver = (steps, onFinish) => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      popoverClass: 'driverjs-theme',
      steps: steps,
      onDestroyStarted: () => {
        driverObj.destroy();
        if (onFinish) {
             setTimeout(onFinish, 100);
        }
      },
    });
    return driverObj;
  };

  // --- ACTIONS ---
  const openToolMenu = () => setShowTourMenu(true);

  // 1. MAIN TOUR (Opens Menu at end)
  const startMainTour = () => {
    setShowTourMenu(false);
    navigate('/');

    setTimeout(() => {
      const steps = [
        { element: '#sidebar-logo', popover: { title: 'Welcome to BioMentor', description: 'Your AI-powered biology workbench.', side: "right", align: 'start' } },
        { element: '#nav-workspace', popover: { title: 'The Workspace', description: 'Access your AI Chat and Lab Notebooks here.', side: "right" } },
        { element: '#nav-tools', popover: { title: 'Bio Tools', description: 'Powerful utilities like Sequence Aligners and Protein Viewers.', side: "right" } },
        { element: '#nav-learn', popover: { title: 'Knowledge Base', description: 'Practice with Quizzes, Flashcards, and Tutorials.', side: "right" } },
        { element: '#user-menu-trigger', popover: { title: 'Your Profile', description: 'Manage account settings and themes here.', side: "top" } }
      ];
      createDriver(steps, () => setShowTourMenu(true)).drive();
    }, 300);
  };

  // 2. TOOL TOURS (Closes Menu, Does not reopen)
  const startToolTour = (path, steps) => {
    setShowTourMenu(false);
    navigate(path);
    setTimeout(() => {
        createDriver(steps, null).drive(); 
    }, 500);
  };

  // --- DEFINITIONS FOR ALL TOOLS ---

  // 1. Chat Interface
  const runChatTour = () => startToolTour('/chat', [
    { element: '#chat-header', popover: { title: 'AI Mentor', description: 'Chat with our bio-specialized AI model.', side: "bottom" } },
    { element: '#chat-history-sidebar', popover: { title: 'Session History', description: 'Access previous conversations here.', side: "right" } },
    { element: '#chat-settings-toggle', popover: { title: 'Model Settings', description: 'Configure API endpoints and model parameters.', side: "top" } },
    { element: '#chat-input-area', popover: { title: 'Command Center', description: 'Type queries, ask for code, or request diagrams.', side: "top" } }
  ]);

  // 2. Bio Tools (Calculator)
  const runBioToolsTour = () => startToolTour('/tools', [
    { element: '#tools-header', popover: { title: 'Sequence Analysis', description: 'Analyze raw DNA/RNA sequences instantly.', side: "bottom" } },
    { element: '#tools-input-area', popover: { title: 'Input Area', description: 'Paste FASTA or raw sequence data here.', side: "right" } },
    { element: '#tools-tabs', popover: { title: 'Analysis Modes', description: 'Switch between Stats, Translation, and Melting Temp.', side: "bottom" } },
    { element: '#tools-results-area', popover: { title: 'Results', description: 'View GC content, molecular weight, and protein translation.', side: "left" } }
  ]);

  // 3. Bio Notes
  const runNotesTour = () => startToolTour('/notes', [
    { element: '#notes-sidebar', popover: { title: 'Notebooks', description: 'Organize your research notes here.', side: "right" } },
    { element: '#notes-add-btn', popover: { title: 'Create Note', description: 'Start a new blank entry.', side: "bottom" } },
    { element: '#notes-editor', popover: { title: 'Editor', description: 'Write your observations. Changes auto-save locally.', side: "left" } }
  ]);

  // 4. Quiz Interface
  const runQuizTour = () => startToolTour('/quiz', [
    { element: '#quiz-header', popover: { title: 'Assessment Center', description: 'Test your knowledge.', side: "bottom" } },
    { element: '#quiz-ai-generator', popover: { title: 'AI Generator', description: 'Type a topic (e.g., "Mitosis") to generate a unique exam instantly.', side: "bottom" } },
    { element: '#quiz-topic-grid', popover: { title: 'Available Exams', description: 'Select a saved quiz to begin.', side: "top" } }
  ]);

  // 5. Study Deck (Flashcards)
  const runDeckTour = () => startToolTour('/flashcards', [
    { element: '#deck-header', popover: { title: 'Study Deck', description: 'Spaced repetition flashcards.', side: "bottom" } },
    { element: '#deck-ai-btn', popover: { title: 'AI Generator', description: 'Create a full deck of cards on any topic in seconds.', side: "bottom" } },
    { element: '#deck-start-btn', popover: { title: 'Study Mode', description: 'Enter immersive flip-card mode.', side: "bottom" } },
    { element: '#deck-grid', popover: { title: 'Card Collection', description: 'Manage your individual cards here.', side: "top" } }
  ]);

  // 6. Lab Protocols
  const runProtocolTour = () => startToolTour('/protocols', [
    { element: '#protocols-header', popover: { title: 'Lab Protocols', description: 'Standard Operating Procedures manager.', side: "bottom" } },
    { element: '#protocols-add-btn', popover: { title: 'New Protocol', description: 'Create custom checklists for your experiments.', side: "bottom" } },
    { element: '#protocols-sidebar', popover: { title: 'Library', description: 'Select from saved protocols.', side: "right" } },
    { element: '#protocols-checklist', popover: { title: 'Interactive Checklist', description: 'Click steps to mark them as done during lab work.', side: "left" } }
  ]);

  // 7. Codon Table
  const runCodonTour = () => startToolTour('/codon', [
    { element: '#codon-header', popover: { title: 'Genetic Code', description: 'Standard RNA Codon Table reference.', side: "bottom" } },
    { element: '#codon-grid', popover: { title: 'Reference Grid', description: 'Find amino acids by triplet. Start (AUG) and Stop codons are highlighted.', side: "top" } }
  ]);

  // 8. Visualizers (Existing)
  const runViewerTour = () => startToolTour('/viewer', [
    { element: '#viewer-header', popover: { title: 'Protein Viewer', description: 'Visualize .pdb crystal structures.', side: "bottom" } },
    { element: '#pdb-input-area', popover: { title: 'Load Data', description: 'Enter PDB ID (e.g., 4HHB).', side: "bottom" } },
    { element: '#viewer-canvas-container', popover: { title: 'Canvas', description: 'Left-Click: Rotate, Middle: Zoom.', side: "left" } },
    { element: '#viewer-sidebar-controls', popover: { title: 'Styles', description: 'Change visualization modes.', side: "left" } }
  ]);

  const runAlignerTour = () => startToolTour('/aligner', [
    { element: '#aligner-header', popover: { title: 'Sequence Aligner', description: 'Global alignment (Needleman-Wunsch).', side: "bottom" } },
    { element: '#aligner-inputs', popover: { title: 'Inputs', description: 'Paste two sequences here.', side: "right" } },
    { element: '#aligner-results', popover: { title: 'Alignment Map', description: 'Visual matches and identity score.', side: "left" } }
  ]);

  const runPubmedTour = () => startToolTour('/pubmed', [
    { element: '#pubmed-header', popover: { title: 'PubMed Search', description: 'NCBI Database interface.', side: "bottom" } },
    { element: '#pubmed-search-area', popover: { title: 'Query', description: 'Search biological literature.', side: "bottom" } },
    { element: '#pubmed-results', popover: { title: 'Papers', description: 'Direct links to full text articles.', side: "top" } }
  ]);

  return (
    <TourContext.Provider value={{ 
        showTourMenu, setShowTourMenu, openToolMenu, startMainTour,
        runChatTour, runBioToolsTour, runNotesTour,
        runQuizTour, runDeckTour, runProtocolTour,
        runCodonTour, runViewerTour, runAlignerTour, runPubmedTour
    }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);