import React, { useState } from 'react';
import { Code, Play, Terminal } from 'lucide-react';

const CHALLENGES = [
  { id: 1, title: "DNA Transcription", desc: "Write a function to transcribe DNA to RNA by replacing 'T' with 'U'.", input: "GATGGAACTTGACTACGTAA", expected: "GAUGGAACUUGACUACGUAA", level: "Easy" },
  { id: 2, title: "Reverse Complement", desc: "Find the reverse complement of a DNA string.", input: "AAAACCCGGT", expected: "ACCGGGTTTT", level: "Medium" }
];

export default function ProblemSolver() {
  const [activeId, setActiveId] = useState(1);
  const [userOutput, setUserOutput] = useState('');
  const [logs, setLogs] = useState([]);

  const activeChallenge = CHALLENGES.find(c => c.id === activeId);

  const runCode = () => {
    const isCorrect = userOutput.trim().toUpperCase() === activeChallenge.expected;
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      { time: timestamp, type: isCorrect ? 'success' : 'error', msg: isCorrect ? 'Test Passed: Output matches expected.' : `Test Failed: Expected ${activeChallenge.expected}, got ${userOutput}` },
      ...prev
    ]);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col animate-fadeIn">
      <div className="border-b border-border pb-4 mb-4">
        <h2 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
          <Code className="text-brand" /> Computational Biology Lab
        </h2>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0">
        <div className="pro-panel bg-panel flex flex-col overflow-hidden">
          <div className="p-4 bg-input/20 border-b border-border font-bold text-sm text-txt-secondary uppercase">Curriculum</div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {CHALLENGES.map(c => (
              <button key={c.id} onClick={() => { setActiveId(c.id); setLogs([]); setUserOutput(''); }} className={`w-full text-left p-3 rounded-lg text-sm flex justify-between items-center transition-all ${activeId === c.id ? 'bg-brand/10 border border-brand/50 text-brand' : 'text-txt-secondary hover:bg-input/30'}`}>
                <span>{c.id}. {c.title}</span>
                <span className="text-xs bg-page px-2 py-1 rounded text-txt-muted">{c.level}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="pro-panel p-6 bg-panel">
            <h3 className="text-xl font-bold text-txt-primary mb-2">{activeChallenge.title}</h3>
            <p className="text-txt-secondary mb-4 font-light">{activeChallenge.desc}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-page border border-border rounded font-mono text-xs">
                <div className="text-brand uppercase font-bold mb-1">Input</div>
                {activeChallenge.input}
              </div>
              <div className="p-3 bg-page border border-border rounded font-mono text-xs">
                <div className="text-green-500 uppercase font-bold mb-1">Expected Output</div>
                {activeChallenge.expected}
              </div>
            </div>
          </div>

          <div className="flex-1 pro-panel bg-page border-border flex flex-col overflow-hidden">
            <div className="p-2 bg-input/20 border-b border-border flex justify-between items-center">
              <span className="text-xs font-bold text-txt-muted flex items-center gap-2 px-2"><Terminal size={14} /> OUTPUT CONSOLE</span>
              <button onClick={runCode} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-xs font-bold flex items-center gap-2 transition-colors"><Play size={12} /> RUN TEST</button>
            </div>
            
            <div className="flex-1 flex flex-col lg:flex-row">
              <div className="flex-1 p-4 border-r border-border">
                <label className="text-xs text-txt-muted mb-2 block">Your Output:</label>
                <textarea value={userOutput} onChange={(e) => setUserOutput(e.target.value)} className="w-full h-32 bg-input/20 border border-border rounded p-3 font-mono text-sm text-green-400 focus:ring-1 focus:ring-green-500 outline-none resize-none" placeholder="..." />
              </div>
              <div className="flex-1 bg-black/40 p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
                {logs.length === 0 && <span className="text-txt-muted italic">Ready to run...</span>}
                {logs.map((log, i) => (
                  <div key={i} className={`mb-2 flex gap-2 ${log.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="text-txt-muted">[{log.time}]</span>
                    <span>{log.type === 'success' ? '✔' : '✖'} {log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}