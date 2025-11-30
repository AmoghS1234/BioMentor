import React, { useState } from 'react';
import { BookOpen, ChevronRight, CheckCircle, Sparkles, Loader, PlayCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAiGenerator } from '../hooks/useAiGenerator';

const DEFAULT_MODULES = [
  { id: 'M01', title: 'Bioinformatics Basics', type: 'Theory', duration: '10m', content: 'Bioinformatics is an interdisciplinary field...' },
  { id: 'M02', title: 'Sequence Alignment', type: 'Algorithm', duration: '25m', content: 'Sequence alignment is a way of arranging the sequences...' },
];

export default function Tutorials() {
  const { generateContent, isGenerating } = useAiGenerator();
  const [modules, setModules] = useState(DEFAULT_MODULES);
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [genTopic, setGenTopic] = useState('');

  const handleGenerate = async () => {
    if (!genTopic.trim()) return;
    const newModules = await generateContent(genTopic, 'tutorial');
    if (newModules) {
      const mod = { ...newModules[0], id: `AI-${Date.now()}` };
      setModules([...modules, mod]);
      setActiveModule(mod);
      setGenTopic('');
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-fadeIn">
      
      {/* Sidebar Navigation */}
      <div className="w-80 flex flex-col pro-panel bg-panel overflow-hidden h-full border-r-0 shadow-xl">
        <div className="p-4 border-b border-border bg-input/10">
          <h2 className="font-bold text-txt-primary flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-brand" /> Learning Path
          </h2>
          
          {/* Mini Generator */}
          <div className="flex gap-2">
            <input 
              value={genTopic}
              onChange={(e) => setGenTopic(e.target.value)}
              placeholder="Topic (e.g. HMMs)..."
              className="pro-input text-xs py-1.5 px-2"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button onClick={handleGenerate} disabled={isGenerating} className="bg-brand hover:bg-brand-hover text-white px-3 rounded text-xs font-bold disabled:opacity-50">
              {isGenerating ? <Loader size={14} className="animate-spin"/> : <Sparkles size={14}/>}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {modules.map(mod => (
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
              <div className="text-sm font-medium truncate">{mod.title}</div>
              <div className="text-[10px] text-txt-muted mt-1 flex items-center gap-1">
                <PlayCircle size={10} /> {mod.duration}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reader Panel */}
      <div className="flex-1 pro-panel bg-page p-8 overflow-y-auto border border-border relative shadow-none">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-txt-muted font-mono mb-4 uppercase tracking-widest">
            <span>Module</span> <ChevronRight size={12}/> <span>{activeModule.type}</span>
          </div>
          
          <h1 className="text-3xl font-bold text-txt-primary mb-6">{activeModule.title}</h1>
          
          <div className="prose prose-invert prose-sm max-w-none text-txt-secondary leading-relaxed border-b border-border pb-8 mb-8">
            <ReactMarkdown>{activeModule.content}</ReactMarkdown>
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