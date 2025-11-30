import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, CheckCircle, Sparkles, Loader, PlayCircle, FileText, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAiGenerator } from '../hooks/useAiGenerator';
import { useFirebase } from '../hooks/useFirebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { STATIC_TUTORIALS } from '../data/staticTutorials';

export default function Tutorials() {
  const { generateContent, isGenerating } = useAiGenerator();
  const { user, db, isAuthReady } = useFirebase();
  
  const [modules, setModules] = useState(STATIC_TUTORIALS);
  const [activeModule, setActiveModule] = useState(STATIC_TUTORIALS[0]);
  const [genTopic, setGenTopic] = useState('');
  const [completed, setCompleted] = useState([]);

  // 1. Load User's Custom Tutorials & Progress
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        // Merge Static (Hardcoded) + Custom (Firestore)
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
    
    // 1. Generate
    const newAIModules = await generateContent(genTopic, 'tutorial');
    
    if (newAIModules && newAIModules.length > 0) {
      const mod = { ...newAIModules[0], id: `AI-${Date.now()}`, type: 'AI Generated' };
      
      // 2. Update Local State
      setModules(prev => [...prev, mod]);
      setActiveModule(mod);
      setGenTopic('');

      // 3. Save to Cloud
      if (user) {
          await setDoc(doc(db, 'users', user.uid), {
              customTutorials: arrayUnion(mod)
          }, { merge: true });
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
                  xp: (await getDoc(doc(db, 'users', user.uid))).data().xp + 100 // Bonus XP!
              });
          }
      }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-fadeIn">
      
      {/* SIDEBAR: Curriculum */}
      <div className="w-80 flex flex-col pro-panel bg-panel overflow-hidden h-full border-r-0 shadow-xl">
        <div className="p-4 border-b border-border bg-input/10">
          <h2 className="font-bold text-txt-primary flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-brand" /> Learning Path
          </h2>
          
          {/* Generator Input */}
          <div className="flex gap-2">
            <input 
              value={genTopic}
              onChange={(e) => setGenTopic(e.target.value)}
              placeholder="Generate Lesson (e.g. RNA-Seq)..."
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
                <button
                key={mod.id}
                onClick={() => setActiveModule(mod)}
                className={`w-full text-left p-3 rounded-lg border transition-all group ${
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
                </div>
                <div className="text-sm font-medium truncate group-hover:text-txt-primary">{mod.title}</div>
                <div className="text-[10px] text-txt-muted mt-1 flex items-center gap-1">
                    <PlayCircle size={10} /> {mod.duration}
                </div>
                </button>
            );
          })}
        </div>
      </div>

      {/* MAIN: Reader Panel */}
      <div className="flex-1 pro-panel bg-page overflow-y-auto border border-border relative shadow-none custom-scrollbar">
        <div className="max-w-4xl mx-auto p-10">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-txt-muted font-mono mb-6 uppercase tracking-widest">
            <span>Tutorials</span> 
            <ChevronRight size={12}/> 
            <span className="text-brand">{activeModule.type}</span>
            <ChevronRight size={12}/> 
            <span>{activeModule.id}</span>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl font-bold text-txt-primary mb-8 leading-tight border-b border-border pb-6">
            {activeModule.title}
          </h1>
          
          {/* Content Rendering */}
          <div className="prose prose-invert prose-lg max-w-none text-txt-secondary leading-relaxed">
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom Image Renderer for Screenshots
                    img: ({node, ...props}) => (
                        <div className="my-8 border border-border rounded-xl overflow-hidden bg-black shadow-lg">
                            <div className="bg-input/50 px-4 py-2 border-b border-border flex items-center gap-2 text-xs text-txt-muted">
                                <ImageIcon size={14} /> Figure
                            </div>
                            <img {...props} className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity" />
                        </div>
                    ),
                    h2: ({children}) => <h2 className="text-2xl font-bold text-txt-primary mt-12 mb-4 flex items-center gap-2"><span className="w-2 h-8 bg-brand rounded-full inline-block"></span>{children}</h2>,
                    h3: ({children}) => <h3 className="text-xl font-bold text-txt-primary mt-8 mb-3">{children}</h3>,
                    code: ({children}) => <code className="bg-input text-brand-light px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
                    pre: ({children}) => <pre className="bg-[#0d1117] p-4 rounded-lg border border-border overflow-x-auto my-4 text-sm">{children}</pre>,
                    table: ({children}) => <div className="overflow-x-auto my-6 rounded-lg border border-border"><table className="w-full text-sm text-left bg-panel">{children}</table></div>,
                    thead: ({children}) => <thead className="bg-input text-txt-primary uppercase font-bold text-xs">{children}</thead>,
                    th: ({children}) => <th className="px-4 py-3 border-b border-border whitespace-nowrap">{children}</th>,
                    td: ({children}) => <td className="px-4 py-3 border-b border-border/50">{children}</td>,
                }}
            >
                {activeModule.content}
            </ReactMarkdown>
          </div>

          {/* Footer Action */}
          <div className="mt-16 pt-8 border-t border-border flex justify-between items-center bg-panel/30 p-6 rounded-xl">
            <div>
                <p className="text-txt-primary font-bold">Finished reading?</p>
                <p className="text-sm text-txt-muted">Mark as complete to earn XP.</p>
            </div>
            <button 
                onClick={markComplete}
                disabled={completed.includes(activeModule.id)}
                className={`pro-btn flex items-center gap-2 px-8 py-3 ${completed.includes(activeModule.id) ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {completed.includes(activeModule.id) ? (
                  <><CheckCircle size={18} /> Completed</>
              ) : (
                  <>Mark Complete <ChevronRight size={18} /></>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}