import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, ChevronRight, Check, X, Sparkles, Loader, BrainCircuit, Trash2 } from 'lucide-react';
import { useAiGenerator } from '../hooks/useAiGenerator';
import { useFirebase } from '../hooks/useFirebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const DEFAULT_QUIZ = { "Genomics": [{ q: "Start codon?", options: ["AUG", "UAA", "UAG"], ans: "AUG", reason: "Standard start." }] };

export default function QuizInterface() {
  const { generateContent, isGenerating } = useAiGenerator();
  const { user, db, profile } = useFirebase();
  
  // Load Quizzes (Hybrid: Local default + Cloud User Data)
  const [quizData, setQuizData] = useState(DEFAULT_QUIZ);

  useEffect(() => {
    const loadUserQuizzes = async () => {
        if (!user) return;
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().customQuizzes) {
            setQuizData({ ...DEFAULT_QUIZ, ...snap.data().customQuizzes });
        }
    };
    loadUserQuizzes();
  }, [user, db]);

  const [category, setCategory] = useState(null);
  const [customTopic, setCustomTopic] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleGenerate = async () => {
    if (!customTopic.trim()) return;
    const questions = await generateContent(customTopic, 'quiz');
    if (questions) {
      const newQuizzes = { ...quizData, [customTopic]: questions };
      setQuizData(newQuizzes);
      setCategory(customTopic);
      setCustomTopic("");
      
      // Save to Cloud
      if (user) {
          await setDoc(doc(db, 'users', user.uid), { 
              customQuizzes: newQuizzes 
          }, { merge: true });
      }
    }
  };

  const deleteQuiz = async (cat, e) => {
    e.stopPropagation();
    const newData = { ...quizData };
    delete newData[cat];
    setQuizData(newData);
    if (user) {
        await updateDoc(doc(db, 'users', user.uid), { customQuizzes: newData });
    }
  };

  const handleAnswer = (opt) => {
    if (selectedOption) return;
    setSelectedOption(opt);
    const correct = opt === quizData[category][currentQ].ans;
    setIsCorrect(correct);
    if(correct) setScore(s => s+1);
  };

  const nextQuestion = () => {
    if (currentQ + 1 < quizData[category].length) {
      setCurrentQ(q => q + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
      setShowResult(true);
      // GAMIFICATION: Award XP if score > 50%
      const percentage = score / quizData[category].length;
      if (user && percentage > 0.5) {
          const xpGain = 50;
          const currentXP = profile?.xp || 0;
          await updateDoc(doc(db, 'users', user.uid), {
              xp: currentXP + xpGain
          });
          // You could show a toast/confetti here!
      }
  };

  const resetQuiz = () => {
    setCategory(null); setCurrentQ(0); setScore(0); setShowResult(false); setSelectedOption(null); setIsCorrect(null);
  };

  if (!category) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
        <div className="flex justify-between items-end border-b border-border pb-6">
          <div>
            <h2 className="text-3xl font-bold text-txt-primary flex items-center gap-2"><BrainCircuit className="text-brand"/> Assessment Center</h2>
            <p className="text-txt-secondary mt-1">Select a topic or generate a custom exam using AI.</p>
          </div>
        </div>

        <div className="pro-panel p-6 bg-input/10 border-dashed border-2 border-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand/10 rounded-full"><Sparkles className="text-brand" size={24}/></div>
            <div>
              <h3 className="font-bold text-txt-primary">AI Exam Generator</h3>
              <p className="text-sm text-txt-secondary">Create a unique quiz on any biological topic.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input 
              value={customTopic} onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. 'CRISPR Cas9'..." className="pro-input bg-page w-full md:w-64"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button onClick={handleGenerate} disabled={isGenerating} className="pro-btn w-32 flex justify-center items-center gap-2">
              {isGenerating ? <Loader className="animate-spin" size={16}/> : 'Generate'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(quizData).map(cat => (
            <div key={cat} onClick={() => setCategory(cat)} className="pro-panel bg-panel p-6 hover:border-brand hover:bg-brand/5 transition-all cursor-pointer group relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-1 rounded uppercase">Exam</span>
                {/* Only show delete for custom quizzes (not hardcoded ones if you want to protect defaults) */}
                <button onClick={(e) => deleteQuiz(cat, e)} className="text-txt-muted hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
              </div>
              <h3 className="text-lg font-bold text-txt-primary mb-1">{cat}</h3>
              <p className="text-sm text-txt-secondary">{quizData[cat].length} Questions • Multiple Choice</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / quizData[category].length) * 100);
    return (
      <div className="max-w-lg mx-auto text-center space-y-8 animate-fadeIn pt-10">
        <div className="inline-block p-6 bg-brand/10 rounded-full mb-4 border border-brand/20"><Trophy size={48} className="text-brand" /></div>
        <div>
          <h2 className="text-4xl font-bold text-txt-primary mb-2">Assessment Complete</h2>
          <p className="text-txt-secondary">Topic: <span className="text-brand">{category}</span></p>
        </div>
        <div className="pro-panel p-8 bg-panel border-brand/20">
          <div className="text-6xl font-bold text-txt-primary mb-2">{percentage}%</div>
          <p className="text-txt-muted font-mono">Score: {score} / {quizData[category].length}</p>
          {percentage > 50 && <div className="mt-4 text-sm font-bold text-brand">+50 XP Earned!</div>}
        </div>
        <button onClick={resetQuiz} className="pro-btn w-full py-3 flex items-center justify-center gap-2"><RefreshCw size={18} /> Return to Dashboard</button>
      </div>
    );
  }

  const q = quizData[category][currentQ];
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center text-xs font-bold text-txt-muted uppercase tracking-wider border-b border-border pb-4">
        <span>Topic: {category}</span>
        <span>Question {currentQ + 1} of {quizData[category].length}</span>
      </div>
      <div className="pro-panel p-8 bg-panel">
        <h2 className="text-xl font-bold text-txt-primary leading-relaxed mb-8">{q.q}</h2>
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let style = "bg-page border-border hover:border-brand text-txt-secondary";
            if (selectedOption) {
              if (opt === q.ans) style = "bg-green-500/10 border-green-500 text-green-400";
              else if (opt === selectedOption) style = "bg-red-500/10 border-red-500 text-red-400";
              else style = "opacity-30 grayscale";
            }
            return (
              <button key={i} onClick={() => handleAnswer(opt)} disabled={!!selectedOption} className={`w-full p-4 rounded-xl border text-left font-medium transition-all flex justify-between items-center ${style}`}>
                {opt}
                {selectedOption && opt === q.ans && <Check size={18} />}
                {selectedOption && opt === selectedOption && opt !== q.ans && <X size={18} />}
              </button>
            )
          })}
        </div>
      </div>
      {selectedOption && (
        <div className="animate-fadeIn p-4 bg-brand/5 border border-brand/20 rounded-xl flex justify-between items-center">
          <div className="text-sm text-txt-secondary"><span className="font-bold text-brand">Explanation:</span> {q.reason}</div>
          <button onClick={nextQuestion} className="pro-btn px-6 py-2 flex items-center gap-2">Next <ChevronRight size={16}/></button>
        </div>
      )}
    </div>
  );
}