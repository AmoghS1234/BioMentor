import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle, Circle, Plus, X, Trash2 } from 'lucide-react';

export default function LabProtocols() {
  const defaultProtocols = {
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

  const [protocols, setProtocols] = useState(defaultProtocols);
  const [activeProto, setActiveProto] = useState("DNA Extraction");
  const [checkedSteps, setCheckedSteps] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProtocolName, setNewProtocolName] = useState('');
  const [newSteps, setNewSteps] = useState(['']);

  // Load custom protocols from storage on mount
  useEffect(() => {
    const loadProtocols = async () => {
      try {
        const result = await window.storage.get('custom-protocols');
        if (result?.value) {
          const customProtocols = JSON.parse(result.value);
          setProtocols({ ...defaultProtocols, ...customProtocols });
        }
      } catch (error) {
        console.log('No custom protocols found');
      }
    };
    loadProtocols();
  }, []);

  // Save custom protocols (excluding defaults)
  const saveCustomProtocols = async (allProtocols) => {
    const customOnly = {};
    Object.keys(allProtocols).forEach(key => {
      if (!defaultProtocols[key]) {
        customOnly[key] = allProtocols[key];
      }
    });
    try {
      await window.storage.set('custom-protocols', JSON.stringify(customOnly));
    } catch (error) {
      console.error('Error saving protocols:', error);
    }
  };

  const toggleStep = (step) => {
    setCheckedSteps(prev => ({...prev, [step]: !prev[step]}));
  };

  const addStepField = () => {
    setNewSteps([...newSteps, '']);
  };

  const updateStep = (index, value) => {
    const updated = [...newSteps];
    updated[index] = value;
    setNewSteps(updated);
  };

  const removeStepField = (index) => {
    setNewSteps(newSteps.filter((_, i) => i !== index));
  };

  const handleAddProtocol = async () => {
    if (!newProtocolName.trim()) return;
    const validSteps = newSteps.filter(s => s.trim());
    if (validSteps.length === 0) return;

    const updatedProtocols = {
      ...protocols,
      [newProtocolName]: validSteps
    };
    setProtocols(updatedProtocols);
    await saveCustomProtocols(updatedProtocols);
    
    setActiveProto(newProtocolName);
    setNewProtocolName('');
    setNewSteps(['']);
    setShowAddForm(false);
  };

  const handleDeleteProtocol = async (protocolName) => {
    if (defaultProtocols[protocolName]) return; // Can't delete defaults
    
    const { [protocolName]: removed, ...remaining } = protocols;
    setProtocols(remaining);
    await saveCustomProtocols(remaining);
    
    if (activeProto === protocolName) {
      setActiveProto("DNA Extraction");
    }
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
        <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors">
          <Plus size={20} /> Add Protocol
        </button>
      </div>

      {showAddForm && (
        <div className="pro-panel bg-panel p-6 rounded-xl border-2 border-brand/30">
          <h3 className="text-lg font-bold text-txt-primary mb-4">Create New Protocol</h3>
          
          <input 
            type="text" 
            placeholder="Protocol Name" 
            value={newProtocolName}
            onChange={(e) => setNewProtocolName(e.target.value)}
            className="w-full px-4 py-2 bg-page border border-border rounded-lg text-txt-primary mb-4 focus:outline-none focus:border-brand"
          />

          <div className="space-y-2 mb-4">
            <label className="text-sm text-txt-secondary">Protocol Steps:</label>
            {newSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder={`Step ${idx + 1}`}
                  value={step}
                  onChange={(e) => updateStep(idx, e.target.value)}
                  className="flex-1 px-4 py-2 bg-page border border-border rounded-lg text-txt-primary focus:outline-none focus:border-brand"
                />
                {newSteps.length > 1 && (
                  <button onClick={() => removeStepField(idx)} className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={addStepField} className="px-4 py-2 bg-page border border-border text-txt-secondary rounded-lg hover:border-brand hover:text-brand transition-colors">
              + Add Step
            </button>
            <button onClick={handleAddProtocol} className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors">
              Save Protocol
            </button>
            <button onClick={() => { setShowAddForm(false); setNewProtocolName(''); setNewSteps(['']); }} className="px-4 py-2 text-txt-muted hover:text-txt-primary transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="pro-panel bg-panel p-4 rounded-xl space-y-2 h-fit">
          {Object.keys(protocols).map(p => (
            <div key={p} className="relative group">
              <button onClick={() => setActiveProto(p)} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeProto === p ? 'bg-brand text-white' : 'text-txt-secondary hover:bg-page'}`}>
                {p}
              </button>
              {!defaultProtocols[p] && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteProtocol(p); }} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-900/20 rounded transition-all"
                  title="Delete protocol"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
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