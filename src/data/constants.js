export const RESOURCES = [
  {
    category: 'Databases',
    items: [
      { name: 'NCBI GenBank', desc: 'Genetic sequence database', url: 'https://www.ncbi.nlm.nih.gov/genbank/' },
      { name: 'UniProt', desc: 'Protein sequence and functional information', url: 'https://www.uniprot.org/' },
      { name: 'PDB', desc: 'Protein Data Bank - 3D structures', url: 'https://www.rcsb.org/' }
    ]
  },
  {
    category: 'Analysis Tools',
    items: [
      { name: 'BLAST', desc: 'Sequence similarity search', url: 'https://blast.ncbi.nlm.nih.gov/' },
      { name: 'Clustal Omega', desc: 'Multiple sequence alignment', url: 'https://www.ebi.ac.uk/Tools/msa/clustalo/' }
    ]
  }
];

export const TUTORIALS = [
  { title: 'Introduction to Sequence Alignment', level: 'Beginner', time: '15 min' },
  { title: 'Understanding BLAST Parameters', level: 'Intermediate', time: '20 min' },
  { title: 'Protein Structure Prediction', level: 'Intermediate', time: '30 min' }
];