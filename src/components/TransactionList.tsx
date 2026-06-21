import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Search, Filter, Plus, Trash2, ArrowUpDown, Tag, Layers } from 'lucide-react';
import { Transaction } from '../types';

export const TransactionList: React.FC = () => {
  const { 
    transactions, 
    rules, 
    addRule, 
    deleteRule, 
    budgets,
    isDataLoaded,
    addCategory,
    updateTransactionCategory,
    bulkRecategorise
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Rule creator states
  const [newRuleKeyword, setNewRuleKeyword] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('Groceries');
  // Tracks a category we want to select as soon as budgets updates with it
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  
  // Custom Category creation states
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  
  // Sort states
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Click-to-edit: tracks which transaction row is being re-categorised
  const [editingTxId, setEditingTxId] = useState<string | null>(null);

  // Bulk amount-based reclassification state (pre-filled for Applegreen fix)
  const [bulkKeyword, setBulkKeyword] = useState('Applegreen');
  const [bulkFromCategory, setBulkFromCategory] = useState('Subscriptions');
  const [bulkTiers, setBulkTiers] = useState([
    { upTo: '10', category: 'Coffee & Misc.' },
    { upTo: '25', category: 'Groceries' },
    { upTo: '',   category: 'Fuel' },         // empty upTo = catch-all
  ]);
  const [bulkResult, setBulkResult] = useState<number | null>(null);

  const handleBulkApply = () => {
    if (!bulkKeyword.trim()) return;
    const tiers = bulkTiers
      .filter(t => t.category.trim())
      .map(t => ({
        upTo: t.upTo.trim() ? parseFloat(t.upTo) : null,
        category: t.category.trim(),
      }));
    if (tiers.length === 0) return;
    const count = bulkRecategorise(bulkKeyword.trim(), bulkFromCategory, tiers);
    setBulkResult(count);
  };

  const updateBulkTier = (i: number, field: 'upTo' | 'category', value: string) => {
    setBulkTiers(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
    setBulkResult(null);
  };

  // Once a newly-created category lands in budgets, apply the pending selection
  React.useEffect(() => {
    if (pendingCategory && budgets.some(b => b.name === pendingCategory)) {
      setNewRuleCategory(pendingCategory);
      setPendingCategory(null);
    }
  }, [budgets, pendingCategory]);

  const categories = useMemo(() => {
    return ['All', ...budgets.map(b => b.name)];
  }, [budgets]);

  const handleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          return sortDirection === 'desc' 
            ? b.date.localeCompare(a.date) 
            : a.date.localeCompare(b.date);
        } else {
          return sortDirection === 'desc' 
            ? b.amount - a.amount 
            : a.amount - b.amount;
        }
      });
  }, [transactions, searchTerm, selectedCategory, sortField, sortDirection]);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleKeyword.trim()) return;
    addRule(newRuleKeyword.trim(), newRuleCategory);
    setNewRuleKeyword('');
    // Reset to the first available budget category after submission
    if (budgets.length > 0) {
      setNewRuleCategory(budgets[0].name);
    }
  };

  const handleCategoryChange = (txId: string, newCat: string) => {
    updateTransactionCategory(txId, newCat);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (!isDataLoaded) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-zinc-800 text-center space-y-3">
        <p className="text-zinc-400 text-sm">No transactions loaded yet.</p>
        <p className="text-zinc-500 text-xs">Please upload a bank statement CSV or load the demo data in the Setup tab.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Transaction Table */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-zinc-200 text-sm focus:outline-none focus:border-accent-gold"
            />
          </div>
          
          {/* Category Filter */}
          <div className="relative min-w-[150px]">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-zinc-200 text-sm focus:outline-none focus:border-accent-gold appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transactions Table Container */}
        <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/60 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-400 tracking-wider font-mono">
                  <th 
                    onClick={() => handleSort('date')}
                    className="py-3 px-4 cursor-pointer hover:bg-zinc-800/50 select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      Date
                      <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th 
                    onClick={() => handleSort('amount')}
                    className="py-3 px-4 text-right cursor-pointer hover:bg-zinc-800/50 select-none"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Amount
                      <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs">
                {filteredTransactions.map(tx => (
                  <tr
                    key={tx.id}
                    className="hover:bg-zinc-900/40 transition-colors duration-150"
                    onClick={() => setEditingTxId(tx.id)}
                  >
                    <td className="py-3 px-4 text-zinc-400 font-mono whitespace-nowrap">{tx.date}</td>
                    <td className="py-3 px-4 text-zinc-200 font-medium max-w-[200px] truncate" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className="py-1.5 px-4">
                      {editingTxId === tx.id ? (
                        // Active row: render the full select
                        <select
                          autoFocus
                          value={tx.category}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            handleCategoryChange(tx.id, e.target.value);
                            setEditingTxId(null);
                          }}
                          onBlur={() => setEditingTxId(null)}
                          className="text-[10px] font-semibold rounded-full px-2.5 py-0.5 border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/50 bg-zinc-800 text-zinc-200 border-amber-500/50"
                        >
                          {budgets.map(b => (
                            <option key={b.name} value={b.name} className="bg-zinc-900 text-zinc-200">
                              {b.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        // All other rows: lightweight static badge, click the row to activate
                        <span
                          title="Click row to change category"
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer ${
                            tx.category === 'Income'
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30'
                              : tx.category === 'Uncategorized'
                              ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                          }`}
                        >
                          {tx.category}
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                      tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500 font-mono">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-zinc-900/40 px-4 py-2 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono flex justify-between">
            <span>Showing {filteredTransactions.length} of {transactions.length} records</span>
            <span>All values processed client-side</span>
          </div>
        </div>
      </div>

      {/* Rules Manager Sidebar */}
      <div className="space-y-6">
        {/* Rule Creator */}
        <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-accent-gold" />
            Create Category Rule
          </h3>
          <p className="text-xs text-zinc-400">
            Automate future transactions by mapping description keywords to categories. This updates existing transactions retroactively!
          </p>

          <form onSubmit={handleCreateRule} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500">If Description Contains</label>
              <input
                type="text"
                placeholder="e.g. NETFLIX"
                value={newRuleKeyword}
                onChange={(e) => setNewRuleKeyword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-200 text-xs focus:outline-none focus:border-accent-gold"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Assign To Category</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCategory(!isCreatingCategory);
                    setNewCategoryName('');
                    setCategoryError('');
                  }}
                  className="text-[10px] text-accent-gold hover:underline font-semibold flex items-center gap-0.5"
                >
                  {isCreatingCategory ? 'Cancel' : '+ New Category'}
                </button>
              </div>

              {isCreatingCategory ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Category name (e.g. Pet Expenses)"
                      value={newCategoryName}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value);
                        setCategoryError('');
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 px-3 text-zinc-200 text-xs focus:outline-none focus:border-accent-gold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const name = newCategoryName.trim();
                        if (!name) {
                          setCategoryError('Category name cannot be empty');
                          return;
                        }
                        if (budgets.some(b => b.name.toLowerCase() === name.toLowerCase())) {
                          setCategoryError('Category already exists');
                          return;
                        }
                        addCategory(name);
                        // Queue the selection — budgets won't have the new entry yet
                        // (state update is async). The useEffect above will apply it
                        // once the category appears in the budgets list.
                        setPendingCategory(name);
                        setIsCreatingCategory(false);
                        setNewCategoryName('');
                      }}
                      className="px-3 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/50 text-zinc-200 rounded-xl text-xs font-semibold"
                    >
                      Create
                    </button>
                  </div>
                  {categoryError && (
                    <p className="text-[10px] text-rose-400 font-mono">{categoryError}</p>
                  )}
                </div>
              ) : (
                <select
                  value={newRuleCategory}
                  onChange={(e) => setNewRuleCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-200 text-xs focus:outline-none focus:border-accent-gold appearance-none cursor-pointer"
                >
                  {budgets.map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all duration-300"
            >
              <Plus className="w-3.5 h-3.5" />
              Apply Rule
            </button>
          </form>
        </div>

        {/* Existing Rules List */}
        <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300">
            Active Rules ({rules.length})
          </h3>
          <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
            {rules.map(rule => (
              <div 
                key={rule.id}
                className="flex items-center justify-between p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800/60 text-xs"
              >
                <div className="space-y-0.5 truncate">
                  <span className="font-mono font-semibold text-zinc-300">"{rule.keyword}"</span>
                  <div className="text-[10px] text-zinc-500 font-medium">Maps to: {rule.category}</div>
                </div>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-all duration-200"
                  title="Delete rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {rules.length === 0 && (
              <p className="text-[10px] text-zinc-500 font-mono text-center py-4">No rules created yet.</p>
            )}
          </div>
        </div>
        {/* Amount-Based Bulk Rules */}
        <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-accent-gold" />
            Amount-Based Rules
          </h3>
          <p className="text-xs text-zinc-400">
            Reclassify a vendor's transactions by spend amount. Only affects the selected source category.
          </p>

          <div className="space-y-3">
            {/* Vendor keyword */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Vendor Keyword</label>
              <input
                type="text"
                value={bulkKeyword}
                onChange={e => { setBulkKeyword(e.target.value); setBulkResult(null); }}
                placeholder="e.g. Applegreen"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-200 text-xs focus:outline-none focus:border-accent-gold"
              />
            </div>

            {/* Source category */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Only From Category</label>
              <select
                value={bulkFromCategory}
                onChange={e => { setBulkFromCategory(e.target.value); setBulkResult(null); }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-200 text-xs focus:outline-none focus:border-accent-gold appearance-none cursor-pointer"
              >
                {budgets.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
            </div>

            {/* Tiers */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Amount Tiers</label>
              <div className="space-y-1.5">
                {bulkTiers.map((tier, i) => (
                  <div key={i} className="flex gap-1.5 items-center">
                    <span className="text-[10px] text-zinc-500 w-5 text-right">{i + 1}.</span>
                    {i < bulkTiers.length - 1 ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-zinc-500">≤ €</span>
                        <input
                          type="number"
                          value={tier.upTo}
                          onChange={e => updateBulkTier(i, 'upTo', e.target.value)}
                          className="w-14 bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-2 text-zinc-200 text-xs focus:outline-none focus:border-accent-gold"
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-500 w-[68px] text-center">above →</span>
                    )}
                    <select
                      value={tier.category}
                      onChange={e => updateBulkTier(i, 'category', e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-2 text-zinc-200 text-xs focus:outline-none focus:border-accent-gold appearance-none cursor-pointer"
                    >
                      <option value="">-- pick --</option>
                      {budgets.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleBulkApply}
              className="w-full py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all duration-300"
            >
              <Layers className="w-3.5 h-3.5" />
              Apply to Matching Transactions
            </button>

            {bulkResult !== null && (
              <p className={`text-[10px] font-mono text-center ${
                bulkResult > 0 ? 'text-emerald-400' : 'text-zinc-500'
              }`}>
                {bulkResult > 0
                  ? `✓ ${bulkResult} transaction${bulkResult !== 1 ? 's' : ''} updated`
                  : 'No matching transactions found in that category'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
