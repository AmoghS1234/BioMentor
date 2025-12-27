import React from 'react';
import { Sparkles, X, PlayCircle, Map } from 'lucide-react';
import { useTour } from '../context/TourContext';

export default function GuestWelcome({ onClose }) {
  const { startMainTour } = useTour();

  const handleStart = () => {
    onClose(); // Close this modal
    startMainTour(); // Start the driver.js tour
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-panel border border-brand/30 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-purple-500"></div>
        
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center text-brand mb-6 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Sparkles size={32} />
          </div>

          <h2 className="text-2xl font-bold text-txt-primary mb-2">Welcome to BioMentor!</h2>
          <p className="text-txt-secondary text-sm leading-relaxed mb-8">
            You are logged in as a Guest. Would you like a quick interactive tour to explore the features?
          </p>

          <div className="space-y-3">
            <button 
              onClick={handleStart}
              className="w-full py-3 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
            >
              <PlayCircle size={18} /> Yes, Show Me Around
            </button>

            <button 
              onClick={onClose}
              className="w-full py-3 bg-page border border-border text-txt-secondary hover:text-txt-primary hover:border-brand/50 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <Map size={18} /> No, I'll Explore Myself
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}