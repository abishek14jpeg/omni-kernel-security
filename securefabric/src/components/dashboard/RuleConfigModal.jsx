import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// A simple internal toggle switch component
function ToggleSwitch({ enabled, onChange }) {
  return (
    <div 
      onClick={() => onChange(!enabled)}
      className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        enabled ? 'bg-primary' : 'bg-outline-variant/50'
      }`}
    >
      <motion.div
        layout
        className="bg-white w-3 h-3 rounded-full shadow-sm"
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
}

// Individual Rule Card
function RuleCard({ rule, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editParams, setEditParams] = useState({});

  useEffect(() => {
    if (rule.params) setEditParams(rule.params);
  }, [rule]);

  const toggleEnabled = () => {
    onUpdate(rule.id, { enabled: !rule.enabled });
  };

  const saveParams = () => {
    // Parse to numbers where appropriate
    const cleanParams = { ...editParams };
    for (let key in cleanParams) {
      if (!isNaN(cleanParams[key]) && cleanParams[key] !== "") {
        cleanParams[key] = parseFloat(cleanParams[key]);
      }
    }
    onUpdate(rule.id, { params: cleanParams });
    setIsEditing(false);
  };

  const hasEditableParams = rule.params && Object.keys(rule.params).length > 0 && !Array.isArray(rule.params.required_fields) && !Array.isArray(rule.params.violation_patterns) && !Array.isArray(rule.params.approved_accounts);

  return (
    <div className={`glass-panel border rounded-xl p-5 transition-all ${rule.enabled ? 'border-primary/20 bg-white/40' : 'border-outline-variant/10 bg-surface-container-low/50 opacity-70'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
            rule.severity === 'critical' ? 'bg-error-container/20 text-error' :
            rule.severity === 'high' ? 'bg-amber-100 text-amber-700' :
            'bg-surface-container-high text-primary'
          }`}>
            {rule.severity}
          </span>
          <span className="text-xs font-mono text-outline font-bold">{rule.id}</span>
        </div>
        <ToggleSwitch enabled={rule.enabled} onChange={toggleEnabled} />
      </div>

      <h4 className={`text-lg font-bold font-serif mb-1 ${rule.enabled ? 'text-on-surface' : 'text-on-surface-variant'}`}>
        {rule.name}
      </h4>
      <p className="text-xs text-on-surface-variant font-sans leading-relaxed mb-4">
        {rule.description}
      </p>

      {/* Parameter Editor Logic */}
      {hasEditableParams && rule.enabled && (
        <div className="mt-4 pt-4 border-t border-outline-variant/20">
          {!isEditing ? (
            <div className="flex justify-between items-center group cursor-pointer" onClick={() => setIsEditing(true)}>
               <div className="flex gap-4">
                 {Object.entries(rule.params).map(([k, v]) => (
                   <div key={k} className="flex flex-col">
                     <span className="text-[9px] uppercase tracking-widest text-outline">{k.replace("_", " ")}</span>
                     <span className="text-sm font-bold font-mono text-primary">{v}</span>
                   </div>
                 ))}
               </div>
               <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-sm">edit</span>
            </div>
          ) : (
            <div className="space-y-3 bg-surface-container-lowest p-3 rounded-lg border border-primary/20">
               {Object.entries(editParams).map(([k, v]) => (
                 <div key={k} className="flex flex-col gap-1">
                   <label className="text-[9px] uppercase tracking-widest text-primary font-bold">{k.replace("_", " ")}</label>
                   <input
                     type="number"
                     className="bg-surface border border-outline-variant/30 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-primary w-full"
                     value={v}
                     onChange={(e) => setEditParams({...editParams, [k]: e.target.value})}
                   />
                 </div>
               ))}
               <div className="flex gap-2 justify-end mt-2">
                 <button onClick={() => setIsEditing(false)} className="text-[10px] uppercase font-bold text-outline hover:text-on-surface px-2 py-1">Cancel</button>
                 <button onClick={saveParams} className="text-[10px] uppercase font-bold bg-primary text-white rounded px-3 py-1 shadow-sm hover:bg-primary-dim">Save</button>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RuleConfigModal({ isOpen, onClose, rules, onUpdateRule }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl max-h-[90vh] glass-panel bg-white/90 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-white"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-outline-variant/20 flex justify-between items-end bg-surface-container-lowest/50 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary">policy</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary">Compliance Engine</span>
              </div>
              <h2 className="text-3xl font-serif font-black tracking-tighter text-on-surface">
                Guardrail Configuration
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto overflow-x-hidden no-scrollbar bg-gradient-to-b from-transparent to-surface-container-low/30">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rules.map(rule => (
                   <RuleCard key={rule.id} rule={rule} onUpdate={onUpdateRule} />
                ))}
             </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-outline-variant/20 bg-surface-container-lowest flex justify-between items-center text-xs font-serif italic text-outline">
            <span>Deterministic constraints override probabilistic AI scores globally.</span>
            <span className="font-bold font-sans not-italic text-primary bg-primary-container px-3 py-1 rounded-full">
               {rules.filter(r => r.enabled).length} / {rules.length} Rules Active
            </span>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
