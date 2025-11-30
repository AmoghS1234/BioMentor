import React, { useState } from 'react';
import { Code, Play, Terminal, Sparkles, Loader, Plus } from 'lucide-react';
import { useAiGenerator } from '../hooks/useAiGenerator';

const DEFAULT_CHALLENGES = [
  { id: 1, title: "DNA Transcription", desc: "Write a function to transcribe DNA to RNA.", input: "GATGGAACTTGACTACGTAA", expected: "GAUGGAACUUGACUACGUAA", level: "Easy" },
];

export default function ProblemSolver() {
  const { generateContent, isGenerating } = useAiGenerator();
  const [challenges, setChallenges] = useState(DEFAULT_CHALLENGES);
  const [activeId, setActiveId] = useState(1);
  const [userOutput, setUserOutput] = useState('');
  const [logs, setLogs] = useState([]);
  const [genTopic, setGenTopic] = useState('');

  const activeChallenge = challenges.find(c => c.id === activeId);

  const handleGenerate = async () => {
    if (!genTopic.trim()) return;
    const newProblems = await generateContent(genTopic, 'problems');
    if (newProblems) {
      const nextId = Math.max(...challenges.map(c => c.id)) + 1;
      const processed = newProblems.map((p, i) => ({ ...p, id: nextId + i }));
      setChallenges([...challenges, ...processed]);
      setGenTopic('');
    }
  };

  const runCode = () => {
    const isCorrect = userOutput.trim().toUpperCase() === activeChallenge.expected;
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), type: isCorrect ? 'success' : 'error', msg: isCorrect ? 'Test Passed!' : `Failed. Expected: ${activeChallenge.expected}` }, ...prev]);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col animate-fadeIn">
      <div className="border-b border-border pb-4 mb-4 flex justify-between items-end">
        <h2 className="text-2xl font-bold text-txt-primary flex items-center gap-2"><Code className="text-brand" /> Code Lab</h2>
        <div className="flex gap-2">
          <input value={genTopic} onChange={e=>setGenTopic(e.target.value)} placeholder="Generate problems (e.g. 'RNA')..." className="pro-input py-1 px-2 text-xs w-64"/>
          <button onClick={handleGenerate} disabled={isGenerating} className="pro-btn py-1 px-3 text-xs">{isGenerating ? <Loader size={14} className="animate-spin"/> : <Plus size={14}/>}</button>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
        <div className="pro-panel bg-panel flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border font-bold text-sm text-txt-secondary uppercase">Challenges</div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {challenges.map(c => (
              <button key={c.id} onClick={() => setActiveId(c.id)} className={`w-full text-left p-3 rounded-lg text-sm flex justify-between items-center transition-all ${activeId === c.id ? 'bg-brand/10 border border-brand/50 text-brand' : 'text-txt-secondary hover:bg-input/30'}`}>
                <span className="truncate mr-2">{c.id}. {c.title}</span>
                <span className="text-[10px] bg-page px-1.5 py-0.5 rounded text-txt-muted border border-border">{c.level}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="pro-panel p-6 bg-panel border-l-4 border-l-brand">
            <h3 className="text-xl font-bold text-txt-primary mb-2">{activeChallenge.title}</h3>
            <p className="text-txt-secondary mb-4 font-light text-sm">{activeChallenge.desc}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-page border border-border rounded font-mono text-xs"><div className="text-brand uppercase font-bold mb-1">Input</div>{activeChallenge.input}</div>
              <div className="p-3 bg-page border border-border rounded font-mono text-xs"><div className="text-green-500 uppercase font-bold mb-1">Expected</div>{activeChallenge.expected}</div>
            </div>
          </div>

          <div className="flex-1 pro-panel bg-page border-border flex flex-col overflow-hidden">
            <div className="p-2 bg-input/20 border-b border-border flex justify-between items-center">
              <span className="text-xs font-bold text-txt-muted flex items-center gap-2 px-2"><Terminal size={14} /> CONSOLE</span>
              <button onClick={runCode} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-xs font-bold flex items-center gap-2"><Play size={12} /> RUN</button>
            </div>
            <div className="flex-1 flex flex-col lg:flex-row">
              <div className="flex-1 p-4 border-r border-border">
                <textarea value={userOutput} onChange={(e) => setUserOutput(e.target.value)} className="w-full h-full bg-transparent border-none font-mono text-sm text-green-400 focus:ring-0 resize-none placeholder-green-900" placeholder="// Type your output here..." />
              </div>
              <div className="flex-1 bg-black/20 p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
                {logs.map((log, i) => <div key={i} className={`mb-1 ${log.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{`> ${log.msg}`}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}