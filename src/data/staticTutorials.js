export const STATIC_TUTORIALS = [
  {
    id: "tool-01",
    title: "Deep Dive: NCBI BLAST",
    type: "Tool Guide",
    duration: "30 min",
    content: `
# NCBI BLAST: The Google of Biology

The **Basic Local Alignment Search Tool (BLAST)** finds regions of similarity between biological sequences. It is the fundamental tool for identifying unknown genes and proteins.

---

## 1. Choosing the Right Algorithm

Before you paste a sequence, you must choose the correct "Flavor" of BLAST.

| Program | Query | Database | Use Case |
| :--- | :--- | :--- | :--- |
| **blastn** | Nucleotide | Nucleotide | Mapping DNA sequences, finding gene homologs in same species. |
| **blastp** | Protein | Protein | Determining protein function, finding homologs in diverse species. |
| **blastx** | Nucleotide (Translated) | Protein | Finding protein-coding genes in genomic DNA. |
| **tblastn** | Protein | Nucleotide (Translated) | Mapping a protein to a genome. |

---

## 2. Step-by-Step Workflow

### Step A: Input
Navigate to [blast.ncbi.nlm.nih.gov](https://blast.ncbi.nlm.nih.gov). Paste your sequence in FASTA format:

\`\`\`text
>Unknown_Gene_001
ATGCGTACCGGT...
\`\`\`

### Step B: Database Selection
* **Standard databases (nr/nt):** The comprehensive collection. Use this 90% of the time.
* **RefSeq:** curated, non-redundant sequences. Use for high-quality reference data.
* **Model Organisms:** Select "Human" or "Mouse" to limit search scope if you know the species.

![BLAST Input Form](https://placehold.co/800x400/1e293b/ffffff?text=Screenshot:+BLAST+Database+Selection)

---

## 3. Interpreting Results (Critical)

The output table contains statistical metrics. Understanding them is key to avoiding false positives.

1.  **Max Score (Bit Score):**
    * Higher is better.
    * Measures similarity independent of database size.
2.  **Query Cover:**
    * Percentage of *your* sequence that overlaps with the hit.
    * *Warning:* A 100% identity match with only 5% query cover is usually a meaningless artifact.
3.  **E-Value (Expect Value):**
    * **LOWER is better.**
    * The number of hits one can "expect" to see by chance.
    * **< 1e-50**: Extremely reliable homology.
    * **> 0.01**: Likely random noise.
4.  **Per. Ident (Percent Identity):**
    * **> 95%**: Same species or very recent divergence.
    * **30-40%**: Distant homolog (might still share structure/function).

![BLAST Hit Table](https://placehold.co/800x400/1e293b/ffffff?text=Screenshot:+Interpreting+E-Values+and+Scores)
`
  },
  {
    id: "tool-02",
    title: "UniProt: The Protein Encyclopedia",
    type: "Database",
    duration: "25 min",
    content: `
# UniProt: Universal Protein Resource

UniProt is the central hub for protein functional information. If BLAST tells you *what* a sequence looks like, UniProt tells you *what it does*.

---

## 1. Swiss-Prot vs. TrEMBL

UniProt is divided into two sections. Knowing the difference saves time.

* **Swiss-Prot (Reviewed):** Manually annotated by real scientists. High quality, experimental evidence. **Always prefer this.** (Gold Star icon).
* **TrEMBL (Unreviewed):** Automatically annotated by computer algorithms. Massive coverage, but lower confidence.

---

## 2. Anatomy of a UniProt Entry

When you open a protein page (e.g., Hemoglobin Subunit Alpha - P69905), look for these key sections:

### **Function Section**
Describes the biological role.
> "Involved in oxygen transport from the lung to the peripheral tissues."

### **Subcellular Location**
Where does the protein live?
* *Cytoplasm*
* *Cell Membrane* (Is it a receptor?)
* *Nucleus* (Is it a transcription factor?)

![UniProt Location Topology](https://placehold.co/800x400/1e293b/ffffff?text=Screenshot:+Subcellular+Location+Graphic)

### **Pathology & Biotech**
* **Diseases:** Lists mutations associated with genetic disorders (e.g., Sickle Cell Anemia).
* **Mutagenesis:** Shows experimental results of changing specific amino acids.

---

## 3. Advanced Search Techniques

You can filter searches precisely. Try typing these into the search bar:

* \`organism:"Homo sapiens" AND gene:p53\` -> Finds human p53 only.
* \`annotation:(type:transmem)\` -> Finds proteins with transmembrane domains.
`
  },
  {
    id: "tool-03",
    title: "Clustal Omega: Multiple Sequence Alignment",
    type: "Analysis",
    duration: "35 min",
    content: `
# Clustal Omega: Finding Conserved Regions

**Multiple Sequence Alignment (MSA)** aligns three or more sequences to reveal evolutionary relationships and critical functional residues.

---

## 1. Why do we align?

* **Phylogeny:** To build evolutionary trees.
* **Conservation:** If an amino acid stays the same across Human, Mouse, Fish, and Yeast, it is likely **essential** for the protein's function (active site).
* **Motif Finding:** To discover signature patterns.

---

## 2. Running an Alignment

1.  **Collect Sequences:** Get FASTA sequences for the same protein from 5+ different species.
2.  **Input:** Paste them all into one box at [ebi.ac.uk/Tools/msa/clustalo/](https://www.ebi.ac.uk/Tools/msa/clustalo/).
3.  **Output Format:** Choose **"Clustal w/ numbers"** for readability.

![Clustal Input](https://placehold.co/800x400/1e293b/ffffff?text=Screenshot:+Clustal+Omega+Input+Form)

---

## 3. Reading the Alignment

The output uses symbols to indicate similarity quality:

\`\`\`text
SeqA    MKTLLILAVVAAL
SeqB    MKTLLILAVVAAL
SeqC    MKTLLILAVV---
        **********
\`\`\`

* **(*) Asterisk:** Perfectly conserved (Identity). The residue is identical in all sequences.
* **(:) Colon:** Strongly similar properties (e.g., Leucine vs Isoleucine - both hydrophobic).
* ** (.) Period:** Weakly similar properties.
* **(-) Dash:** Gap. An insertion or deletion event (Indel) occurred here during evolution.

### **Visualizing Results**
Text files are hard to read. Use **Jalview** or the "Result Viewers" button on EBI to see color-coded alignments based on hydrophobicity.
`
  },
  {
    id: "tool-04",
    title: "PyMOL: Visualizing 3D Structures",
    type: "Visualization",
    duration: "45 min",
    content: `
# PyMOL: From Sequence to Structure

Proteins are 3D machines. PyMOL is the industry-standard software for rendering these structures from PDB files.

---

## 1. Loading a Structure
You can load files directly from the RCSB Protein Data Bank.

* **Command Line:** Type \`fetch 1crn\` in the top bar.
* **File Menu:** File > Open > Select \`.pdb\` file.

---

## 2. Representations

Proteins can be shown in different ways to highlight different features:

* **Lines/Sticks:** Shows every atom and bond. Good for seeing detailed chemistry of side chains.
* **Cartoon/Ribbon:** Smooth tubes following the backbone. Best for seeing Secondary Structure (Alpha Helices and Beta Sheets).
* **Surface:** Shows the outer shell. Useful for visualizing binding pockets and "lock and key" mechanisms.

![PyMOL Representations](https://placehold.co/800x400/1e293b/ffffff?text=Screenshot:+Comparing+Cartoon+vs+Surface+View)

---

## 3. Essential Commands

PyMOL is powerful when you use the command line (bottom of screen).

| Command | Action |
| :--- | :--- |
| \`color red, chain A\` | Colors Chain A red. |
| \`show surface, all\` | Turns on surface view. |
| \`select active, resi 45-50\` | Selects residues 45 to 50 and names the selection "active". |
| \`zoom active\` | Zooms camera to that selection. |
| \`ray\` | Renders a high-quality shadow/reflection image for publication. |

---

## 4. Analyzing Interactions

To see how a drug binds to a protein:
1.  Load a complex (e.g., \`fetch 1hsg\`).
2.  Click the ligand (drug molecule).
3.  Select **Action (A) > find > polar contacts > to any atoms**.
4.  Yellow dotted lines appear, showing **Hydrogen Bonds**. This explains *why* the drug sticks!
`
  },
  {
    id: "tool-05",
    title: "UCSC Genome Browser: Navigating DNA",
    type: "Genomics",
    duration: "40 min",
    content: `
# UCSC Genome Browser: The Google Maps of DNA

While BLAST looks at single genes, the Genome Browser lets you scroll through entire chromosomes, viewing genes, regulation, and variation in context.

---

## 1. The "Tracks" Concept

Data is stacked in horizontal rows called "Tracks". You can turn them on/off below the main viewer.

* **Base Position:** The literal A, T, C, G letters (zoom in to see).
* **GENCODE Genes:** The standard gene models (Exons are thick blocks, Introns are thin lines with arrows).
* **Conservation:** A graph showing how similar this region is across 100 vertebrates (High peaks = Important functional DNA).
* **dbSNP:** Known genetic variations (SNPs) in the human population.

![UCSC Browser Interface](https://placehold.co/800x400/1e293b/ffffff?text=Screenshot:+UCSC+Genome+Browser+Tracks)

---

## 2. Navigation Basics

* **Search:** Type a gene name (e.g., "BRCA1") or coordinate ("chr17:43,044,295-43,125,483").
* **Zoom:** Use the "1.5x", "3x", "10x" buttons to zoom in/out.
* **Scroll:** Click and drag the ruler at the top to move left/right along the chromosome.

---

## 3. BLAT (BLAST-Like Alignment Tool)

UCSC has its own alignment tool called BLAT.
* **Faster** than BLAST for mapping exact matches to the genome.
* **Use Case:** You have a short sequence and want to know exactly *where* in the human genome it comes from (e.g., finding exon/intron boundaries).

**Try it:**
1.  Click **Tools > Blat**.
2.  Paste a sequence.
3.  Click Submit.
4.  Click "Browser" on the top hit to jump straight to that location on the map.
`
  }
];