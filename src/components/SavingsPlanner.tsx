import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis, ReferenceLine } from 'recharts';
import { Plus, Target, TrendingUp, PiggyBank, Trash2, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

export const SavingsPlanner: React.FC = () => {
  const { savingsGoals, addSavingsGoal, deleteSavingsGoal, updateBudget, transactions, budgets } = useFinance();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCategory, setNewCategory] = useState('Transfers to Savings');

  // Helper to format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newTarget || !newDate) return;
    addSavingsGoal({
      name: newName.trim(),
      targetAmount: Number(newTarget),
      targetDate: newDate,
      linkedCategory: newCategory,
      color: '' // auto-assigned
    });
    setShowAddForm(false);
    setNewName('');
    setNewTarget('');
    setNewDate('');
    setNewCategory('Transfers to Savings');
  };

  const totalCommittedSavings = useMemo(() => {
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

  const existingCategories = useMemo(() => {
    return budgets.filter(b => b.name !== 'Income' && b.name !== 'Uncategorized').map(b => b.name);
  }, [budgets]);

  const savingsLimit = budgets.find(b => b.name === 'Transfers to Savings')?.limit || 0;

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-accent-gold" /> Savings Planner
          </h3>
          <p className="text-xs text-zinc-400 mt-1">Set targets and track your progress against actual statement history.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add New Goal
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddGoal} className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4 bg-zinc-950/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1 uppercase tracking-wider">Goal Name</label>
              <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Holiday Fund" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-100 focus:outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1 uppercase tracking-wider">Target Amount (€)</label>
              <input type="number" required min="1" value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="5000" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-100 focus:outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1 uppercase tracking-wider">Target Date (Month)</label>
              <input type="month" required value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-100 focus:outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1 uppercase tracking-wider">Linked Category</label>
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-100 focus:outline-none focus:border-accent-gold">
                <option value="Transfers to Savings">Transfers to Savings</option>
                {existingCategories.filter(c => c !== 'Transfers to Savings').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors">Create Goal</button>
          </div>
        </form>
      )}

      {savingsGoals.length === 0 ? (
        <div className="text-center py-16 border border-zinc-800/50 rounded-2xl border-dashed">
          <Target className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <h4 className="text-zinc-300 font-semibold mb-1">No Active Savings Goals</h4>
          <p className="text-zinc-500 text-sm">Create a goal to start forecasting your savings journey.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {savingsGoals.map(goal => {
            const currentMonth = new Date();
            const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
            const isCompleted = currentMonthKey >= goal.targetDate;
            
            let monthsLeft = 1;
            if (!isCompleted) {
              const [tYear, tMonth] = goal.targetDate.split('-').map(Number);
              const targetDateObj = new Date(tYear, tMonth - 1, 1);
              monthsLeft = Math.max(1, (targetDateObj.getFullYear() - currentMonth.getFullYear()) * 12 + (targetDateObj.getMonth() - currentMonth.getMonth()));
            }
            const monthlyContrib = Math.round(goal.targetAmount / monthsLeft);

            // Compute actuals from transactions
            let actualSaved = 0;
            const monthlyActuals: Record<string, number> = {};
            let earliestMonthStr = currentMonthKey;
            
            transactions.forEach(tx => {
              if (tx.category === goal.linkedCategory && tx.amount < 0) { // Assuming savings transfer is an expense
                const m = tx.date.substring(0, 7);
                if (m < earliestMonthStr) earliestMonthStr = m;
                monthlyActuals[m] = (monthlyActuals[m] || 0) + Math.abs(tx.amount);
                actualSaved += Math.abs(tx.amount);
              }
            });

            // Build chart data
            const chartData = [];
            let [sYear, sMonth] = earliestMonthStr.split('-').map(Number);
            let [eYear, eMonth] = goal.targetDate.split('-').map(Number);
            const startD = new Date(sYear, sMonth - 1, 1);
            const endD = new Date(eYear, eMonth - 1, 1);
            
            let totalMonths = (endD.getFullYear() - startD.getFullYear()) * 12 + (endD.getMonth() - startD.getMonth());
            if (totalMonths <= 0) totalMonths = 1;

            let runningActual = 0;
            for (let i = 0; i <= totalMonths; i++) {
              const d = new Date(startD.getFullYear(), startD.getMonth() + i, 1);
              const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              
              if (mKey <= currentMonthKey) {
                runningActual += (monthlyActuals[mKey] || 0);
              }
              
              const plannedProg = Math.round((i / totalMonths) * goal.targetAmount);
              
              chartData.push({
                month: mKey,
                planned: plannedProg,
                actual: mKey <= currentMonthKey ? runningActual : null
              });
            }

            const currentPlanned = chartData.find(d => d.month === currentMonthKey)?.planned || 0;
            const isBehind = actualSaved < currentPlanned * 0.95 && !isCompleted;
            const isOnTrack = actualSaved >= currentPlanned && !isCompleted;
            const isFinished = actualSaved >= goal.targetAmount;

            return (
              <div key={goal.id} className={`glass-card p-6 rounded-2xl border ${isFinished ? 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-zinc-800'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goal.color }} />
                    <h3 className="text-lg font-bold text-zinc-100">{goal.name}</h3>
                    {isFinished ? (
                      <span className="px-2 py-0.5 bg-emerald-950/50 text-emerald-400 text-[10px] uppercase tracking-wider rounded font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Complete</span>
                    ) : isBehind ? (
                      <span className="px-2 py-0.5 bg-rose-950/50 text-rose-400 text-[10px] uppercase tracking-wider rounded font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Behind Target</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-zinc-800/50 text-zinc-400 text-[10px] uppercase tracking-wider rounded font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3"/> On Track</span>
                    )}
                  </div>
                  <button onClick={() => deleteSavingsGoal(goal.id)} className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-zinc-900" title="Delete Goal">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Target</span>
                    <span className="text-lg font-mono font-bold text-zinc-200">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Saved</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">{formatCurrency(actualSaved)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Remaining</span>
                    <span className="text-lg font-mono font-bold text-zinc-400">{formatCurrency(Math.max(0, goal.targetAmount - actualSaved))}</span>
                  </div>
                  <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
                    <span className="block text-[10px] uppercase tracking-widest text-accent-gold mb-1">Required / Mo</span>
                    <span className="text-lg font-mono font-bold text-accent-gold">{formatCurrency(monthlyContrib)}</span>
                  </div>
                  <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-1">Months Left</span>
                    <span className="text-lg font-mono font-bold text-zinc-200">{isCompleted ? 0 : monthsLeft}</span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`colorActual-${goal.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={goal.color} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={goal.color} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#52525b" fontSize={10} tickMargin={10} />
                      <YAxis stroke="#52525b" fontSize={10} tickFormatter={(val) => `€${val}`} width={60} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#e4e4e7' }}
                      />
                      <Area type="monotone" dataKey="planned" stroke="#71717a" strokeDasharray="4 4" fill="transparent" name="Planned" />
                      <Area type="monotone" dataKey="actual" stroke={goal.color} strokeWidth={2} fill={`url(#colorActual-${goal.id})`} name="Actual Saved" />
                      <ReferenceLine y={goal.targetAmount} stroke="#22c55e" strokeDasharray="3 3" opacity={0.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budget Integration Section */}
      <div className="glass-card p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <h4 className="text-sm font-bold tracking-wider text-zinc-200 uppercase mb-2">Budget Integration</h4>
            <p className="text-xs text-zinc-400">
              Your combined savings goal commitment is currently <strong className="text-accent-gold">{formatCurrency(totalCommittedSavings)}</strong>/month.
              Adjust the slider below to officially allocate this within your Monthly Budget Setup, ensuring your Forecast engine correctly deducts it from your available runway.
            </p>
          </div>
          <div className="w-full md:w-1/3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
             <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Savings Limit</span>
                <span className="text-sm font-mono font-bold text-accent-gold">{formatCurrency(savingsLimit)}</span>
             </div>
             <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={savingsLimit}
                onChange={(e) => updateBudget('Transfers to Savings', Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent-gold focus:outline-none"
             />
             <div className="flex justify-between text-[10px] text-zinc-600 mt-2 font-mono">
                <span>€0</span>
                <span>€5,000</span>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};
