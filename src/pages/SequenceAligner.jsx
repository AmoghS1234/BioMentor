import React, { useState } from 'react';
import { GitMerge, Play, AlignCenter } from 'lucide-react';

export default function SequenceAligner() {
  const [seq1, setSeq1] = useState("GAATTC");
  const [seq2, setSeq2] = useState("GATTA");
  const [matchScore, setMatchScore] = useState(1);
  const [mismatchScore, setMismatchScore] = useState(-1);
  const [gapPenalty, setGapPenalty] = useState(-2);
  const [result, setResult] = useState(null);

  const runAlignment = () => {
    const s1 = seq1.toUpperCase();
    const s2 = seq2.toUpperCase();
    const n = s1.length;
    const m = s2.length;

    const scoreMatrix = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));
    const pathMatrix = Array(n + 1).fill(null).map(() => Array(m + 1).fill(null));

    for (let i = 0; i <= n; i++) scoreMatrix[i][0] = i * gapPenalty;
    for (let j = 0; j <= m; j++) scoreMatrix[0][j] = j * gapPenalty;

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const match = scoreMatrix[i - 1][j - 1] + (s1[i - 1] === s2[j - 1] ? matchScore : mismatchScore);
        const deleteGap = scoreMatrix[i - 1][j] + gapPenalty;
        const insertGap = scoreMatrix[i][j - 1] + gapPenalty;
        scoreMatrix[i][j] = Math.max(match, deleteGap, insertGap);
        if (scoreMatrix[i][j] === match) pathMatrix[i][j] = 'diag';
        else if (scoreMatrix[i][j] === deleteGap) pathMatrix[i][j] = 'up';
        else pathMatrix[i][j] = 'left';
      }
    }

    let align1 = "";
    let align2 = "";
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && pathMatrix[i][j] === 'diag') {
        align1 = s1[i - 1] + align1;
        align2 = s2[j - 1] + align2;
        i--; j--;
      } else if (i > 0 && pathMatrix[i][j] === 'up') {
        align1 = s1[i - 1] + align1;
        align2 = "-" + align2;
        i--;
      } else {
        align1 = "-" + align1;
        align2 = s2[j - 1] + align2;
        j--;
      }
    }

    let symbolLine = "";
    let matches = 0;
    for(let k=0; k<align1.length; k++){
        if(align1[k] === align2[k]) {
            matches++;
            symbolLine += "|";
        } else if (align1[k] === '-' || align2[k] === '-') {
            symbolLine += " ";
        } else {
            symbolLine += ".";
        }
    }
    const identity = ((matches / align1.length) * 100).toFixed(1);

    setResult({ align1, align2, symbolLine, score: scoreMatrix[n][m], identity });
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
            <GitMerge size={24} className="text-brand" /> Global Alignment
          </h2>
          <p className="text-sm text-txt-secondary font-mono mt-1">Algorithm: Needleman-Wunsch (O(nm))</p>
        </div>
        <div className="flex gap-4 text-xs text-txt-muted">
          <div className="flex flex-col items-end">
            <span>Match: <strong className="text-green-400">+{matchScore}</strong></span>
            <span>Mismatch: <strong className="text-red-400">{mismatchScore}</strong></span>
          </div>
          <div className="flex flex-col items-end">
            <span>Gap: <strong className="text-orange-400">{gapPenalty}</strong></span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4 lg:col-span-1">
          <div className="pro-panel p-4 space-y-4 bg-panel">
            <div>
              <label className="text-xs font-bold text-txt-muted uppercase tracking-wider">Sequence A (5'→3')</label>
              <textarea value={seq1} onChange={(e) => setSeq1(e.target.value.toUpperCase())} className="pro-input font-mono text-sm h-32 mt-2 resize-none uppercase" placeholder="Enter sequence..." />
            </div>
            <div>
              <label className="text-xs font-bold text-txt-muted uppercase tracking-wider">Sequence B (5'→3')</label>
              <textarea value={seq2} onChange={(e) => setSeq2(e.target.value.toUpperCase())} className="pro-input font-mono text-sm h-32 mt-2 resize-none uppercase" placeholder="Enter sequence..." />
            </div>
            <button onClick={runAlignment} className="pro-btn w-full flex justify-center items-center gap-2 py-3">
              <Play size={16} /> Run Alignment
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <div className="pro-panel h-full flex flex-col">
              <div className="bg-input/30 p-4 border-b border-border flex justify-between items-center">
                <span className="text-xs font-bold text-txt-muted uppercase">Alignment Result</span>
                <div className="flex gap-4 text-sm font-mono">
                  <span className="text-txt-primary">Score: <span className="text-brand">{result.score}</span></span>
                  <span className="text-txt-primary">Identity: <span className="text-brand">{result.identity}%</span></span>
                </div>
              </div>
              <div className="p-6 overflow-x-auto custom-scrollbar flex-1 bg-page/50">
                <div className="font-mono text-lg leading-relaxed whitespace-pre tracking-[0.2em]">
                  <div className="text-txt-primary flex"><span className="w-8 text-xs text-txt-muted select-none py-1">Seq1</span>{result.align1}</div>
                  <div className="text-brand font-bold flex"><span className="w-8 select-none"></span>{result.symbolLine}</div>
                  <div className="text-txt-primary flex"><span className="w-8 text-xs text-txt-muted select-none py-1">Seq2</span>{result.align2}</div>
                </div>
              </div>
              <div className="p-4 border-t border-border bg-input/10 text-xs text-txt-muted">
                <strong>Legend:</strong> <span className="text-brand">|</span> Match &nbsp; <span className="text-brand">.</span> Mismatch &nbsp; <span className="text-brand">-</span> Gap
              </div>
            </div>
          ) : (
            <div className="pro-panel h-full flex flex-col items-center justify-center text-txt-muted p-12 border-dashed border-2 border-border">
              <AlignCenter size={48} className="mb-4 opacity-20" />
              <p>Enter sequences and execute alignment to visualize homologies.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}