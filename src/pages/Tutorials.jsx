import React, { useState } from 'react';
import { BookOpen, ChevronRight, CheckCircle } from 'lucide-react';

const MODULES = [
  { id: 'M01', title: 'Bioinformatics Basics', type: 'Theory', duration: '10m', content: 'Bioinformatics is an interdisciplinary field that develops methods and software tools for understanding biological data...' },
  { id: 'M02', title: 'Sequence Alignment', type: 'Algorithm', duration: '25m', content: 'Sequence alignment is a way of arranging the sequences of DNA, RNA, or protein to identify regions of similarity...' },
  { id: 'M03', title: 'Understanding BLAST', type: 'Tool', duration: '15m', content: 'The Basic Local Alignment Search Tool (BLAST) finds regions of local similarity between sequences...' },
  { id: 'M04', title: 'Protein Folding', type: 'Theory', duration: '20m', content: 'Protein folding is the physical process by which a protein chain acquires its native 3-dimensional structure...' },
];

export default function Tutorials() {
  const [activeModule, setActiveModule] = useState(MODULES[0]);

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 animate-fadeIn">
      
      {/* Sidebar Navigation */}
      <div className="w-72 pro-panel flex flex-col bg-panel overflow-hidden">
        <div className="p-4 border-b border-border bg-input/20">
          <h2 className="font-bold text-txt-primary flex items-center gap-2">
            <BookOpen size={18} className="text-brand" /> Curriculum
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {MODULES.map(mod => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                activeModule.id === mod.id 
                  ? 'bg-brand/10 border-brand text-brand' 
                  : 'bg-transparent border-transparent hover:bg-page text-txt-secondary'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold opacity-70">{mod.id}</span>
                <span className="text-[10px] uppercase bg-input px-1.5 rounded text-txt-muted">{mod.type}</span>
              </div>
              <div className="text-sm font-medium">{mod.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Reader Panel */}
      <div className="flex-1 pro-panel bg-page p-8 overflow-y-auto border border-border relative">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-txt-muted font-mono mb-4 uppercase tracking-widest">
            <span>Module</span> <ChevronRight size={12}/> <span>{activeModule.type}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-txt-primary mb-6">{activeModule.title}</h1>
          
          <div className="prose prose-invert prose-lg text-txt-secondary leading-relaxed border-b border-border pb-8 mb-8">
            <p>{activeModule.content}</p>
            <p className="mt-4">
              Detailed technical explanations would go here. For example, explaining the Smith-Waterman algorithm matrices or the implementation details of the BLAST heuristic search strategy.
            </p>
            <div className="bg-panel border-l-4 border-brand p-4 my-6 rounded-r-lg">
              <h4 className="font-bold text-txt-primary mb-1">Key Concept</h4>
              <p className="text-sm">Sequence homology implies evolutionary relationship, while similarity is a quantitative measure.</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-txt-muted">Estimated time: {activeModule.duration}</div>
            <button className="pro-btn flex items-center gap-2">
              <CheckCircle size={18} /> Mark as Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}