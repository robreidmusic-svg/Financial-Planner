import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ShieldCheck, ShieldAlert, Sparkles, TrendingUp, Pencil, Trash2, Check, X, PiggyBank } from 'lucide-react';

export const BudgetEditor: React.FC = () => {
  const { budgets, categoryAverages, updateBudget, isDataLoaded, deleteCategory, renameCategory, savingsGoals } = useFinance();
  
  // Inline rename states
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [editNewName, setEditNewName] = useState('');

  const totalSavingsCommitment = React.useMemo(() => {
    const currentMonth = new Date();
    const projMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    let total = 0;
    savingsGoals.forEach(g => {
      if (g.targetDate <= projMonthKey) return;
      const [tYear, tMonth] = g.targetDate.split('-').map(Number);
      const targetDateObj = new Date(tYear, tMonth - 1, 1);
      const monthsLeft = Math.max(1, (targetDateObj.getFullYear() - currentMonth.getFullYear()) * 12 + (targetDateObj.getMonth() - currentMonth.getMonth()));
      total += Math.round(g.targetAmount / monthsLeft);
    });
    return total;
  }, [savingsGoals]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleSliderChange = (catName: string, value: number) => {
    updateBudget(catName, value);
  };

  // Split into Income and Expense categories
  const incomeCategory = budgets.find(b => b.name === 'Income');
  const expenseCategories = budgets.filter(b => b.name !== 'Income' && b.name !== 'Uncategorized');

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Top Banner Context */}
      <div className="glass-card p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300">Set Monthly Budget Baseline</h3>
          <p className="text-xs text-zinc-400">
            Establish baseline limits for your spending. These targets form the base structure of your projection forecast.
          </p>
        </div>
        {!isDataLoaded && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-955/40 border border-amber-900/30 text-amber-400 rounded-full text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            No statements loaded: Using default guidelines
          </span>
        )}
        {isDataLoaded && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-955/40 border border-emerald-900/30 text-emerald-400 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Comparing against statements
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Modeling Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Monthly Income Base
            </h4>
            
            {incomeCategory && (
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-semibold text-zinc-200">{incomeCategory.name}</span>
                  <div className="text-right">
                    <span className="text-xs text-zinc-550 block">Baseline Target</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {formatCurrency(incomeCategory.limit)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="15000"
                    step="100"
                    value={incomeCategory.limit}
                    onChange={(e) => handleSliderChange('Income', Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-550 font-mono">
                    <span>€0</span>
                    <span>€15,000</span>
                  </div>
                </div>

                {isDataLoaded && (
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Statement Avg Income:</span>
                      <span className="font-mono text-zinc-300 font-semibold">
                        {formatCurrency(categoryAverages['Income'] || 0)}/mo
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Expenses Modeling Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Monthly Expense Limits
            </h4>

            {savingsGoals.length > 0 && (
              <div className="bg-accent-gold/10 border border-accent-gold/20 p-4 rounded-xl flex items-start gap-3">
                <PiggyBank className="w-5 h-5 text-accent-gold shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-accent-gold uppercase tracking-wider">Savings Commitment</h5>
                  <p className="text-xs text-zinc-300 mt-1">
                    Your active savings goals require a total commitment of <strong>€{totalSavingsCommitment}/mo</strong>.
                    Ensure your <span className="font-mono text-zinc-400">Transfers to Savings</span> budget limit matches or exceeds this to maintain your forecast accuracy.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {expenseCategories.map(cat => {
                const actualAvg = categoryAverages[cat.name] || 0;
                const isOverBudget = isDataLoaded && actualAvg > cat.limit && cat.limit > 0;
                
                return (
                  <div key={cat.name} className="space-y-2 pb-4 border-b border-zinc-800/40 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center gap-4">
                      <div className="space-y-0.5 text-left flex-1 min-w-0">
                        {editingCategoryName === cat.name ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (editNewName.trim() && editNewName.trim() !== cat.name) {
                                renameCategory(cat.name, editNewName.trim());
                              }
                              setEditingCategoryName(null);
                            }}
                            className="flex items-center gap-1.5"
                          >
                            <input
                              type="text"
                              value={editNewName}
                              onChange={(e) => setEditNewName(e.target.value)}
                              className="bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-2 text-zinc-200 text-xs focus:outline-none focus:border-accent-gold"
                              autoFocus
                              required
                            />
                            <button
                              type="submit"
                              className="p-1 text-emerald-450 hover:text-emerald-400 hover:bg-zinc-800 rounded-md transition-colors"
                              title="Save Category Name"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategoryName(null)}
                              className="p-1 text-zinc-450 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                              title="Cancel Edit"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-zinc-200 truncate max-w-[150px] sm:max-w-xs">{cat.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryName(cat.name);
                                setEditNewName(cat.name);
                              }}
                              className="p-1 text-zinc-550 hover:text-zinc-300 rounded-md transition-colors"
                              title="Rename Category"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete the "${cat.name}" category? Any transactions in this category will be reset to "Uncategorized", and triggers for this category will be deleted.`)) {
                                  deleteCategory(cat.name);
                                }
                              }}
                              className="p-1 text-zinc-550 hover:text-rose-450 rounded-md transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {isDataLoaded && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Avg Spent: {formatCurrency(actualAvg)}/mo
                            </span>
                            {isOverBudget && (
                              <span className="text-[9px] px-1.5 bg-rose-955/50 border border-rose-900/30 text-rose-400 rounded-md font-semibold font-mono animate-pulse">
                                Overspent by {formatCurrency(actualAvg - cat.limit)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-zinc-550 block">Budget Limit</span>
                        <input
                          type="number"
                          value={cat.limit}
                          onChange={(e) => handleSliderChange(cat.name, Number(e.target.value))}
                          className="w-20 bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-2 text-right text-xs font-bold font-mono text-zinc-100 focus:outline-none focus:border-accent-gold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <input
                        type="range"
                        min="0"
                        max="4000"
                        step="50"
                        value={cat.limit}
                        onChange={(e) => handleSliderChange(cat.name, Number(e.target.value))}
                        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none ${
                          isOverBudget 
                            ? 'bg-rose-955 accent-rose-400' 
                            : 'bg-zinc-800 accent-accent-gold'
                        }`}
                      />
                      <div className="flex justify-between text-[9px] text-zinc-550 font-mono">
                        <span>€0</span>
                        <span>€4,000</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
