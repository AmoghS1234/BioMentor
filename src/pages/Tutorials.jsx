import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, CheckCircle, Sparkles, Loader, PlayCircle, ArrowRight, GitBranch, RotateCcw, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAiGenerator } from '../hooks/useAiGenerator';
import { useFirebase } from '../hooks/useFirebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { STATIC_TUTORIALS } from '../data/staticTutorials';

// Flowchart Component (Kept same)
const FlowchartBlock = ({ content }) => {
  const parseFlowchart = (text) => {
    const parts = text.split(/(\||→|->)/).map(s => s.trim()).filter(Boolean);
    return parts;
  };
  const elements = parseFlowchart(content);
  return (
    <div className="my-8 p-6 bg-gradient-to-br from-brand/5 to-purple-500/5 border border-brand/20 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch size={16} className="text-brand" />
        <span className="text-xs font-bold text-txt-muted uppercase tracking-wider">Workflow</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {elements.map((element, idx) => {
          if (element === '→' || element === '->') {
            return <ArrowRight key={idx} size={20} className="text-brand/60 flex-shrink-0" />;
          } else if (element === '|') {
            return <div key={idx} className="h-12 w-px bg-border flex-shrink-0"></div>;
          } else {
            return (
              <div key={idx} className="px-4 py-2 bg-panel border border-border rounded-lg text-txt-primary text-sm font-medium hover:border-brand/50 hover:bg-brand/5 transition-all">
                {element}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default function Tutorials() {
  const { generateContent, isGenerating } = useAiGenerator();
  const { user, db, isAuthReady } = useFirebase();
  
  const [modules, setModules] = useState(STATIC_TUTORIALS);
  const [activeModule, setActiveModule] = useState(STATIC_TUTORIALS[0]);
  const [genTopic, setGenTopic] = useState('');
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        if (data.customTutorials) {
            setModules([...STATIC_TUTORIALS, ...data.customTutorials]);
        }
        if (data.completedModules) {
            setCompleted(data.completedModules);
        }
      }
    };
    if (isAuthReady) loadUserData();
  }, [user, isAuthReady, db]);

  const handleGenerate = async () => {
    if (!genTopic.trim()) return;
    
    const newAIModules = await generateContent(genTopic, 'tutorial');
    
    if (newAIModules && newAIModules.length > 0) {
      const mod = { ...newAIModules[0], id: `AI-${Date.now()}`, type: 'AI Generated' };
      
      setModules(prev => [...prev, mod]);
      setActiveModule(mod);
      setGenTopic('');

      if (user) {
          await setDoc(doc(db, 'users', user.uid), {
              customTutorials: arrayUnion(mod)
          }, { merge: true });
      }
    }
  };

  const deleteTutorial = async (e, tutorialId) => {
    e.stopPropagation(); 
    if (!confirm("Delete this tutorial?")) return;

    // 1. Update Local State
    const updatedModules = modules.filter(m => m.id !== tutorialId);
    setModules(updatedModules);

    // 2. If the deleted module was active, switch to the first available one
    if (activeModule.id === tutorialId && updatedModules.length > 0) {
        setActiveModule(updatedModules[0]);
    }

    // 3. Update Firestore (Only if it's a custom one, otherwise just local state for session)
    if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const currentCustom = data.customTutorials || [];
            // We filter out the deleted ID from the custom list in DB
            const newCustom = currentCustom.filter(m => m.id !== tutorialId);
            await updateDoc(userRef, { customTutorials: newCustom });
        }
    }
  };

  const markComplete = async () => {
      if (!completed.includes(activeModule.id)) {
          const newCompleted = [...completed, activeModule.id];
          setCompleted(newCompleted);
          if (user) {
              await updateDoc(doc(db, 'users', user.uid), {
                  completedModules: newCompleted,
                  xp: (await getDoc(doc(db, 'users', user.uid))).data().xp + 100
              });
          }
      }
  };

  const resetComplete = async () => {
      if (completed.includes(activeModule.id)) {
          const newCompleted = completed.filter(id => id !== activeModule.id);
          setCompleted(newCompleted);
          if (user) {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              const currentXP = userDoc.data().xp || 0;
              await updateDoc(doc(db, 'users', user.uid), {
                  completedModules: newCompleted,
                  xp: Math.max(0, currentXP - 100)
              });
          }
      }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-fadeIn">
      
      {/* SIDEBAR */}
      <div className="w-80 flex flex-col pro-panel bg-panel overflow-hidden h-full border-r-0 shadow-xl">
        <div className="p-4 border-b border-border bg-input/10">
          <h2 className="font-bold text-txt-primary flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-brand" /> Learning Path
          </h2>
          
          <div className="flex gap-2">
            <input 
              value={genTopic}
              onChange={(e) => setGenTopic(e.target.value)}
              placeholder="Generate Lesson..."
              className="pro-input text-xs py-2 px-3 bg-page border-border"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button 
                onClick={handleGenerate} 
                disabled={isGenerating} 
                className="bg-brand hover:bg-brand-hover text-white px-3 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center min-w-[40px]"
            >
              {isGenerating ? <Loader size={14} className="animate-spin"/> : <Sparkles size={14}/>}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {modules.map(mod => {
            const isDone = completed.includes(mod.id);
            const isActive = activeModule.id === mod.id;

            return (
                <div 
                    key={mod.id}
                    onClick={() => setActiveModule(mod)}
                    className={`w-full text-left p-3 rounded-lg border transition-all group relative cursor-pointer ${
                        isActive 
                        ? 'bg-brand/10 border-brand text-brand' 
                        : 'bg-transparent border-transparent hover:bg-page text-txt-secondary'
                    }`}
                >
                <div className="flex justify-between items-center mb-1">
                    <span className={`text-[10px] uppercase px-1.5 rounded font-bold ${isActive ? 'bg-brand text-white' : 'bg-input text-txt-muted'}`}>
                        {mod.type}
                    </span>
                    {isDone && <CheckCircle size={14} className="text-green-500" />}
                    
                    {/* DELETE BUTTON: ALWAYS VISIBLE FOR ALL MODULES */}
                    <button 
                        onClick={(e) => deleteTutorial(e, mod.id)}
                        className="absolute right-2 top-2 p-1.5 text-txt-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors z-20"
                        title="Delete Tutorial"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                <div className="text-sm font-medium truncate group-hover:text-txt-primary pr-8">{mod.title}</div>
                <div className="text-[10px] text-txt-muted mt-1 flex items-center gap-1">
                    <PlayCircle size={10} /> {mod.duration}
                </div>
                </div>
            );
          })}
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="flex-1 pro-panel bg-page overflow-y-auto border border-border relative shadow-none custom-scrollbar">
        <div className="max-w-4xl mx-auto p-10">
          
          <div className="flex items-center gap-2 text-xs text-txt-muted font-mono mb-6 uppercase tracking-widest">
            <span>Tutorials</span> 
            <ChevronRight size={12}/> 
            <span className="text-brand">{activeModule.type}</span>
            <ChevronRight size={12}/> 
            <span>{activeModule.id}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-txt-primary mb-8 leading-tight border-b border-border pb-6">
            {activeModule.title}
          </h1>
          
          <div className="prose prose-invert prose-lg max-w-none text-txt-secondary leading-relaxed">
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    code: ({inline, className, children}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';
                        if (!inline && language === 'flowchart') {
                            return <FlowchartBlock content={String(children)} />;
                        }
                        if (inline) {
                            return <code className="bg-input text-brand-light px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>;
                        }
                        return <code className={className}>{children}</code>;
                    },
                    h2: ({children}) => (
                        <h2 className="text-2xl font-bold text-txt-primary mt-12 mb-4 flex items-center gap-2">
                            <span className="w-2 h-8 bg-brand rounded-full inline-block"></span>{children}
                        </h2>
                    ),
                    h3: ({children}) => <h3 className="text-xl font-bold text-txt-primary mt-8 mb-3">{children}</h3>,
                    pre: ({children}) => <pre className="bg-[#0d1117] p-4 rounded-lg border border-border overflow-x-auto my-4 text-sm">{children}</pre>,
                    table: ({children}) => <div className="overflow-x-auto my-6 rounded-lg border border-border"><table className="w-full text-sm text-left bg-panel">{children}</table></div>,
                    thead: ({children}) => <thead className="bg-input text-txt-primary uppercase font-bold text-xs">{children}</thead>,
                    th: ({children}) => <th className="px-4 py-3 border-b border-border whitespace-nowrap">{children}</th>,
                    td: ({children}) => <td className="px-4 py-3 border-b border-border/50">{children}</td>,
                    a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand hover:text-brand-hover underline decoration-brand/30 hover:decoration-brand transition-colors">{children}</a>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-brand pl-4 py-2 my-4 italic text-txt-muted bg-input/30 rounded-r-lg">{children}</blockquote>,
                }}
            >
                {activeModule.content}
            </ReactMarkdown>
          </div>

          <div className="mt-16 pt-8 border-t border-border flex justify-between items-center bg-panel/30 p-6 rounded-xl">
            <div>
                <p className="text-txt-primary font-bold">Finished reading?</p>
                <p className="text-sm text-txt-muted">Mark as complete to earn XP.</p>
            </div>
            <div className="flex items-center gap-3">
              {completed.includes(activeModule.id) && (
                <button onClick={resetComplete} className="flex items-center gap-2 px-6 py-3 bg-input hover:bg-input/80 text-txt-secondary hover:text-txt-primary border border-border rounded-lg transition-all font-medium">
                  <RotateCcw size={18} /> Reset
                </button>
              )}
              <button onClick={markComplete} disabled={completed.includes(activeModule.id)} className={`pro-btn flex items-center gap-2 px-8 py-3 ${completed.includes(activeModule.id) ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                {completed.includes(activeModule.id) ? <><CheckCircle size={18} /> Completed</> : <>Mark Complete <ChevronRight size={18} /></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}