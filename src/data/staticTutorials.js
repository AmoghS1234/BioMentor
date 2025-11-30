// staticTutorials.js
// Clean working version for BioMentor

export const STATIC_TUTORIALS = [
  {
    id: "tool-01",
    title: "NCBI BLAST — Quick Guide",
    type: "Tool Guide",
    duration: "15 min",
    content: `
NCBI BLAST helps compare DNA or protein sequences with databases to identify similar sequences.

Choose the correct program:
• blastn – nucleotide vs nucleotide
• blastp – protein vs protein
• blastx – translated nucleotide vs protein
• tblastn – protein vs translated nucleotide

Basic Workflow:
1. Open BLAST website.
2. Paste your sequence in FASTA format.
3. Select program and database.
4. Run BLAST and check E-value, identity %, coverage.
`
  },

  {
    id: "tool-02",
    title: "FASTA & Common Sequence Formats",
    type: "Basics",
    duration: "8 min",
    content: `
FASTA format stores biological sequences.

Example:
>my_sequence
ATGCGTACGTTAG

Common Formats:
• FASTQ – sequencing reads with quality
• GFF/GTF – genome annotation
• PDB – 3D protein structure
`
  },

  {
    id: "tool-03",
    title: "UniProt — Protein Information",
    type: "Database",
    duration: "12 min",
    content: `
UniProt provides curated protein information.

Swiss-Prot (reviewed) — curated and high-quality  
TrEMBL (unreviewed) — automated, large-scale

Sections to check:
• Function and pathways
• Sequence features
• Cross references (PDB, Ensembl)

Tip: Search with filters for accuracy.
`
  },

  {
    id: "tool-04",
    title: "Clustal Omega — Multiple Sequence Alignment",
    type: "Analysis",
    duration: "20 min",
    content: `
Clustal Omega aligns multiple sequences to find conserved regions.

Quick Steps:
1. Paste FASTA sequences.
2. Run alignment.
3. Interpret symbols:
   * = fully conserved
   : = strongly similar
   . = weakly similar
   - = gap
`
  },

  {
    id: "tool-05",
    title: "PyMOL — Protein Structure Visualization",
    type: "Visualization",
    duration: "25 min",
    content: `
PyMOL visualizes 3D protein structures (.pdb files).

Basic Commands:
• fetch 1abc — download structure
• show cartoon — show backbone
• color red, chain A — color chain A
• select ligand, resn ATP — select ligand ATP

Useful for identifying binding sites and folds.
`
  },

  {
    id: "tool-06",
    title: "UCSC Genome Browser & BLAT",
    type: "Genomics",
    duration: "18 min",
    content: `
UCSC Browser provides genomic context: genes, variants, conservation.

BLAT quickly maps sequences to a genome.

Workflow:
1. Paste sequence into BLAT.
2. Open best hit.
3. View the region in UCSC Browser with tracks like GENCODE, SNPs, repeats.
`
  },

  {
    id: "tool-07",
    title: "How to Use BioMentor",
    type: "How-To",
    duration: "10 min",
    content: `
BioMentor can:
• Explain concepts in simple terms
• Guide tool usage
• Provide sequence examples
• Break down workflows (BLAST, alignment, genome search)

Ask questions like:
"Explain E-value"
"How to run BLAST?"
"What is FASTA?"
`
  }
];
