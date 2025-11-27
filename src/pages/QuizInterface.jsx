import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, ChevronRight, Check, X, Sparkles, Loader, BrainCircuit, Save, Trash2 } from 'lucide-react';
import { useAiGenerator } from '../hooks/useAiGenerator';

// Default static fallback
const STATIC_QUIZZES = {
  "Genomics": [{ q: "Start codon?", options: ["AUG", "UAA", "UAG"], ans: "AUG", reason: "Standard start." }]
};

export default function QuizInterface() {
  const { generateContent, isGenerating } = useAiGenerator();
  
  // 1. LOAD/SAVE from LocalStorage
  const [quizData, setQuizData] = useState(() => {
    const saved = localStorage.getItem('bioQuizzes');
    return saved ? JSON.parse(saved) : STATIC_QUIZZES;
  });

  useEffect(() => {
    localStorage.setItem('bioQuizzes', JSON.stringify(quizData));
  }, [quizData]);
  
  const [category, setCategory] = useState(null);
  const [customTopic, setCustomTopic] = useState("");
  
  // Preview State (The "Staging Area")
  const [previewData, setPreviewData] = useState(null);

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleGenerate = async () => {
    if (!customTopic.trim()) return;
    const questions = await generateContent(customTopic, 'quiz');
    if (questions) {
      // Don't save yet! Just preview.
      setPreviewData({ topic: customTopic, questions });
      setCustomTopic("");
    }
  };

  const confirmSave = () => {
    setQuizData(prev => ({ ...prev, [previewData.topic]: previewData.questions }));
    setCategory(previewData.topic);
    setPreviewData(null);
  };

  const discardGen = () => {
    setPreviewData(null);
  };

  const deleteQuiz = (topic, e) => {
    e.stopPropagation();
    if (confirm(`Delete quiz: ${topic}?`)) {
      const newData = { ...quizData };
      delete newData[topic];
      setQuizData(newData);
    }
  };

  // ... [Standard Quiz Logic Helpers: handleAnswer, nextQuestion, resetQuiz] ...
  const handleAnswer = (option) => {
    if (selectedOption) return;
    setSelectedOption(option);
    const currentQuiz = quizData[category];
    const correct = option === currentQuiz[currentQ].ans;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    const currentQuiz = quizData[category];
    if (currentQ + 1 < currentQuiz.length) {
      setCurrentQ(currentQ + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCategory(null);
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  // --- 1. REVIEW MODE SCREEN ---
  if (previewData) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <div className="pro-panel p-8 border-brand/50 bg-brand/5">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
                <Sparkles className="text-brand" /> Review AI Quiz
              </h2>
              <p className="text-txt-secondary">Topic: <span className="text-brand font-bold">{previewData.topic}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={discardGen} className="pro-btn bg-panel hover:bg-red-500/10 hover:text-red-400 border border-border text-txt-muted">
                Discard
              </button>
              <button onClick={confirmSave} className="pro-btn flex items-center gap-2">
                <Save size={18} /> Save to Library
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {previewData.questions.map((q, idx) => (
              <div key={idx} className="p-4 bg-page rounded-xl border border-border">
                <p className="font-bold text-txt-primary mb-2">Q{idx+1}: {q.q}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {q.options.map(opt => (
                    <div key={opt} className={`px-3 py-1 rounded border ${opt === q.ans ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-border text-txt-muted'}`}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- 2. MENU SCREEN ---
  if (!category) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
        <div className="text-center space-y-4 border-b border-border pb-8">
          <h2 className="text-3xl font-bold text-txt-primary">Assessment Center</h2>
          <p className="text-txt-secondary">Select a standard topic or generate a custom exam.</p>
        </div>

        {/* Generator */}
        <div className="pro-panel p-8 bg-gradient-to-r from-brand/5 to-transparent border-brand/20">
          <h3 className="font-bold text-txt-primary mb-4 flex items-center gap-2"><Sparkles className="text-brand"/> AI Exam Generator</h3>
          <div className="flex gap-4">
            <input 
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. 'Advanced Proteomics' or 'CRISPR Cas9'" 
              className="pro-input bg-page flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button onClick={handleGenerate} disabled={isGenerating} className="pro-btn w-48 flex justify-center items-center gap-2">
              {isGenerating ? <><Loader className="animate-spin" size={18}/> Generating...</> : 'Create Exam'}
            </button>
          </div>
        </div>

        {/* Existing Quizzes */}
        <div className="grid md:grid-cols-2 gap-4">
          {Object.keys(quizData).map(cat => (
            <div key={cat} onClick={() => setCategory(cat)} className="pro-panel bg-panel p-6 hover:border-brand transition-all cursor-pointer group relative">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-bold text-txt-primary group-hover:text-brand">{cat}</h3>
                <BrainCircuit className="text-txt-muted group-hover:text-brand transition-colors" />
              </div>
              <p className="text-sm text-txt-secondary">{quizData[cat].length} Questions</p>
              
              {/* Delete Button */}
              <button 
                onClick={(e) => deleteQuiz(cat, e)}
                className="absolute top-4 right-4 p-2 text-txt-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- 3. RESULT SCREEN ---
  if (showResult) {
    const percentage = Math.round((score / quizData[category].length) * 100);
    return (
      <div className="max-w-xl mx-auto text-center space-y-8 animate-fadeIn pt-10">
        <div className="inline-block p-6 bg-brand/10 rounded-full mb-4"><Trophy size={64} className="text-brand" /></div>
        <div>
          <h2 className="text-4xl font-bold text-txt-primary mb-2">Assessment Complete</h2>
          <p className="text-txt-secondary">Topic: <span className="text-brand">{category}</span></p>
        </div>
        <div className="pro-panel p-8 bg-page">
          <div className="text-6xl font-bold text-txt-primary mb-2">{percentage}%</div>
          <p className="text-txt-muted">Score: {score} / {quizData[category].length}</p>
        </div>
        <button onClick={resetQuiz} className="pro-btn w-full py-4 text-lg flex items-center justify-center gap-2"><RefreshCw size={20} /> Return to Menu</button>
      </div>
    );
  }

  // --- 4. QUESTION SCREEN ---
  const question = quizData[category][currentQ];
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center text-sm font-bold text-txt-muted uppercase tracking-wider border-b border-border pb-4">
        <span>{category}</span>
        <span>Q {currentQ + 1} / {quizData[category].length}</span>
      </div>
      <div className="pro-panel p-8 bg-panel">
        <h2 className="text-2xl font-bold text-txt-primary leading-tight mb-8">{question.q}</h2>
        <div className="space-y-3">
          {question.options.map((opt, i) => {
            let stateClass = "bg-page border-border hover:bg-brand/10 hover:border-brand";
            if (selectedOption) {
              if (opt === question.ans) stateClass = "bg-green-500/20 border-green-500 text-green-200";
              else if (opt === selectedOption) stateClass = "bg-red-500/20 border-red-500 text-red-200";
              else stateClass = "opacity-30 cursor-not-allowed";
            }
            return (
              <button key={i} onClick={() => handleAnswer(opt)} disabled={!!selectedOption} className={`w-full p-4 rounded-xl border text-left font-medium transition-all flex justify-between items-center ${stateClass}`}>
                {opt}
                {selectedOption && opt === question.ans && <Check size={20} className="text-green-500" />}
                {selectedOption && opt === selectedOption && opt !== question.ans && <X size={20} className="text-red-500" />}
              </button>
            )
          })}
        </div>
      </div>
      {selectedOption && (
        <div className="animate-fadeIn p-4 bg-brand/5 border border-brand/20 rounded-xl">
          <div className="text-sm text-txt-primary mb-4">
            <span className="font-bold text-brand uppercase text-xs">Explanation:</span> {question.reason || "No explanation provided."}
          </div>
          <button onClick={nextQuestion} className="pro-btn w-full py-3 flex items-center justify-center gap-2">Next Question <ChevronRight size={18} /></button>
        </div>
      )}
    </div>
  );
}