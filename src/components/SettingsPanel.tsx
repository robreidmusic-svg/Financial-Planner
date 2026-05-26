import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Eye, EyeOff, ShieldCheck, Key, HelpCircle, Trash2 } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { geminiApiKey, setGeminiApiKey, clearAllData } = useFinance();
  const [showKey, setShowKey] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

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

  return (
    <div className="max-w-xl mx-auto space-y-6">
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
          <label className="text-[10px] uppercase font-bold text-zinc-500">Gemini API Key</label>
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350"
              title={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">
            Get an API key for free from the <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent-gold transition-colors">Google AI Studio</a>.
          </p>
        </div>
      </div>

      {/* Delete / Reset Panel */}
      <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-rose-400 flex items-center gap-1.5">
          <Trash2 className="w-4 h-4" />
          System Maintenance
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Wipe all cached transactions, custom rules, budgets, future events, and local API configurations from this device.
        </p>

        <button
          onClick={handleClear}
          className="py-2.5 px-4 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 hover:border-rose-900/60 text-rose-300 rounded-xl text-xs font-semibold transition-all duration-300"
        >
          {isCleared ? 'Data Cleared!' : 'Wipe All Application Data'}
        </button>
      </div>
    </div>
  );
};
