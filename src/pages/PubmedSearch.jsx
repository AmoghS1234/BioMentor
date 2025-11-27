import React, { useState } from 'react';
import { Search, ExternalLink, BookOpen } from 'lucide-react';

export default function PubmedSearch() {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchPubmed = async () => {
    if (!query) return;
    setLoading(true);
    try {
      // 1. Get IDs
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmode=json&retmax=5`;
      const searchRes = await fetch(searchUrl).then(res => res.json());
      const ids = searchRes.esearchresult.idlist;

      if (ids.length === 0) {
        setPapers([]);
        setLoading(false);
        return;
      }

      // 2. Get Summaries
      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
      const summaryRes = await fetch(summaryUrl).then(res => res.json());
      
      const paperList = ids.map(id => summaryRes.result[id]);
      setPapers(paperList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-3xl font-bold text-txt-primary mb-2 flex items-center gap-2">
          <BookOpen className="text-brand" /> PubMed Search
        </h2>
        <p className="text-txt-secondary">Fetch real scientific papers from the NCBI database.</p>
      </div>

      <div className="flex gap-2">
        <input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter topic (e.g. CRISPR, Diabetes)..."
          className="flex-1 bg-page/50 border border-border rounded-xl p-4 text-txt-primary focus:ring-2 focus:ring-brand outline-none"
          onKeyPress={(e) => e.key === 'Enter' && searchPubmed()}
        />
        <button 
          onClick={searchPubmed}
          disabled={loading}
          className="px-8 bg-brand hover:bg-brand-hover text-txt-primary font-bold rounded-xl transition-all"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="space-y-4">
        {papers.map((paper, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-xl hover:border-purple-500/50 transition-colors">
            <h3 className="text-xl font-bold text-blue-300 mb-2">{paper.title}</h3>
            <p className="text-sm text-txt-secondary mb-4">{paper.source} • {paper.pubdate} • {paper.authors?.map(a => a.name).slice(0, 3).join(', ')}</p>
            <a 
              href={`https://pubmed.ncbi.nlm.nih.gov/${paper.uid}/`} 
              target="_blank" 
              className="inline-flex items-center gap-2 text-txt-accent hover:text-purple-300 text-sm font-bold"
            >
              View on PubMed <ExternalLink size={14} />
            </a>
          </div>
        ))}
        {papers.length === 0 && !loading && (
          <div className="text-center text-slate-600 py-10">No papers found. Try a different term.</div>
        )}
      </div>
    </div>
  );
}