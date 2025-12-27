import React, { useState, useMemo } from 'react';
import { Calculator, Dna, FileCode, Thermometer, BarChart2 } from 'lucide-react';

export default function BioTools() {
  const [seq, setSeq] = useState("");
  const [activeTab, setActiveTab] = useState("stats");

  // OPTIMIZATION: Only clean sequence when input changes
  const cleanSeq = useMemo(() => seq.toUpperCase().replace(/[^ATCG]/g, ""), [seq]);

  // OPTIMIZATION: Wrap heavy math in useMemo
  const stats = useMemo(() => {
    if (!cleanSeq) return null;
    
    let a = 0, t = 0, c = 0, g = 0;
    for (let i = 0; i < cleanSeq.length; i++) {
      const char = cleanSeq[i];
      if (char === 'A') a++;
      else if (char === 'T') t++;
      else if (char === 'C') c++;
      else if (char === 'G') g++;
    }
    
    const gc = ((g + c) / cleanSeq.length * 100).toFixed(2);
    
    return {
      length: cleanSeq.length,
      gc,
      counts: { a, t, c, g },
      mw: (cleanSeq.length * 307.97).toFixed(2) + " Da" 
    };
  }, [cleanSeq]);

  const translation = useMemo(() => {
    if (!cleanSeq) return null;
    const codonMap = {
      'ATA':'I', 'ATC':'I', 'ATT':'I', 'ATG':'M', 'ACA':'T', 'ACC':'T', 'ACG':'T', 'ACT':'T',
      'AAC':'N', 'AAT':'N', 'AAA':'K', 'AAG':'K', 'AGC':'S', 'AGT':'S', 'AGA':'R', 'AGG':'R',                 
      'CTA':'L', 'CTC':'L', 'CTG':'L', 'CTT':'L', 'CCA':'P', 'CCC':'P', 'CCG':'P', 'CCT':'P',
      'CAC':'H', 'CAT':'H', 'CAA':'Q', 'CAG':'Q', 'CGA':'R', 'CGC':'R', 'CGG':'R', 'CGT':'R',
      'GTA':'V', 'GTC':'V', 'GTG':'V', 'GTT':'V', 'GCA':'A', 'GCC':'A', 'GCG':'A', 'GCT':'A',
      'GAC':'D', 'GAT':'D', 'GAA':'E', 'GAG':'E', 'GGA':'G', 'GGC':'G', 'GGG':'G', 'GGT':'G',
      'TCA':'S', 'TCC':'S', 'TCG':'S', 'TCT':'S', 'TTC':'F', 'TTT':'F', 'TTA':'L', 'TTG':'L',
      'TAC':'Y', 'TAT':'Y', 'TAA':'_', 'TAG':'_', 'TGC':'C', 'TGT':'C', 'TGA':'_', 'TGG':'W',
    };
    let protein = "";
    for (let i = 0; i < cleanSeq.length; i += 3) {
      if (i+3 > cleanSeq.length) break;
      const codon = cleanSeq.substring(i, i+3);
      protein += codonMap[codon] || "?";
    }
    return protein;
  }, [cleanSeq]);

  const tm = useMemo(() => {
    if (!cleanSeq) return null;
    const { a, t, c, g } = stats.counts;
    if (cleanSeq.length < 14) return 2 * (a + t) + 4 * (g + c);
    return (64.9 + 41 * (g + c - 16.4) / (a + t + g + c)).toFixed(1);
  }, [stats, cleanSeq]);

  return (
    <div className="space-y-6 animate-fadeIn h-[calc(100vh-100px)] flex flex-col max-w-6xl mx-auto">
      {/* HEADER ID */}
      <div id="tools-header" className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
            <Calculator className="text-brand" /> Sequence Analysis Suite
          </h2>
          <p className="text-sm text-txt-secondary mt-1">Multi-modal analysis for raw nucleotide inputs.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* INPUT ID */}
        <div id="tools-input-area" className="pro-panel p-4 flex flex-col h-full bg-panel border-r-0 lg:border-r border-border">
          <label className="text-xs font-bold text-txt-muted uppercase tracking-wider mb-2">Raw FASTA / Sequence</label>
          <textarea 
            value={seq}
            onChange={(e) => setSeq(e.target.value)}
            className="flex-1 bg-page border border-border rounded-lg p-4 font-mono text-sm text-txt-primary focus:ring-2 focus:ring-brand outline-none resize-none custom-scrollbar uppercase"
            placeholder=">Seq1&#10;ATGCGT..."
          />
          <div className="mt-4 flex justify-between text-xs text-txt-muted font-mono">
            <span>Length: {stats ? stats.length : 0} bp</span>
            <span>{stats ? 'Valid DNA' : 'Waiting...'}</span>
          </div>
        </div>

        <div className="lg:col-span-2 pro-panel flex flex-col overflow-hidden bg-panel">
          {/* TABS ID */}
          <div id="tools-tabs" className="flex border-b border-border bg-input/20">
            <ToolTab id="stats" label="Overview" icon={<BarChart2 size={16}/>} active={activeTab} onClick={setActiveTab} />
            <ToolTab id="trans" label="Translation" icon={<FileCode size={16}/>} active={activeTab} onClick={setActiveTab} />
            <ToolTab id="tm" label="Melting Temp" icon={<Thermometer size={16}/>} active={activeTab} onClick={setActiveTab} />
          </div>

          {/* RESULTS ID */}
          <div id="tools-results-area" className="p-6 flex-1 overflow-y-auto bg-page/30">
            {!stats ? (
              <div className="h-full flex flex-col items-center justify-center text-txt-muted opacity-50">
                <Dna size={48} className="mb-4" />
                <p>Input sequence to generate analytics.</p>
              </div>
            ) : (
              <>
                {activeTab === 'stats' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <StatBox label="GC Content" value={`${stats.gc}%`} />
                      <StatBox label="Molecular Weight" value={stats.mw} />
                      <StatBox label="Length" value={`${stats.length} bp`} />
                    </div>
                    <div className="p-6 bg-panel border border-border rounded-xl">
                      <h3 className="text-sm font-bold text-txt-secondary mb-4 uppercase tracking-wider">Nucleotide Distribution</h3>
                      <div className="space-y-3">
                        <Bar label="Adenine (A)" count={stats.counts.a} total={stats.length} color="bg-green-500" />
                        <Bar label="Thymine (T)" count={stats.counts.t} total={stats.length} color="bg-red-500" />
                        <Bar label="Cytosine (C)" count={stats.counts.c} total={stats.length} color="bg-blue-500" />
                        <Bar label="Guanine (G)" count={stats.counts.g} total={stats.length} color="bg-yellow-500" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'trans' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-page border border-border rounded-lg font-mono text-sm break-all leading-relaxed text-brand-light">
                      {translation}
                    </div>
                  </div>
                )}
                
                {activeTab === 'tm' && (
                  <div className="flex items-center justify-center h-full">
                     <div className="text-center">
                        <div className="text-6xl font-bold text-brand mb-2">{tm}°C</div>
                        <p className="text-txt-secondary">Estimated Melting Temperature</p>
                     </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Bar({ label, count, total, color }) {
  const percent = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  return (
    <div className="flex items-center gap-4 text-xs font-medium">
      <div className="w-24 text-txt-secondary">{label}</div>
      <div className="flex-1 h-3 bg-input rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
      <div className="w-12 text-right text-txt-primary">{count}</div>
      <div className="w-12 text-right text-txt-muted">{percent}%</div>
    </div>
  );
}

function ToolTab({ id, label, icon, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors border-b-2 ${
        active === id ? 'border-brand text-brand bg-page' : 'border-transparent text-txt-secondary hover:text-txt-primary'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="p-4 bg-panel border border-border rounded-lg">
      <div className="text-xs text-txt-muted uppercase font-bold mb-1">{label}</div>
      <div className="text-xl font-mono text-txt-primary">{value}</div>
    </div>
  );
}