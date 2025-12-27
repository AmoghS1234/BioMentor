import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTour } from '../context/TourContext';
import { useFirebase } from '../hooks/useFirebase'; // <--- Import Firebase Hook
import { 
  Palette, Check, PlayCircle, HelpCircle, LayoutDashboard, Grid, 
  Database, Trash2, AlertTriangle, X 
} from 'lucide-react';

export default function Settings() {
  const { currentTheme, applyTheme, themes } = useTheme();
  const { startMainTour, openToolMenu } = useTour();
  const { clearAccountData } = useFirebase(); // <--- Get function

  // Confirmation Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleWipe = async () => {
    setIsDeleting(true);
    await clearAccountData();
    // No need to set false, page will reload
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn pb-12">
      
      {/* SECTION 1: HELP & GUIDES */}
      <div className="space-y-6">
        <div className="border-b border-border pb-6">
            <h2 className="text-3xl font-bold text-txt-primary flex items-center gap-3">
            <HelpCircle className="text-brand" /> Help & Support
            </h2>
            <p className="text-txt-secondary mt-1">Learn how to navigate the workspace.</p>
        </div>
        
        <div className="pro-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-brand/50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="bg-brand/10 w-12 h-12 rounded-xl flex items-center justify-center text-brand">
                    <LayoutDashboard size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-txt-primary">Interactive Tutorials</h3>
                    <p className="text-txt-secondary text-sm">Get a tour of the app or learn specific tools.</p>
                </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
                <button 
                    onClick={startMainTour}
                    className="pro-btn flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3"
                >
                    <PlayCircle size={18} /> Start Tour
                </button>

                <button 
                    onClick={openToolMenu}
                    className="pro-btn flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-panel border border-border hover:bg-page text-txt-primary"
                >
                    <Grid size={18} /> Tool Guides
                </button>
            </div>
        </div>
      </div>

      {/* SECTION 2: THEMES */}
      <div className="space-y-6">
        <div className="border-b border-border pb-6">
            <h2 className="text-3xl font-bold text-txt-primary flex items-center gap-3">
            <Palette className="text-brand" /> Appearance
            </h2>
            <p className="text-txt-secondary mt-1">Customize the look and feel of your workspace.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(themes).map(([key, theme]) => {
                const Icon = theme.icon;
                const isActive = currentTheme === key;
                return (
                <button
                    key={key}
                    onClick={() => applyTheme(key)}
                    className={`group relative p-6 rounded-xl border text-left overflow-hidden transition-all duration-300 ${
                    isActive 
                        ? 'border-brand ring-1 ring-brand bg-panel shadow-md' 
                        : 'border-border bg-panel hover:border-brand/50'
                    }`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full shadow-sm ring-1 ring-white/10" style={{ backgroundColor: theme.colors.page }}></div>
                            <div className="w-6 h-6 rounded-full shadow-sm ring-1 ring-white/10" style={{ backgroundColor: theme.colors.panel }}></div>
                            <div className="w-6 h-6 rounded-full shadow-sm ring-1 ring-white/10" style={{ backgroundColor: theme.colors.brand }}></div>
                        </div>
                        {isActive && <Check className="text-brand" size={20} />}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <Icon size={18} className={isActive ? 'text-brand' : 'text-txt-secondary'} />
                        <h3 className="font-bold text-txt-primary">{theme.name}</h3>
                    </div>
                </button>
                )
            })}
        </div>
      </div>

      {/* SECTION 3: DANGER ZONE */}
      <div className="space-y-6">
        <div className="border-b border-red-500/30 pb-6">
            <h2 className="text-3xl font-bold text-red-500 flex items-center gap-3">
            <AlertTriangle className="text-red-500" /> Danger Zone
            </h2>
            <p className="text-txt-secondary mt-1">Irreversible actions regarding your account data.</p>
        </div>

        <div className="pro-panel p-6 border-red-500/20 bg-red-500/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="bg-red-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-red-500">
                    <Database size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-txt-primary">Clear Account Data</h3>
                    <p className="text-txt-secondary text-sm">
                        Permanently delete all notes, flashcards, protocols, and XP. <br/>
                        <span className="font-bold text-red-400">Your account will remain active.</span>
                    </p>
                </div>
            </div>
            
            <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="pro-btn bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 border-none shadow-red-500/20 shadow-lg px-6 py-3"
            >
                <Trash2 size={18} /> Wipe Data
            </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4">
            <div className="bg-panel border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
                <div className="p-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-txt-primary mb-2">Are you absolutely sure?</h2>
                    <p className="text-txt-secondary text-sm leading-relaxed mb-6">
                        This action will <span className="font-bold text-red-400">permanently delete</span> all your research notes, flashcards, custom protocols, and quiz progress. 
                        This cannot be undone.
                    </p>

                    <div className="space-y-3">
                        <button 
                            onClick={handleWipe}
                            disabled={isDeleting}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            {isDeleting ? "Wiping Data..." : "Yes, Delete Everything"}
                        </button>

                        <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="w-full py-3 bg-page border border-border text-txt-secondary hover:text-txt-primary rounded-xl font-medium transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}