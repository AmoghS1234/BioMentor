import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useNavigate } from "react-router-dom";

export const useTour = () => {
  const navigate = useNavigate();

  // Helper to run the driver
  const runDriver = (steps) => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      popoverClass: 'driverjs-theme', // Uses our CSS variable theme
      steps: steps
    });
    driverObj.drive();
  };

  // --- TOUR 1: GENERAL APP WALKTHROUGH ---
  const startMainTour = () => {
    // 1. Clean the screen by going to Dashboard
    navigate('/');

    // 2. Wait 300ms for the page to load, then start
    setTimeout(() => {
      runDriver([
        { 
          element: '#sidebar-logo', 
          popover: { title: 'Welcome to BioMentor', description: 'Your AI-powered biology workbench.', side: "right", align: 'start' } 
        },
        { 
          element: '#nav-workspace', 
          popover: { title: 'The Workspace', description: 'Access your AI Chat and Lab Notebooks here.', side: "right" } 
        },
        { 
          element: '#nav-tools', 
          popover: { title: 'Bio Tools', description: 'Specific tools for Sequence Alignment, Protein Visualization, and PubMed Search.', side: "right" } 
        },
        { 
          element: '#nav-learn', 
          popover: { title: 'Knowledge Base', description: 'Practice with Quizzes, Flashcards, and Tutorials.', side: "right" } 
        },
        { 
          element: '#user-menu-trigger', 
          popover: { title: 'Your Profile', description: 'Manage account settings and themes here.', side: "top" } 
        }
      ]);
    }, 300);
  };

  // --- TOUR 2: 3D VIEWER GUIDE ---
  const startViewerTour = () => {
    navigate('/viewer');

    setTimeout(() => {
        runDriver([
            {
                element: '#viewer-header',
                popover: { title: 'Protein Viewer', description: 'Visualize .pdb crystal structures in 3D.', side: "bottom" }
            },
            {
                element: '#pdb-input-area',
                popover: { title: 'Load Proteins', description: 'Enter a 4-character PDB ID (e.g., 4HHB for Hemoglobin) and hit Load.', side: "bottom" }
            },
            {
                element: '#viewer-canvas-container',
                popover: { title: 'Interactive Canvas', description: 'Left-Click to Rotate. Middle-Click to Zoom. Right-Click to Pan.', side: "left" }
            },
            {
                element: '#viewer-sidebar-controls',
                popover: { title: 'Style & Color', description: 'Switch between Cartoon, Stick, or Sphere modes to analyze structure.', side: "left" }
            }
        ]);
    }, 500); // Slightly longer wait for the 3D engine to initialize
  };

  return { startMainTour, startViewerTour };
};