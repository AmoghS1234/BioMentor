import React from 'react';
import { Grid } from 'lucide-react';

export default function CodonTable() {
  const bases = ['U', 'C', 'A', 'G'];
  
  const getAminoAcid = (triplet) => {
    const map = {
      'UUU':'Phe', 'UUC':'Phe', 'UUA':'Leu', 'UUG':'Leu',
      'UCU':'Ser', 'UCC':'Ser', 'UCA':'Ser', 'UCG':'Ser',
      'UAU':'Tyr', 'UAC':'Tyr', 'UAA':'STOP', 'UAG':'STOP',
      'UGU':'Cys', 'UGC':'Cys', 'UGA':'STOP', 'UGG':'Trp',
      'CUU':'Leu', 'CUC':'Leu', 'CUA':'Leu', 'CUG':'Leu',
      'CCU':'Pro', 'CCC':'Pro', 'CCA':'Pro', 'CCG':'Pro',
      'CAU':'His', 'CAC':'His', 'CAA':'Gln', 'CAG':'Gln',
      'CGU':'Arg', 'CGC':'Arg', 'CGA':'Arg', 'CGG':'Arg',
      'AUU':'Ile', 'AUC':'Ile', 'AUA':'Ile', 'AUG':'Met',
      'ACU':'Thr', 'ACC':'Thr', 'ACA':'Thr', 'ACG':'Thr',
      'AAU':'Asn', 'AAC':'Asn', 'AAA':'Lys', 'AAG':'Lys',
      'AGU':'Ser', 'AGC':'Ser', 'AGA':'Arg', 'AGG':'Arg',
      'GUU':'Val', 'GUC':'Val', 'GUA':'Val', 'GUG':'Val',
      'GCU':'Ala', 'GCC':'Ala', 'GCA':'Ala', 'GCG':'Ala',
      'GAU':'Asp', 'GAC':'Asp', 'GAA':'Glu', 'GAG':'Glu',
      'GGU':'Gly', 'GGC':'Gly', 'GGA':'Gly', 'GGG':'Gly',
    };
    return map[triplet];
  };

  const getColor = (aa) => {
    if (aa === 'STOP') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (aa === 'Met') return 'bg-green-500/10 text-green-400 border-green-500/20';
    return 'bg-input/30 border-border text-txt-secondary hover:text-txt-primary hover:border-brand/50';
  };

  return (
    <div className="space-y-6 animate-fadeIn h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Grid className="text-brand" />
        <div>
          <h2 className="text-2xl font-bold text-txt-primary">Standard Genetic Code</h2>
          <p className="text-sm text-txt-secondary">Codon to Amino Acid translation reference (RNA).</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-panel p-6 border border-border rounded-xl">
        <div className="grid grid-cols-4 gap-4 max-w-5xl mx-auto">
          {bases.map(first => (
            <div key={first} className="space-y-4">
              {bases.map(second => (
                <div key={first+second} className="p-3 rounded-lg border border-border/50 bg-page/50">
                  {bases.map(third => {
                    const codon = first + second + third;
                    const aa = getAminoAcid(codon);
                    return (
                      <div key={codon} className={`flex justify-between items-center px-2 py-1 mb-1 rounded text-xs border transition-colors ${getColor(aa)}`}>
                        <span className="font-mono font-bold">{codon}</span>
                        <span className="font-bold">{aa}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}