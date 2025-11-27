import React, { useState } from 'react';
import { ClipboardList, CheckCircle, Circle } from 'lucide-react';

export default function LabProtocols() {
  const protocols = {
    "DNA Extraction": [
      "Lyse cells with detergent",
      "Add Proteinase K",
      "Incubate at 56°C",
      "Add Ethanol to precipitate DNA",
      "Spin column centrifugation",
      "Elute with buffer"
    ],
    "PCR Setup": [
      "Thaw reagents on ice",
      "Add water to PCR tube",
      "Add Master Mix",
      "Add Primers (Fwd/Rev)",
      "Add DNA Template",
      "Run Thermal Cycler"
    ]
  };

  const [activeProto, setActiveProto] = useState("DNA Extraction");
  const [checkedSteps, setCheckedSteps] = useState({});

  const toggleStep = (step) => {
    setCheckedSteps(prev => ({...prev, [step]: !prev[step]}));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
            <ClipboardList className="text-brand" /> Lab Protocols
          </h2>
          <p className="text-sm text-txt-secondary mt-1">Standard operating procedures for wet-lab experiments.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="pro-panel bg-panel p-4 rounded-xl space-y-2 h-fit">
          {Object.keys(protocols).map(p => (
            <button key={p} onClick={() => setActiveProto(p)} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeProto === p ? 'bg-brand text-white' : 'text-txt-secondary hover:bg-page'}`}>
              {p}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 pro-panel bg-panel p-6 rounded-xl">
          <h3 className="text-xl font-bold text-txt-primary mb-6 border-b border-border pb-4">{activeProto}</h3>
          <div className="space-y-4">
            {protocols[activeProto].map((step, idx) => (
              <div key={step} onClick={() => toggleStep(step)} className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${checkedSteps[step] ? 'bg-green-900/20 border border-green-500/30' : 'bg-page border border-border hover:border-brand'}`}>
                {checkedSteps[step] ? <CheckCircle className="text-green-500" size={24} /> : <Circle className="text-slate-500" size={24} />}
                <span className={`text-lg ${checkedSteps[step] ? 'text-green-400 line-through' : 'text-txt-primary'}`}>{step}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setCheckedSteps({})} className="mt-8 text-sm text-txt-muted hover:text-brand underline">Reset Checklist</button>
        </div>
      </div>
    </div>
  );
}