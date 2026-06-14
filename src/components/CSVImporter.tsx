import React, { useRef, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

export const CSVImporter: React.FC = () => {
  const { 
    importTransactionsFromCSV, 
    initialCash, 
    setInitialCash, 
    loadDemoData, 
    transactions,
    clearAllData
  } = useFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = importTransactionsFromCSV(text);
      if (res.success) {
        const dupeNote = res.duplicatesDropped > 0
          ? ` ${res.duplicatesDropped} duplicate${res.duplicatesDropped > 1 ? 's' : ''} removed.`
          : '';
        setImportResult({
          success: true,
          message: `Imported ${res.count} new transaction${res.count !== 1 ? 's' : ''} from ${file.name}.${dupeNote} ${res.totalKept} total in your history.`
        });
      } else {
        setImportResult({
          success: false,
          message: res.error || "Failed to parse bank statement CSV."
        });
      }
    };
    reader.onerror = () => {
      setImportResult({
        success: false,
        message: "Error reading file."
      });
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Setup cash and onboarding */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300">1. Account Liquidity</h3>
            <p className="text-xs text-zinc-400">
              Input your current total cash balance. This will serve as the starting point for your 24-month projection.
            </p>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Starting Cash (EUR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">€</span>
                <input
                  type="number"
                  value={initialCash}
                  onChange={(e) => setInitialCash(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-8 pr-4 text-zinc-100 font-mono focus:outline-none focus:border-accent-gold text-sm"
                  placeholder="e.g. 5000"
                />
              </div>
            </div>

            {transactions.length > 0 && (
              <button
                onClick={clearAllData}
                className="w-full py-2 border border-rose-900/50 hover:bg-rose-950/20 text-rose-400 rounded-xl text-xs font-semibold transition-all duration-300 mt-2"
              >
                Clear Statement Data
              </button>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300">No Statement Handy?</h3>
            <p className="text-xs text-zinc-400">
              Load our pre-constructed financial model statement to explore the features instantly, including custom transaction categories, budgets, and AI recommendations.
            </p>
            <button
              onClick={loadDemoData}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-xs flex justify-center items-center gap-1 transition-all duration-300 border border-zinc-700/50"
            >
              Load Demo Financial Profile
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: CSV Uploader */}
        <div className="flex-1">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`h-full min-h-[280px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive 
                ? 'border-accent-gold bg-accent-gold/5' 
                : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            
            <div className="p-4 bg-zinc-800/80 rounded-full text-zinc-400 mb-4 group-hover:text-zinc-200">
              <Upload className="w-8 h-8" />
            </div>
            
            <h4 className="text-base font-semibold text-zinc-200">Upload Bank Statement CSV</h4>
            <p className="text-xs text-zinc-400 max-w-sm mt-2">
              Drag & drop your bank statement file here, or click to browse files.
            </p>
            
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-[10px] text-zinc-500 font-mono">
              <span className="px-2 py-1 bg-zinc-900 rounded-md border border-zinc-800">Date</span>
              <span className="px-2 py-1 bg-zinc-900 rounded-md border border-zinc-800">Description</span>
              <span className="px-2 py-1 bg-zinc-900 rounded-md border border-zinc-800">Amount</span>
              <span className="px-2 py-1 bg-zinc-900 rounded-md border border-zinc-800">Category (optional)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Indicator */}
      {importResult && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${
          importResult.success 
            ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300' 
            : 'bg-rose-950/20 border-rose-900/50 text-rose-300'
        }`}>
          <div className="mt-0.5">
            {importResult.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div className="space-y-1">
            <h5 className="text-sm font-semibold">{importResult.success ? 'Import Succeeded' : 'Import Failed'}</h5>
            <p className="text-xs opacity-90">{importResult.message}</p>
          </div>
        </div>
      )}

      {/* Formatting help tips */}
      <div className="glass-card p-5 rounded-2xl border border-zinc-800 flex items-start gap-4">
        <div className="p-2 bg-zinc-900 rounded-lg text-zinc-500 mt-0.5">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-zinc-300">Privacy Notice</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            All data parsing, extraction, and projection math happens entirely within your local browser. Your transaction descriptions, amounts, and account balances are never uploaded to any server. If you configure a Gemini API key for the Analyst, only anonymized aggregate monthly totals are sent to generate recommendations.
          </p>
        </div>
      </div>
    </div>
  );
};
