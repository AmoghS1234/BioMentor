// Import modules
import { algorithms } from './kb/algorithms';
import { genomics } from './kb/genomics';
import { proteomics } from './kb/proteomics';

// Combine into one Knowledge Base
const KB_DATA = [
  ...algorithms,
  ...genomics,
  ...proteomics,
  // You can easily add more files here later (e.g., ...phylogenetics)
];

export const retrieveContext = (query) => {
  const lowerQ = query.toLowerCase();
  
  // Find all entries where keywords match the query
  const hits = KB_DATA.filter(entry => 
    entry.keywords.some(k => lowerQ.includes(k))
  );

  if (hits.length === 0) return null;
  
  // Return the combined knowledge
  return hits.map(h => h.content).join("\n\n");
};