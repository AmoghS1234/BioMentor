import React, { useState, useEffect } from 'react';
import { Code, Play, Terminal, Sparkles, Loader, CheckCircle, XCircle, Eye, EyeOff, Trophy, Trash2 } from 'lucide-react';
import { useAiGenerator } from '../hooks/useAiGenerator';
import { useFirebase } from '../hooks/useFirebase';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';

const DEFAULT_CHALLENGES = [
  { 
    id: 1, 
    title: "DNA Transcription", 
    desc: "Transcribe the given DNA sequence to RNA. Remember: Thymine (T) is replaced by Uracil (U).", 
    input: "GATGGAACTTGACTACGTAA", 
    expected: "GAUGGAACUUGACUACGUAA", 
    level: "Easy",
    solutionCode: `def transcribe(dna):
  return dna.replace('T', 'U')`
  },
  { 
    id: 2, 
    title: "Reverse Complement", 
    desc: "Find the reverse complement of the DNA strand. (A↔T, C↔G, then reverse).", 
    input: "AAAACCCGGT", 
    expected: "ACCGGGTTTT", 
    level: "Medium",
    solutionCode: `def reverse_complement(dna):
  complement = {'A': 'T', 'C': 'G', 'G': 'C', 'T': 'A'}
  return "".join(complement[base] for base in reversed(dna))`
  },
];

export default function ProblemSolver() {
  const { generateContent, isGenerating } = useAiGenerator();
  const { user, db, isAuthReady } = useFirebase();
  
  const [challenges, setChallenges] = useState(DEFAULT_CHALLENGES);
  const [activeId, setActiveId] = useState(1);
  const [userOutput, setUserOutput] = useState('');
  const [logs, setLogs] = useState([]);
  const [genTopic, setGenTopic] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [completedIds, setCompletedIds] = useState([]);

  // 1. Load User Progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.solvedChallenges) setCompletedIds(data.solvedChallenges);
        if (data.customChallenges) setChallenges([...DEFAULT_CHALLENGES, ...data.customChallenges]);
      }
    };
    if (isAuthReady) loadProgress();
  }, [user, isAuthReady, db]);

  const activeChallenge = challenges.find(c => c.id === activeId) || challenges[0];

  // 2. AI Generation
  const handleGenerate = async () => {
    if (!genTopic.trim()) return;
    
    const newProblems = await generateContent(genTopic, 'coding_challenge');
    
    if (newProblems && Array.isArray(newProblems)) {
      const nextId = Math.max(...challenges.map(c => c.id)) + 1;
      const processed = newProblems.map((p, i) => ({ 
        ...p, 
        id: nextId + i,
        solutionCode: p.solutionCode || "// Code generation failed. Try creating a function that maps inputs to expected outputs."
      }));
      
      const updatedList = [...challenges, ...processed];
      setChallenges(updatedList);
      setGenTopic('');

      if (user) {
        await setDoc(doc(db, 'users', user.uid), { customChallenges: processed }, { merge: true });
      }
    }
  };

  // 3. Delete Challenge
  const deleteChallenge = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this challenge?")) return;

    // 1. Update Local State
    const updatedList = challenges.filter(c => c.id !== id);
    setChallenges(updatedList);

    // 2. Switch Active ID if we deleted the current one
    if (activeId === id) {
        setActiveId(updatedList.length > 0 ? updatedList[0].id : null);
    }

    // 3. Update Firestore (Persist deletion of custom challenges)
    if (user) {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data();
            const currentCustom = data.customChallenges || [];
            // Filter out the deleted ID from the saved custom list
            const newCustom = currentCustom.filter(c => c.id !== id);
            await updateDoc(ref, { customChallenges: newCustom });
        }
    }
  };

  // 4. Logic Runner
  const runCode = async () => {
    if (!activeChallenge) return;
    const cleanInput = userOutput.trim().toUpperCase();
    const cleanExpected = activeChallenge.expected.trim().toUpperCase();
    const isCorrect = cleanInput === cleanExpected;

    const timestamp = new Date().toLocaleTimeString();

    if (isCorrect) {
      setLogs(prev => [{ time: timestamp, type: 'success', msg: 'Test Passed! Output matches expected result.' }, ...prev]);
      
      if (user && !completedIds.includes(activeId)) {
        const newCompleted = [...completedIds, activeId];
        setCompletedIds(newCompleted);
        
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const currentXP = snap.data()?.xp || 0;

        await updateDoc(ref, { 
          solvedChallenges: arrayUnion(activeId),
          xp: currentXP + 25
        });
        setLogs(prev => [{ time: timestamp, type: 'xp', msg: '+25 XP Earned!' }, ...prev]);
      }
    } else {
      setLogs(prev => [{ time: timestamp, type: 'error', msg: `Failed. Expected: ${activeChallenge.expected.substring(0, 10)}...` }, ...prev]);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col animate-fadeIn w-full max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex-shrink-0 border-b border-border pb-4 mb-4 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
            <Code className="text-brand" /> Bioinformatics Logic Lab
          </h2>
          <p className="text-sm text-txt-secondary mt-1">
            Algorithm challenges. Solve locally, verify here.
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            value={genTopic} 
            onChange={e=>setGenTopic(e.target.value)} 
            placeholder="Generate Challenge..." 
            className="pro-input py-2 px-3 text-xs w-full md:w-64 bg-page border-border"
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating} 
            className="pro-btn py-2 px-4 text-xs flex items-center gap-2 whitespace-nowrap"
          >
            {isGenerating ? <Loader size={14} className="animate-spin"/> : <Sparkles size={14}/>}
            Generate
          </button>
        </div>
      </div>

      {/* WORKSPACE LAYOUT */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        
        {/* LEFT SIDEBAR: CHALLENGE LIST */}
        <div className="w-full md:w-80 flex-shrink-0 pro-panel bg-panel flex flex-col overflow-hidden border border-border shadow-sm">
          <div className="p-4 border-b border-border font-bold text-sm text-txt-secondary uppercase tracking-wider flex justify-between items-center bg-input/5">
            <span>Challenges</span>
            <span className="text-xs bg-brand/10 text-brand px-2 py-1 rounded-full">{completedIds.length}/{challenges.length} Solved</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {challenges.map(c => {
              const isSolved = completedIds.includes(c.id);
              const isActive = activeId === c.id;
              
              return (
                <div 
                  key={c.id} 
                  onClick={() => { setActiveId(c.id); setUserOutput(''); setLogs([]); setShowSolution(false); }} 
                  // UPDATED: Removed 'relative'
                  className={`w-full text-left p-3 rounded-lg text-sm flex justify-between items-center transition-all border cursor-pointer group ${
                    isActive
                    ? 'bg-brand/10 border-brand text-brand shadow-sm font-medium' 
                    : 'bg-transparent border-transparent text-txt-secondary hover:bg-input/50'
                  }`}
                >
                  {/* Left side: Icon and Title */}
                  <div className="flex items-center gap-2 truncate">
                    {isSolved ? <CheckCircle size={14} className="text-green-500 shrink-0"/> : <span className="w-3.5 h-3.5 rounded-full border border-txt-muted shrink-0"></span>}
                    <span className="truncate">{c.title}</span>
                  </div>
                  
                  {/* Right side: Badge and Delete Button container */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        c.level === 'Easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        c.level === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                        'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                        {c.level}
                    </span>

                    {/* DELETE BUTTON: Removed absolute positioning */}
                    <button 
                        onClick={(e) => deleteChallenge(e, c.id)}
                        className="p-1.5 text-txt-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        title="Delete Challenge"
                    >
                        <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER: EDITOR WORKSPACE */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          
          {/* TOP PANEL: DESCRIPTION */}
          {activeChallenge ? (
            <>
            <div className="flex-shrink-0 pro-panel p-6 bg-panel border-l-4 border-l-brand shadow-sm relative">
                <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
                    {activeChallenge.title}
                    {completedIds.includes(activeChallenge.id) && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1"><Trophy size={10}/> Solved</span>}
                    </h3>
                    <p className="text-txt-secondary mt-2 leading-relaxed max-w-2xl">{activeChallenge.desc}</p>
                </div>
                <button 
                    onClick={() => setShowSolution(!showSolution)}
                    className="text-xs flex items-center gap-1 text-txt-muted hover:text-brand transition-colors border border-border px-3 py-1.5 rounded-lg hover:bg-page bg-page/50"
                >
                    {showSolution ? <><EyeOff size={14}/> Hide Solution</> : <><Eye size={14}/> View Code Solution</>}
                </button>
                </div>

                {showSolution ? (
                <div className="bg-[#0d1117] p-4 rounded-lg border border-border overflow-x-auto animate-fadeIn max-h-40 custom-scrollbar">
                    <div className="text-xs font-bold text-txt-muted uppercase mb-2">Python / Pseudocode Reference</div>
                    <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">{activeChallenge.solutionCode}</pre>
                </div>
                ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-page border border-border rounded-xl font-mono text-xs relative group">
                    <div className="text-brand uppercase font-bold mb-1 text-[10px] tracking-wider">Input Sequence</div>
                    <div className="break-all text-txt-primary text-sm font-medium">{activeChallenge.input}</div>
                    <button 
                        onClick={() => navigator.clipboard.writeText(activeChallenge.input)}
                        className="absolute top-2 right-2 p-1 text-txt-muted hover:text-brand opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy"
                    >
                        <Code size={12} />
                    </button>
                    </div>
                    <div className="p-3 bg-page border border-border rounded-xl font-mono text-xs opacity-75">
                    <div className="text-green-500 uppercase font-bold mb-1 text-[10px] tracking-wider">Expected Output Format</div>
                    <div className="break-all text-txt-muted text-sm blur-[2px] select-none hover:blur-0 transition-all cursor-help" title="Hover to peek">
                        {activeChallenge.expected}
                    </div>
                    </div>
                </div>
                )}
            </div>

            {/* BOTTOM PANEL: TERMINAL */}
            <div className="flex-1 pro-panel bg-page border-border flex flex-col overflow-hidden shadow-lg relative min-h-[200px]">
                <div className="flex-shrink-0 p-2 bg-input/30 border-b border-border flex justify-between items-center backdrop-blur-sm">
                <span className="text-xs font-bold text-txt-muted flex items-center gap-2 px-2">
                    <Terminal size={14} className="text-brand" /> TERMINAL / OUTPUT VERIFICATION
                </span>
                <button 
                    onClick={runCode} 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-green-900/20 hover:shadow-green-900/40 transition-all transform active:scale-95"
                >
                    <Play size={12} /> VERIFY ANSWER
                </button>
                </div>
                
                <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
                <div className="flex-1 border-b lg:border-b-0 lg:border-r border-border relative h-1/2 lg:h-auto">
                    <textarea 
                    value={userOutput} 
                    onChange={(e) => setUserOutput(e.target.value)} 
                    className="w-full h-full bg-[#0d1117] border-none font-mono text-sm text-gray-300 focus:ring-0 resize-none p-4 leading-relaxed" 
                    placeholder="// 1. Solve the problem locally (Python, JS, etc.)&#10;// 2. Paste the result string here to verify..." 
                    spellCheck="false"
                    />
                </div>
                
                <div className="flex-1 bg-black/40 p-4 font-mono text-xs overflow-y-auto custom-scrollbar h-1/2 lg:h-auto">
                    {logs.length === 0 && <div className="text-txt-muted opacity-50 italic">Waiting for output...</div>}
                    {logs.map((log, i) => (
                    <div key={i} className={`mb-2 font-medium flex items-start gap-2 border-b border-white/5 pb-2 last:border-0 ${
                        log.type === 'success' ? 'text-green-400' : 
                        log.type === 'error' ? 'text-red-400' : 
                        'text-yellow-400'
                    }`}>
                        <span className="opacity-50 text-[10px] mt-0.5 min-w-[50px]">{log.time}</span>
                        <span className="break-words">
                        {log.type === 'success' && <CheckCircle size={10} className="inline mr-1"/>}
                        {log.type === 'error' && <XCircle size={10} className="inline mr-1"/>}
                        {log.type === 'xp' && <Trophy size={10} className="inline mr-1"/>}
                        {log.msg}
                        </span>
                    </div>
                    ))}
                </div>
                </div>
            </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-txt-muted italic border-2 border-dashed border-border rounded-xl">
                <p>No active challenge selected.</p>
                <p className="text-xs mt-2">Generate a new one or select from the list.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}