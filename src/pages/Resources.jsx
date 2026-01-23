import React, { useState, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { 
  Database, Search, ExternalLink, Plus, Trash2, 
  Loader, Save, X, RefreshCw, AlertCircle 
} from 'lucide-react';
import { 
  collection, onSnapshot, addDoc, deleteDoc, doc, writeBatch, query, orderBy, getDocs 
} from 'firebase/firestore';

// --- DEFAULT DATA (Starter Pack) ---
const DEFAULT_RESOURCES = [
  { name: 'GenBank', type: 'Database', desc: 'Annotated collection of all publicly available DNA sequences.', access: 'Open', url: 'https://www.ncbi.nlm.nih.gov/genbank/' },
  { name: 'UniProt', type: 'Database', desc: 'Comprehensive resource for protein sequence and annotation data.', access: 'Open', url: 'https://www.uniprot.org/' },
  { name: 'RCSB PDB', type: 'Structure', desc: '3D structural data of biological macromolecules.', access: 'Open', url: 'https://www.rcsb.org/' },
  { name: 'Ensembl', type: 'Browser', desc: 'Genome browser for vertebrate genomes.', access: 'Open', url: 'https://www.ensembl.org/' },
  { name: 'BLAST+', type: 'Tool', desc: 'Algorithm for comparing primary biological sequence information.', access: 'Tool', url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi' },
  { name: 'UCSC Browser', type: 'Browser', desc: 'Interactive website offering access to genome sequence data.', access: 'Open', url: 'https://genome.ucsc.edu/' },
  { name: 'Galaxy', type: 'Platform', desc: 'Open source, web-based platform for data intensive research.', access: 'Cloud', url: 'https://usegalaxy.org/' },
];

export default function Resources() {
  const { user, db } = useFirebase();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', type: 'Custom', desc: '', url: '' });
  const [isSaving, setIsSaving] = useState(false);

  // 1. REAL-TIME SYNC & INITIALIZATION
  useEffect(() => {
    if (!user || !db) return;

    const ref = collection(db, `users/${user.uid}/resources`);
    const q = query(ref, orderBy('name'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // SCENARIO: First time user (Collection is empty) -> Load Defaults
      if (snapshot.empty && !snapshot.metadata.hasPendingWrites) {
        setLoading(true);
        try {
           const batch = writeBatch(db);
           DEFAULT_RESOURCES.forEach(item => {
             const newDocRef = doc(collection(db, `users/${user.uid}/resources`));
             batch.set(newDocRef, { ...item, createdAt: Date.now() });
           });
           await batch.commit();
        } catch (err) {
            console.error("Error initializing resources:", err);
        }
        setLoading(false);
      } else {
        // SCENARIO: User has data -> Show it
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResources(data);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user, db]);

  // 2. ADD NEW RESOURCE
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.url) return alert("Name and URL are required");

    setIsSaving(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/resources`), {
        ...newItem,
        createdAt: Date.now()
      });
      setShowAddModal(false);
      setNewItem({ name: '', type: 'Custom', desc: '', url: '' });
    } catch (err) {
      console.error(err);
      alert("Error saving resource.");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. DELETE RESOURCE
  const handleDelete = async (id) => {
    if (!confirm("Remove this resource from your personal library?")) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/resources`, id));
    } catch (err) {
      console.error(err);
    }
  };

  // 4. RESET TO DEFAULTS
  const handleResetDefaults = async () => {
    if(!confirm("This will DELETE your custom links and restore the original list. Are you sure?")) return;
    setLoading(true);
    try {
        const ref = collection(db, `users/${user.uid}/resources`);
        const snapshot = await getDocs(ref);
        const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
    } catch (err) {
        console.error(err);
    }
  };

  const filtered = resources.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn h-[calc(100vh-100px)] flex flex-col relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-border pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
            <Database className="text-brand" /> My Research Library
          </h2>
          <p className="text-sm text-txt-secondary mt-1">
            Manage your personal list of databases and tools.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
                <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search library..." 
                    className="bg-panel border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-txt-primary focus:ring-1 focus:ring-brand outline-none w-48"
                />
            </div>
            
            <button 
                onClick={handleResetDefaults}
                className="p-2 text-txt-muted hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                title="Restore Default Links"
            >
                <RefreshCw size={20} />
            </button>

            <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover text-sm font-bold transition-colors shadow-lg shadow-brand/20"
            >
                <Plus size={18} /> Add Link
            </button>
        </div>
      </div>

      {/* TABLE CONTENT */}
      <div className="pro-panel flex-1 overflow-hidden flex flex-col bg-panel relative">
        {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-panel/80 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-2">
                    <Loader className="animate-spin text-brand" size={32} />
                    <p className="text-sm font-bold text-txt-muted">Syncing Library...</p>
                </div>
            </div>
        ) : (
            <div className="overflow-x-auto custom-scrollbar h-full">
            <table className="w-full text-left text-sm">
                <thead className="bg-page border-b border-border text-txt-muted uppercase font-bold text-xs sticky top-0 z-10 shadow-sm">
                <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 w-1/3">Description</th>
                    <th className="px-6 py-4">Access</th>
                    {/* Centered Action Header */}
                    <th className="px-6 py-4 text-center">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-page/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-txt-primary">
                        {item.name}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                            item.type === 'Custom' 
                                ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' 
                                : 'bg-input text-txt-secondary border-border'
                        }`}>
                        {item.type.toUpperCase()}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-txt-secondary max-w-xs truncate" title={item.desc}>
                        {item.desc || 'No description provided.'}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-txt-muted">{item.access || 'Open'}</td>
                    
                    {/* UPDATED: Centered Link with Absolute Trash Button */}
                    <td className="px-6 py-4 relative">
                        <div className="flex items-center justify-center">
                            <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-brand hover:text-brand-light hover:underline flex items-center gap-1 font-bold text-xs transition-colors"
                            >
                                Open <ExternalLink size={12} />
                            </a>
                        </div>
                        
                        {/* Absolute positioned button so it doesn't affect center alignment */}
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-txt-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove from library"
                        >
                            <Trash2 size={16} />
                        </button>
                    </td>
                    </tr>
                ))}
                {filtered.length === 0 && (
                    <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-txt-muted">
                            <div className="flex flex-col items-center gap-2">
                                <AlertCircle size={32} className="opacity-50" />
                                <p>No resources found.</p>
                                <button onClick={() => setShowAddModal(true)} className="text-brand hover:underline text-xs">Add your first custom link</button>
                            </div>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        )}
      </div>

      {/* ADD RESOURCE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-panel border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
                <button 
                    onClick={() => setShowAddModal(false)}
                    className="absolute top-4 right-4 text-txt-muted hover:text-red-500 transition-colors"
                >
                    <X size={20} />
                </button>
                
                <div className="p-6">
                    <h3 className="text-xl font-bold text-txt-primary mb-6">Add Custom Resource</h3>
                    
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-txt-muted uppercase mb-1 block">Name</label>
                            <input 
                                value={newItem.name}
                                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:ring-1 focus:ring-brand outline-none"
                                placeholder="e.g. My Lab Server"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-txt-muted uppercase mb-1 block">URL</label>
                            <input 
                                value={newItem.url}
                                onChange={(e) => setNewItem({...newItem, url: e.target.value})}
                                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:ring-1 focus:ring-brand outline-none"
                                placeholder="https://..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-txt-muted uppercase mb-1 block">Type</label>
                                <select 
                                    value={newItem.type}
                                    onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                                    className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:ring-1 focus:ring-brand outline-none"
                                >
                                    <option>Custom</option>
                                    <option>Database</option>
                                    <option>Tool</option>
                                    <option>Journal</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-txt-muted uppercase mb-1 block">Access</label>
                                <input 
                                    value="Private" 
                                    disabled 
                                    className="w-full bg-page/50 border border-border rounded-lg px-3 py-2 text-sm text-txt-muted cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-txt-muted uppercase mb-1 block">Description</label>
                            <textarea 
                                value={newItem.desc}
                                onChange={(e) => setNewItem({...newItem, desc: e.target.value})}
                                className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-txt-primary focus:ring-1 focus:ring-brand outline-none h-20 resize-none"
                                placeholder="Optional notes..."
                            />
                        </div>

                        <button 
                            disabled={isSaving}
                            className="w-full py-3 bg-brand text-white rounded-lg font-bold hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 mt-2"
                        >
                            {isSaving ? <Loader className="animate-spin" size={18} /> : <><Save size={18} /> Save to Library</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}