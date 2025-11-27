import React, { useState, useEffect } from 'react';
import * as $3Dmol from '3dmol/build/3Dmol.js';
import { Dna, Search, RefreshCw, Box, Layers } from 'lucide-react';

export default function ProteinViewer() {
  const [pdbId, setPdbId] = useState('1CRN');
  const [viewer, setViewer] = useState(null);
  const [style, setStyle] = useState('cartoon'); // cartoon, stick, sphere
  const [colorScheme, setColorScheme] = useState('spectrum'); // spectrum, chain

  useEffect(() => {
    // Initialize viewer on mount
    const element = document.getElementById('gldiv');
    if (!element) return;
    
    const config = { backgroundColor: '#18181b' }; // Match 'bg-panel'
    const v = $3Dmol.createViewer(element, config);
    setViewer(v);
    
    // Initial Load
    fetchPDB('1CRN', v);
    
    // Cleanup
    return () => {
      // 3Dmol doesn't have a strict destroy method, but we clear the div
      v.clear();
    };
  }, []);

  // Re-render when style changes
  useEffect(() => {
    if (viewer) {
      applyStyle(viewer);
      viewer.render();
    }
  }, [style, colorScheme]);

  const fetchPDB = async (id, vInstance) => {
    if (!id || !vInstance) return;
    try {
      const response = await fetch(`https://files.rcsb.org/view/${id}.pdb`);
      if (!response.ok) throw new Error("Protein not found");
      const pdbData = await response.text();
      
      vInstance.clear();
      vInstance.addModel(pdbData, "pdb");
      applyStyle(vInstance);
      vInstance.zoomTo();
      vInstance.render();
    } catch (err) {
      alert("Could not load PDB ID. Ensure it is a valid 4-character code (e.g. 4HHB).");
    }
  };

  const applyStyle = (v) => {
    const s = {};
    if (style === 'cartoon') s.cartoon = { color: colorScheme };
    if (style === 'stick') s.stick = { colorscheme: colorScheme === 'spectrum' ? 'greenCarbon' : 'chain' };
    if (style === 'sphere') s.sphere = { colorscheme: colorScheme === 'spectrum' ? 'greenCarbon' : 'chain' };
    
    v.setStyle({}, s);
  };

  const handleLoad = () => {
    if (viewer) fetchPDB(pdbId, viewer);
  };

  return (
    <div className="space-y-6 animate-fadeIn h-[calc(100vh-100px)] flex flex-col">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-border pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
            <Dna className="text-brand" /> 3D Macromolecule Viewer
          </h2>
          <p className="text-sm text-txt-secondary mt-1">Visualize crystal structures from the RCSB PDB.</p>
        </div>
        
        <div className="flex gap-2 items-end">
          <div className="space-y-1">
            <label className="text-xs font-bold text-txt-muted uppercase">PDB ID</label>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
                <input 
                  value={pdbId} 
                  onChange={(e) => setPdbId(e.target.value.toUpperCase())}
                  placeholder="e.g. 4HHB"
                  className="bg-panel border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-txt-primary w-32 focus:ring-1 focus:ring-brand outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleLoad()}
                />
              </div>
              <button onClick={handleLoad} className="pro-btn flex items-center gap-2">
                <RefreshCw size={16} /> Load
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Viewer Canvas */}
        <div className="lg:col-span-3 pro-panel bg-black overflow-hidden relative border-border/50">
          <div id="gldiv" className="w-full h-full cursor-move"></div>
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-2 rounded text-xs text-txt-secondary">
            Left Click: Rotate • Middle: Zoom • Right: Translate
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="pro-panel bg-panel p-4 flex flex-col gap-6 h-fit">
          
          <div>
            <h3 className="text-xs font-bold text-txt-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Box size={14} /> Visualization Style
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {['cartoon', 'stick', 'sphere'].map(s => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize text-left transition-colors ${
                    style === s 
                      ? 'bg-brand text-white' 
                      : 'bg-page text-txt-secondary hover:text-txt-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-txt-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers size={14} /> Coloring
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setColorScheme('spectrum')}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                  colorScheme === 'spectrum' ? 'bg-brand text-white' : 'bg-page text-txt-secondary'
                }`}
              >
                Spectrum (N → C Terminus)
              </button>
              <button
                onClick={() => setColorScheme('chain')}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                  colorScheme === 'chain' ? 'bg-brand text-white' : 'bg-page text-txt-secondary'
                }`}
              >
                By Chain ID
              </button>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-border">
            <p className="text-xs text-txt-muted leading-relaxed">
              <strong>Note:</strong> Loading large complexes (ribosomes, viruses) may affect performance.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}