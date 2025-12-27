import React, { useState, useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol/build/3Dmol.js';
import { Dna, Search, RefreshCw, Box, Layers, ZoomIn, ZoomOut } from 'lucide-react';

export default function ProteinViewer() {
  const [pdbId, setPdbId] = useState('1CRN');
  const [style, setStyle] = useState('cartoon');
  const [colorScheme, setColorScheme] = useState('spectrum');
  
  // Refs for direct DOM manipulation
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const isMounted = useRef(true);

  // Helper: Only render if component is alive
  const safeRender = () => {
    if (isMounted.current && viewerRef.current) {
      try {
        viewerRef.current.render();
      } catch (e) {
        // Silently fail if rendering happens during navigation
        console.debug("Skipped frame render during navigation");
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;

    if (!containerRef.current) return;

    // 1. Get Theme Color safely
    let themeColor = '#18181b';
    try {
        const computed = getComputedStyle(document.documentElement).getPropertyValue('--panel');
        if (computed) themeColor = computed.trim();
    } catch(e) {}

    // 2. Initialize Viewer
    const config = { 
        backgroundColor: themeColor,
        defaultcolors: $3Dmol.elementColors.defaultColors 
    };

    try {
        const v = $3Dmol.createViewer(containerRef.current, config);
        viewerRef.current = v;
        fetchPDB('1CRN', v);
    } catch (e) {
        console.error("Failed to init viewer", e);
    }

    // 3. Handle Resize (Prevents distortion)
    const handleResize = () => {
        if(viewerRef.current) {
            viewerRef.current.resize();
        }
    }
    window.addEventListener('resize', handleResize);

    // 4. ROBUST CLEANUP
    return () => {
      isMounted.current = false;
      window.removeEventListener('resize', handleResize);
      
      if (viewerRef.current) {
        try {
          // Attempt to clear, but catch the "OffscreenCanvas" crash
          viewerRef.current.clear(); 
        } catch (e) {
          console.warn("WebGL cleanup warning suppressed:", e);
        }
        viewerRef.current = null;
      }
    };
  }, []);

  // Update styles 
  useEffect(() => {
    if (viewerRef.current && isMounted.current) {
      applyStyle(viewerRef.current);
      safeRender();
    }
  }, [style, colorScheme]);

  const fetchPDB = async (id, vInstance) => {
    if (!id || !vInstance) return;
    
    try {
      const response = await fetch(`https://files.rcsb.org/view/${id}.pdb`);
      if (!response.ok) throw new Error("Protein not found");
      
      const pdbData = await response.text();
      
      if (!isMounted.current || !viewerRef.current) return;

      vInstance.clear();
      vInstance.addModel(pdbData, "pdb");
      applyStyle(vInstance);
      vInstance.zoomTo();
      safeRender();

    } catch (err) {
      if (isMounted.current) {
          console.error(err);
      }
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
    if (viewerRef.current) fetchPDB(pdbId, viewerRef.current);
  };

  const handleZoomIn = () => {
    if (viewerRef.current) {
      viewerRef.current.zoom(1.2);
      safeRender();
    }
  };

  const handleZoomOut = () => {
    if (viewerRef.current) {
      viewerRef.current.zoom(0.8);
      safeRender();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn h-[calc(100vh-120px)] flex flex-col">
      {/* Controls Header - ID Added for Tour */}
      <div id="viewer-header" className="flex flex-col md:flex-row justify-between items-end border-b border-border pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
            <Dna className="text-brand" /> 3D Macromolecule Viewer
          </h2>
          <p className="text-sm text-txt-secondary mt-1">Visualize crystal structures from the RCSB PDB.</p>
        </div>
        
        <div className="flex gap-2 items-end">
          {/* Input Area - ID Added for Tour */}
          <div id="pdb-input-area" className="space-y-1">
            <label className="text-xs font-bold text-txt-muted uppercase">PDB ID</label>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
                <input 
                  value={pdbId} 
                  onChange={(e) => setPdbId(e.target.value.toUpperCase())}
                  placeholder="e.g. 4HHB"
                  className="bg-panel border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-txt-primary w-32 focus:ring-1 focus:ring-brand outline-none transition-colors"
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
        
        {/* Viewer Canvas - ID Added for Tour */}
        <div id="viewer-canvas-container" className="lg:col-span-3 pro-panel bg-panel overflow-hidden relative border-border/50 flex flex-col">
          {/* Important: min-h ensures it doesn't collapse to 0 height during transition */}
          <div 
            ref={containerRef} 
            className="w-full h-full cursor-move relative z-0 min-h-[400px]"
          ></div>
          
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-2 rounded text-xs text-white/80 pointer-events-none z-10">
            Left Click: Rotate • Middle: Zoom • Right: Translate
          </div>

          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
            <button onClick={handleZoomIn} className="bg-black/60 backdrop-blur hover:bg-black/80 text-white p-2 rounded-lg transition-all border border-white/10">
              <ZoomIn size={20} />
            </button>
            <button onClick={handleZoomOut} className="bg-black/60 backdrop-blur hover:bg-black/80 text-white p-2 rounded-lg transition-all border border-white/10">
              <ZoomOut size={20} />
            </button>
          </div>
        </div>

        {/* Sidebar Controls - ID Added for Tour */}
        <div id="viewer-sidebar-controls" className="pro-panel bg-panel p-4 flex flex-col gap-6 h-fit transition-colors">
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
                    style === s ? 'bg-brand text-white shadow-md' : 'bg-page text-txt-secondary hover:text-txt-primary hover:bg-page/80'
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
                  colorScheme === 'spectrum' ? 'bg-brand text-white shadow-md' : 'bg-page text-txt-secondary hover:bg-page/80'
                }`}
              >
                Spectrum (N → C Terminus)
              </button>
              <button
                onClick={() => setColorScheme('chain')}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                  colorScheme === 'chain' ? 'bg-brand text-white shadow-md' : 'bg-page text-txt-secondary hover:bg-page/80'
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