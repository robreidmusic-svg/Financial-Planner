import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Search, Filter, Plus, Trash2, ArrowUpDown, Tag, PlusCircle } from 'lucide-react';
import { Transaction } from '../types';

export const TransactionList: React.FC = () => {
  const { 
    transactions, 
    rules, 
    addRule, 
    deleteRule, 
    budgets,
    isDataLoaded,
    addCategory
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Rule creator states
  const [newRuleKeyword, setNewRuleKeyword] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('Groceries');
  
  // Custom Category creation states
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  
  // Sort states
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
  };

  const handleCategoryChange = (txId: string, newCat: string) => {
    // Manually override transaction category in local state (which will update context & localStorage)
    // We can expose an action in Context or edit transactions list directly.
    // In our context we have `transactions` state. Let's make sure we can update a single transaction category.
    // Wait! Let's check what actions are exposed in FinanceContextType.
    // We did not explicitly expose a `setTransactions` in the context, but let's check:
    // Actually, in `FinanceContext` we can edit a transaction by adding a rule, but manual category changes are also useful.
    // Let's add support for manual overrides or rule updates.
    // Since we want manual categorization overrides, let's create a temporary rule or just update the transaction category.
    // Wait, let's check how we can do it. If we add a rule for the specific description, it will auto-update all of them.
    // Let's let the user just create a rule! That is extremely clean and matches "local-first rule engine".
    // If they change category, we can add a rule for that exact description! Let's do that!
    addRule(txId, newCat);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2
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
                  <tr key={tx.id} className="hover:bg-zinc-900/40 transition-colors duration-150">
                    <td className="py-3 px-4 text-zinc-400 font-mono whitespace-nowrap">{tx.date}</td>
                    <td className="py-3 px-4 text-zinc-200 font-medium max-w-[200px] truncate" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        tx.category === 'Income' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' :
                        tx.category === 'Uncategorized' ? 'bg-zinc-800 text-zinc-400' :
                        'bg-zinc-900 text-zinc-300 border border-zinc-800'
                      }`}>
                        {tx.category}
                      </span>
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
                        setNewRuleCategory(name); // Auto-select the newly created category
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
      </div>
    </div>
  );
};
