import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Eye, EyeOff, ShieldCheck, Key, HelpCircle, Trash2, Download, Upload, Database, RotateCcw } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { 
    geminiApiKey, 
    setGeminiApiKey, 
    clearAllData,
    transactions,
    budgets,
    futureEvents,
    rules,
    exportData,
    importData,
    resetRulesToDefaults
  } = useFinance();

  const [showKey, setShowKey] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  
  // Import/Export and Reset status states
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [rulesReset, setRulesReset] = useState(false);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeminiApiKey(e.target.value.trim());
  };

  const handleClear = () => {
    if (confirm("Are you absolutely sure you want to delete all bank statement history, budgets, and customization rules? This cannot be undone.")) {
      clearAllData();
      setIsCleared(true);
      setTimeout(() => setIsCleared(false), 3000);
    }
  };

  const handleExport = () => {
    try {
      const dataStr = exportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial_planner_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export data: " + String(err));
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importData(content);
      if (res.success) {
        setImportSuccess(true);
        setImportError(null);
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError(res.error || "Unknown error during import.");
        setImportSuccess(false);
      }
    };
    reader.onerror = () => {
      setImportError("Failed to read selection backup file.");
    };
    reader.readAsText(file);
  };

  const handleResetRules = () => {
    if (confirm("Are you sure you want to reset categorization rules to factory defaults? Your loaded transaction categories will remain intact but custom rules will be overwritten.")) {
      resetRulesToDefaults();
      setRulesReset(true);
      setTimeout(() => setRulesReset(false), 3000);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 text-left font-sans">
      {/* Privacy Banner */}
      <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Local-First Privacy Architecture
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Rob's Financial Planner compiles statements entirely in the client-side JavaScript engine. No databases, servers, or external services index your accounts.
        </p>
      </div>

      {/* Data Overview Panel */}
      <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-1.5">
          <Database className="w-4 h-4 text-sky-400" />
          Data Diagnostics &amp; Overview
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <span className="text-[10px] text-zinc-550 uppercase font-bold block">Transactions Ledger</span>
            <span className="text-lg font-bold font-mono text-zinc-200">{transactions.length}</span>
            <span className="text-[9px] text-zinc-500 block">Records loaded</span>
          </div>
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <span className="text-[10px] text-zinc-550 uppercase font-bold block">Active Budgets</span>
            <span className="text-lg font-bold font-mono text-zinc-200">
              {budgets.filter(b => b.name !== 'Income').length}
            </span>
            <span className="text-[9px] text-zinc-500 block">Expense buckets</span>
          </div>
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <span className="text-[10px] text-zinc-550 uppercase font-bold block">Sandbox Adjusters</span>
            <span className="text-lg font-bold font-mono text-zinc-200">{futureEvents.length}</span>
            <span className="text-[9px] text-zinc-500 block">Active overrides</span>
          </div>
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <span className="text-[10px] text-zinc-550 uppercase font-bold block">Categorization Rules</span>
            <span className="text-lg font-bold font-mono text-zinc-200">{rules.length}</span>
            <span className="text-[9px] text-zinc-500 block">Keyword triggers</span>
          </div>
        </div>
      </div>

      {/* Backup & Recovery Panel */}
      <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-1.5">
          <Download className="w-4 h-4 text-emerald-400" />
          Backup &amp; Recovery snapshot
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Export your complete planner configuration, ledger history, budgets, and sandbox parameters to a single file, or restore a previously saved state.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExport}
            className="flex-1 py-2.5 px-4 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-350"
          >
            <Download className="w-4 h-4 text-accent-gold" />
            Export Snapshot
          </button>
          
          <label className="flex-1 py-2.5 px-4 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-350 cursor-pointer text-center">
            <Upload className="w-4 h-4 text-sky-400" />
            Import Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        {importSuccess && (
          <p className="text-[10px] font-mono font-bold text-emerald-400 text-center">
            Backup snapshot restored successfully!
          </p>
        )}
        {importError && (
          <p className="text-[10px] font-mono font-bold text-rose-450 text-center">
            Error: {importError}
          </p>
        )}
      </div>

      {/* API Key Panel */}
      <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-1.5">
          <Key className="w-4 h-4 text-accent-gold" />
          Gemini API Configuration
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          The AI Advisor utilizes a Gemini connection. Provide your personal Gemini API Key below. This key is written strictly to local storage and never leaves your browser.
        </p>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-zinc-550">Gemini API Key</label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={geminiApiKey}
              onChange={handleKeyChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-zinc-100 font-mono focus:outline-none focus:border-accent-gold text-xs"
              placeholder="AIzaSy..."
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-550 hover:text-zinc-350"
              title={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-zinc-550 font-mono">
            Get an API key for free from the <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent-gold transition-colors">Google AI Studio</a>.
          </p>
        </div>
      </div>

      {/* Delete / Reset Panel */}
      <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-rose-450 flex items-center gap-1.5">
          <Trash2 className="w-4 h-4" />
          System Maintenance
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Reset your customization rules or wipe all cached statement history, overrides, and local configurations.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleResetRules}
            className="flex-1 py-2.5 px-4 bg-zinc-850 hover:bg-zinc-800 border border-zinc-750/50 hover:border-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300"
          >
            <RotateCcw className="w-4 h-4 text-amber-500" />
            {rulesReset ? 'Rules Restored!' : 'Reset Rules to Defaults'}
          </button>

          <button
            onClick={handleClear}
            className="flex-1 py-2.5 px-4 bg-rose-955/20 hover:bg-rose-955/40 border border-rose-900/40 hover:border-rose-900/60 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" />
            {isCleared ? 'Data Cleared!' : 'Wipe All Application Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
