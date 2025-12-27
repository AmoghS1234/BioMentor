import React from 'react';
import { useTour } from '../context/TourContext';
import { 
    Dna, Search, GitMerge, X, ArrowRight, Grid, 
    MessageSquare, Calculator, FileText, BrainCircuit, 
    Layers, ClipboardList 
} from 'lucide-react';

export default function TourMenu() {
  const { 
      showTourMenu, setShowTourMenu, 
      runChatTour, runBioToolsTour, runNotesTour,
      runQuizTour, runDeckTour, runProtocolTour,
      runCodonTour, runViewerTour, runAlignerTour, runPubmedTour 
  } = useTour();

  if (!showTourMenu) return null;

  const handleAction = (actionFn) => {
    setShowTourMenu(false);
    actionFn();
  };

  const sections = [
    {
        title: "Core Workspace",
        items: [
            { label: "AI Mentor Chat", icon: MessageSquare, fn: runChatTour, color: "text-brand" },
            { label: "Lab Notebooks", icon: FileText, fn: runNotesTour, color: "text-yellow-500" },
        ]
    },
    {
        title: "Analysis Tools",
        items: [
            { label: "Sequence Calc", icon: Calculator, fn: runBioToolsTour, color: "text-green-500" },
            { label: "3D Protein Viewer", icon: Dna, fn: runViewerTour, color: "text-purple-500" },
            { label: "Sequence Aligner", icon: GitMerge, fn: runAlignerTour, color: "text-blue-500" },
            { label: "PubMed Search", icon: Search, fn: runPubmedTour, color: "text-emerald-500" },
        ]
    },
    {
        title: "Learning & Reference",
        items: [
            { label: "Quiz Generator", icon: BrainCircuit, fn: runQuizTour, color: "text-pink-500" },
            { label: "Study Flashcards", icon: Layers, fn: runDeckTour, color: "text-orange-500" },
            { label: "Lab Protocols", icon: ClipboardList, fn: runProtocolTour, color: "text-cyan-500" },
            { label: "Codon Table", icon: Grid, fn: runCodonTour, color: "text-indigo-500" },
        ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-panel border border-border rounded-2xl shadow-2xl w-full max-w-4xl relative max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
                    <Grid className="text-brand" /> Interactive Guides
                </h2>
                <p className="text-txt-secondary text-sm">Select a tool to launch a step-by-step walkthrough.</p>
            </div>
            <button 
                onClick={() => setShowTourMenu(false)}
                className="p-2 text-txt-muted hover:text-txt-primary hover:bg-page rounded-full transition-colors"
            >
                <X size={24} />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar p-6 space-y-8">
            {sections.map((section, idx) => (
                <div key={idx}>
                    <h3 className="text-xs font-bold text-txt-muted uppercase tracking-wider mb-4">{section.title}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {section.items.map((item, itemIdx) => {
                            const Icon = item.icon;
                            return (
                                <button 
                                    key={itemIdx}
                                    onClick={() => handleAction(item.fn)} 
                                    className="p-4 rounded-xl border border-border bg-page hover:border-brand/50 hover:bg-panel transition-all group flex items-center gap-4 text-left"
                                >
                                    <div className={`bg-page border border-border p-2.5 rounded-lg ${item.color} group-hover:scale-110 transition-transform`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-txt-primary text-sm">{item.label}</h3>
                                        <p className="text-xs text-txt-secondary mt-0.5">Launch guide →</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-input/10 text-center">
            <button 
                onClick={() => setShowTourMenu(false)}
                className="text-sm font-medium text-txt-muted hover:text-txt-primary transition-colors"
            >
                Close Menu
            </button>
        </div>
      </div>
    </div>
  );
}