import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, Search, GitMerge, FileText, ArrowRight, Dna, Database, 
  Activity, Clock, Zap, Server, Cpu, MessageSquare 
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      
      {/* Welcome Hero */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-3xl font-bold text-txt-primary mb-2 tracking-tight">Bioinformatics Workbench</h1>
          <p className="text-txt-secondary text-lg">Select a tool module to begin your analysis.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-txt-muted uppercase font-bold tracking-wider">Environment</p>
          <p className="text-txt-primary font-mono text-sm">v2.5.0-Stable</p>
        </div>
      </div>

      {/* Primary Tools Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ToolCard 
          title="Sequence Analysis" 
          desc="Compute GC content, MW, and Melting Temp."
          icon={<Calculator size={24} />}
          color="text-blue-400"
          bg="bg-blue-500/10"
          onClick={() => navigate('/tools')}
        />
        <ToolCard 
          title="Pairwise Alignment" 
          desc="Needleman-Wunsch & Smith-Waterman."
          icon={<GitMerge size={24} />}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          onClick={() => navigate('/aligner')}
        />
        <ToolCard 
          title="PubMed Search" 
          desc="Query NCBI databases for literature."
          icon={<Search size={24} />}
          color="text-purple-400"
          bg="bg-purple-500/10"
          onClick={() => navigate('/pubmed')}
        />
        <ToolCard 
          title="Lab Notebook" 
          desc="Record protocols and observations."
          icon={<FileText size={24} />}
          color="text-orange-400"
          bg="bg-orange-500/10"
          onClick={() => navigate('/notes')}
        />
        <ToolCard 
          title="3D Macromolecules" 
          desc="Visualize PDB structures (RCSB)."
          icon={<Dna size={24} />}
          color="text-pink-400"
          bg="bg-pink-500/10"
          onClick={() => navigate('/viewer')}
        />
        <ToolCard 
          title="External Databases" 
          desc="UniProt, GenBank, Ensembl links."
          icon={<Database size={24} />}
          color="text-cyan-400"
          bg="bg-cyan-500/10"
          onClick={() => navigate('/resources')}
        />
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-6 rounded-xl border border-border bg-panel flex gap-4 items-center">
        <div className="p-3 bg-brand/10 rounded-lg shrink-0">
          <Activity className="text-brand" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-txt-primary mb-1">System Status</h3>
          <p className="text-sm text-txt-secondary">
            All modules operational. Connected to Firebase & Gemini 2.5 Flash.
          </p>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ title, desc, icon, color, bg, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="group text-left p-6 rounded-xl border border-border bg-panel hover:border-brand/50 hover:bg-input/50 transition-all duration-200 flex flex-col h-full shadow-sm"
    >
      <div className={`p-3 rounded-lg w-fit mb-4 ${bg} ${color}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-txt-primary mb-1 group-hover:text-brand transition-colors">
        {title}
      </h3>
      <p className="text-sm text-txt-secondary leading-relaxed">
        {desc}
      </p>
    </button>
  );
}