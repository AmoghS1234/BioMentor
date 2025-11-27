import React, { useState } from 'react';
import { Database, Search, ExternalLink } from 'lucide-react';

const DATABASE = [
  { id: 'NCBI', name: 'GenBank', type: 'Database', desc: 'Annotated collection of all publicly available DNA sequences.', access: 'Open' },
  { id: 'UPROT', name: 'UniProt', type: 'Database', desc: 'Comprehensive resource for protein sequence and annotation data.', access: 'Open' },
  { id: 'PDB', name: 'RCSB PDB', type: 'Structure', desc: '3D structural data of biological macromolecules.', access: 'Open' },
  { id: 'ENS', name: 'Ensembl', type: 'Browser', desc: 'Genome browser for vertebrate genomes.', access: 'Open' },
  { id: 'BLAST', name: 'BLAST+', type: 'Tool', desc: 'Algorithm for comparing primary biological sequence information.', access: 'Tool' },
  { id: 'UCSC', name: 'UCSC Browser', type: 'Browser', desc: 'Interactive website offering access to genome sequence data.', access: 'Open' },
  { id: 'GLXY', name: 'Galaxy', type: 'Platform', desc: 'Open source, web-based platform for data intensive research.', access: 'Cloud' },
  { id: 'STRG', name: 'String-DB', type: 'Database', desc: 'Known and predicted protein-protein interactions.', access: 'Open' },
];

export default function Resources() {
  const [search, setSearch] = useState('');

  const filtered = DATABASE.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
            <Database className="text-brand" /> External Resources
          </h2>
          <p className="text-sm text-txt-secondary mt-1">Verified databases and computational tools.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter resources..." 
            className="bg-panel border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-txt-primary focus:ring-1 focus:ring-brand outline-none w-64"
          />
        </div>
      </div>

      <div className="pro-panel flex-1 overflow-hidden flex flex-col bg-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-page border-b border-border text-txt-muted uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Resource Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Access</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-page/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-txt-muted">{item.id}</td>
                  <td className="px-6 py-4 font-bold text-txt-primary">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-input text-xs text-txt-secondary border border-border">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-txt-secondary max-w-md truncate">{item.desc}</td>
                  <td className="px-6 py-4 text-xs text-txt-muted">{item.access}</td>
                  <td className="px-6 py-4">
                    <a href="#" className="text-brand hover:text-brand-light flex items-center gap-1 font-medium text-xs">
                      Open <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}