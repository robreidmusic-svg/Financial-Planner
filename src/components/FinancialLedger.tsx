import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Download, FileSpreadsheet } from 'lucide-react';

export const FinancialLedger: React.FC = () => {
  const { monthlyProjections, budgets, manualIncomeForecasts, setManualIncomeForecast } = useFinance();
  const [editingIncomeMonth, setEditingIncomeMonth] = useState<number | null>(null);
  const [editIncomeValue, setEditIncomeValue] = useState<string>('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleExportCSV = () => {
    try {
      // Build CSV headers: Row label, Month 1, Month 2, ...
      const columns = ['Financial Item', ...monthlyProjections.map(p => p.monthLabel)];
      const rows: string[][] = [];

      // Helper to generate a CSV row
      const addCSVRow = (label: string, valueFn: (proj: any) => number) => {
        const row = [label, ...monthlyProjections.map(p => Math.round(valueFn(p)).toString())];
        rows.push(row);
      };

      // Construct rows
      addCSVRow('Beginning Cash', (p) => p.startingCash);
      addCSVRow('Projected Income', (p) => p.income);
      
      // Expense categories
      const categories = budgets.filter(b => b.name !== 'Income').map(b => b.name);
      categories.forEach(cat => {
        addCSVRow(`  Expense: ${cat}`, (p) => p.categoryBreakdown[cat] || 0);
      });

      addCSVRow('Total Expenses', (p) => p.expenses);
      addCSVRow('Net Savings / Flow', (p) => p.netSavings);
      addCSVRow('Ending Cash Balance', (p) => p.endingCash);

      // Assemble CSV text
      const csvContent = [
        columns.join(','),
        ...rows.map(row => row.map(cell => {
          // Quote strings containing commas
          const cleanedCell = cell.replace(/"/g, '""');
          return cleanedCell.includes(',') ? `"${cleanedCell}"` : cleanedCell;
        }).join(','))
      ].join('\n');

      // Create download trigger
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `robs_financial_planner_24mo_projection_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error exporting CSV:', e);
    }
  };

  const categories = budgets.filter(b => b.name !== 'Income').map(b => b.name);

  return (
    <div className="space-y-4">
      {/* Header and Download Button */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300">Detailed Projection Ledger</h3>
          <p className="text-xs text-zinc-400">
            Grid view of monthly forecast items, structured like a professional profit & loss ledger.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-zinc-50 rounded-xl text-xs font-semibold font-mono flex items-center gap-2 transition-all duration-300 shadow-md"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV Sheet
        </button>
      </div>

      {/* Grid Ledger Board */}
      <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse ledger-grid">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-850 text-[10px] uppercase font-bold text-zinc-400 tracking-wider font-mono">
                <th className="py-4 px-4 sticky left-0 bg-zinc-950/95 z-10 min-w-[200px] border-r border-zinc-850">
                  Financial Ledger Item
                </th>
                {monthlyProjections.map(proj => (
                  <th key={proj.monthIndex} className="py-4 px-6 text-right whitespace-nowrap min-w-[110px] border-r border-zinc-850/40">
                    {proj.monthLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850/50 text-[11px] font-mono">
              {/* Beginning Cash */}
              <tr className="hover:bg-zinc-900/40 transition-colors">
                <td className="py-3 px-4 font-bold text-zinc-300 sticky left-0 bg-zinc-900/90 md:bg-zinc-950/90 border-r border-zinc-850">
                  Beginning Cash
                </td>
                {monthlyProjections.map(p => (
                  <td key={p.monthIndex} className="py-3 px-6 text-right text-zinc-400 border-r border-zinc-850/20">
                    {formatCurrency(p.startingCash)}
                  </td>
                ))}
              </tr>

              {/* Income */}
              <tr className="bg-emerald-950/5 hover:bg-emerald-950/10 transition-colors font-semibold">
                <td className="py-3 px-4 text-emerald-400 sticky left-0 bg-zinc-900/90 md:bg-zinc-950/90 border-r border-zinc-850">
                  <div className="flex flex-col">
                    <span>Projected Income (+)</span>
                    <span className="text-[9px] font-normal text-emerald-500/70 font-sans">Click any month to override</span>
                  </div>
                </td>
                {monthlyProjections.map(p => {
                  const isOverridden = manualIncomeForecasts[p.monthIndex] !== undefined;
                  const isEditing = editingIncomeMonth === p.monthIndex;
                  return (
                    <td 
                      key={p.monthIndex} 
                      className={`py-3 px-6 text-right border-r border-zinc-850/20 group relative cursor-pointer ${isOverridden ? 'text-accent-gold' : 'text-emerald-400'}`}
                      onClick={() => {
                        if (!isEditing) {
                          setEditingIncomeMonth(p.monthIndex);
                          setEditIncomeValue(String(p.income));
                        }
                      }}
                    >
                      {isEditing ? (
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            const val = parseFloat(editIncomeValue);
                            if (!isNaN(val)) {
                              setManualIncomeForecast(p.monthIndex, val);
                            }
                            setEditingIncomeMonth(null);
                          }}
                          className="flex items-center justify-end gap-1"
                        >
                          <input
                            type="number"
                            value={editIncomeValue}
                            onChange={(e) => setEditIncomeValue(e.target.value)}
                            onBlur={() => setEditingIncomeMonth(null)}
                            autoFocus
                            className="w-20 bg-zinc-950 border border-zinc-700 rounded px-1 py-0.5 text-right text-xs font-mono text-zinc-100 focus:outline-none focus:border-accent-gold"
                          />
                        </form>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {isOverridden && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setManualIncomeForecast(p.monthIndex, null);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-rose-950/40 text-rose-400 rounded transition-opacity"
                              title="Clear manual override"
                            >
                              <span className="text-[10px]">✕</span>
                            </button>
                          )}
                          <span className={isOverridden ? 'font-bold underline decoration-accent-gold/40 underline-offset-4' : ''}>
                            {formatCurrency(p.income)}
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Expense Category rows */}
              {categories.map(cat => (
                <tr key={cat} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-4 pl-8 text-zinc-400 sticky left-0 bg-zinc-900/90 md:bg-zinc-950/90 border-r border-zinc-850">
                    {cat}
                  </td>
                  {monthlyProjections.map(p => (
                    <td key={p.monthIndex} className="py-3 px-6 text-right text-zinc-500 border-r border-zinc-850/20">
                      {formatCurrency(p.categoryBreakdown[cat] || 0)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Total Expenses */}
              <tr className="bg-rose-950/5 hover:bg-rose-950/10 transition-colors font-semibold">
                <td className="py-3 px-4 text-rose-400 sticky left-0 bg-zinc-900/90 md:bg-zinc-950/90 border-r border-zinc-850">
                  Total Expenses (-)
                </td>
                {monthlyProjections.map(p => (
                  <td key={p.monthIndex} className="py-3 px-6 text-right text-rose-400 border-r border-zinc-850/20">
                    {formatCurrency(p.expenses)}
                  </td>
                ))}
              </tr>

              {/* Net savings */}
              <tr className="hover:bg-zinc-900/40 transition-colors font-bold border-t border-zinc-800">
                <td className="py-3.5 px-4 text-zinc-200 sticky left-0 bg-zinc-900/90 md:bg-zinc-950/90 border-r border-zinc-850">
                  Net Savings / Flow
                </td>
                {monthlyProjections.map(p => (
                  <td 
                    key={p.monthIndex} 
                    className={`py-3.5 px-6 text-right border-r border-zinc-850/20 ${
                      p.netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {p.netSavings >= 0 ? '+' : ''}{formatCurrency(p.netSavings)}
                  </td>
                ))}
              </tr>

              {/* Ending Cash */}
              <tr className="bg-zinc-950/90 hover:bg-zinc-900 transition-colors font-bold border-t-2 border-zinc-850">
                <td className="py-4 px-4 text-zinc-100 sticky left-0 bg-zinc-950/95 border-r border-zinc-850">
                  Ending Cash Balance
                </td>
                {monthlyProjections.map(p => (
                  <td 
                    key={p.monthIndex} 
                    className={`py-4 px-6 text-right border-r border-zinc-850/20 ${
                      p.endingCash <= 0 ? 'text-rose-400 animate-pulse' : 'text-accent-gold'
                    }`}
                  >
                    {formatCurrency(p.endingCash)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
