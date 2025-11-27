import React, { useState } from 'react';
import { Search, ExternalLink, BookOpen, Loader, FileText, Calendar, Users } from 'lucide-react';

export default function PubmedSearch() {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchPubmed = async () => {
    if (!query) return;
    setLoading(true);
    setSearched(true);
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
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <h2 className="text-3xl font-bold text-txt-primary flex items-center justify-center gap-2">
          <BookOpen className="text-brand" size={32} /> PubMed Literature Search
        </h2>
        <p className="text-txt-secondary">Access 36 million citations for biomedical literature from MEDLINE, life science journals, and online books.</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={20} />
          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topic (e.g. CRISPR, Diabetes, p53)..."
            className="w-full bg-panel border border-border rounded-xl pl-12 pr-4 py-4 text-txt-primary focus:ring-2 focus:ring-brand outline-none shadow-sm text-lg"
            onKeyPress={(e) => e.key === 'Enter' && searchPubmed()}
          />
        </div>
        <button 
          onClick={searchPubmed}
          disabled={loading}
          className="px-8 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
        >
          {loading ? <Loader className="animate-spin" /> : 'Search'}
        </button>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {papers.map((paper, idx) => (
          <div key={idx} className="pro-panel bg-panel p-6 hover:border-brand/50 transition-all group">
            <h3 className="text-xl font-bold text-brand-light mb-2 group-hover:text-brand transition-colors cursor-pointer">
              <a href={`https://pubmed.ncbi.nlm.nih.gov/${paper.uid}/`} target="_blank" rel="noreferrer">
                {paper.title}
              </a>
            </h3>
            
            <div className="flex flex-wrap gap-4 text-sm text-txt-secondary mb-4">
              <div className="flex items-center gap-1">
                <Users size={14} className="text-txt-muted"/>
                <span>{paper.authors?.map(a => a.name).slice(0, 2).join(', ')}{paper.authors?.length > 2 ? ' et al.' : ''}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText size={14} className="text-txt-muted"/>
                <span className="italic">{paper.source}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-txt-muted"/>
                <span>{paper.pubdate.split(' ')[0]}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <a 
                href={`https://pubmed.ncbi.nlm.nih.gov/${paper.uid}/`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-txt-muted hover:text-brand transition-colors bg-page px-3 py-1.5 rounded-lg border border-border"
              >
                Full Article <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}

        {papers.length === 0 && !loading && searched && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl text-txt-muted">
            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p>No papers found. Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}