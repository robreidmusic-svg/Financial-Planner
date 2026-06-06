import React, { useState, useEffect, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { Plus, Trash2, Calendar, AlertCircle, TrendingUp, TrendingDown, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react';
import { FutureEvent } from '../types';

export const Forecaster: React.FC = () => {
  const { 
    monthlyProjections, 
    futureEvents, 
    addFutureEvent, 
    deleteFutureEvent, 
    toggleFutureEvent,
    budgets,
    categoryAverages,
  } = useFinance();

  const [isMounted, setIsMounted] = useState(false);
  const [chartType, setChartType] = useState<'cash' | 'flows'>('cash');
  const [showBasis, setShowBasis] = useState(false);
  
  // Future Event Form State
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [monthOffset, setMonthOffset] = useState('1'); // 1-indexed for UI, converted to 0-indexed in code
  const [eventType, setEventType] = useState<FutureEvent['type']>('one-time-expense');
  const [category, setCategory] = useState('Shopping');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !amount) return;

    addFutureEvent({
      label: label.trim(),
      amount: Math.abs(parseFloat(amount)),
      monthOffset: parseInt(monthOffset) - 1, // 0-indexed offset
      type: eventType,
      category
    });

    setLabel('');
    setAmount('');
  };

  const currentMonthLabel = (offset: number) => {
    const baseDate = new Date();
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  if (!isMounted) {
    return (
      <div className="h-[350px] bg-zinc-900/30 rounded-2xl border border-zinc-800 flex items-center justify-center">
        <p className="text-zinc-500 font-mono text-xs">Loading projection engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Chart Panel */}
      <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/40 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300">24-Month Forecast Projection</h3>
            <p className="text-xs text-zinc-400">
              Interactive timeline showing future balances incorporating budgets, adjusters, and events.
            </p>
          </div>
          
          {/* Chart Toggle */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs font-mono font-semibold">
            <button
              onClick={() => setChartType('cash')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartType === 'cash' ? 'bg-zinc-850 text-accent-gold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Cash Balance
            </button>
            <button
              onClick={() => setChartType('flows')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartType === 'flows' ? 'bg-zinc-850 text-accent-gold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Cash Flow
            </button>
          </div>
        </div>

        {/* Recharts Wrapper */}
        <div className="h-[320px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'cash' ? (
              <AreaChart data={monthlyProjections} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent-gold)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--color-accent-gold)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                <XAxis 
                  dataKey="monthLabel" 
                  stroke="#52525b" 
                  fontSize={10} 
                  fontFamily="var(--font-mono)"
                  tickLine={false}
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10} 
                  fontFamily="var(--font-mono)" 
                  tickLine={false}
                  tickFormatter={(val) => `€${val.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  labelStyle={{ color: '#fbbf24', fontWeight: 'bold', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                  itemStyle={{ color: '#f4f4f5', fontSize: '12px' }}
                  formatter={(val: any) => [formatCurrency(Number(val || 0)), 'Projected Cash']}
                />
                <Area 
                  type="monotone" 
                  dataKey="endingCash" 
                  stroke="var(--color-accent-gold)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCash)" 
                />
              </AreaChart>
            ) : (
              <BarChart data={monthlyProjections} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                <XAxis 
                  dataKey="monthLabel" 
                  stroke="#52525b" 
                  fontSize={10} 
                  fontFamily="var(--font-mono)"
                  tickLine={false}
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10} 
                  fontFamily="var(--font-mono)" 
                  tickLine={false}
                  tickFormatter={(val) => `€${val.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  labelStyle={{ color: '#fbbf24', fontWeight: 'bold', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(val: any) => [formatCurrency(Number(val || 0)), Number(val || 0) >= 0 ? 'Net Inflow' : 'Net Burn']}
                />
                <Bar 
                  dataKey="netSavings" 
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                >
                  {monthlyProjections.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.netSavings >= 0 ? 'var(--color-accent-sage)' : 'var(--color-accent-rose)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Form Creator */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-accent-gold" />
              Add Adjuster Event
            </h3>
            <p className="text-xs text-zinc-400">
              Inject one-time purchases, salary increases, performance bonuses, or new subscriptions to test forecast sensitivity.
            </p>

            <form onSubmit={handleAddEventSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Event Label</label>
                <input
                  type="text"
                  placeholder="e.g. Europe Trip, Tax Refund"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-200 text-xs focus:outline-none focus:border-accent-gold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Amount (€)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-200 text-xs focus:outline-none focus:border-accent-gold font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Month Timeline</label>
                  <select
                    value={monthOffset}
                    onChange={(e) => setMonthOffset(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-200 text-xs focus:outline-none focus:border-accent-gold appearance-none cursor-pointer"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i + 1}>
                        Month {i + 1} ({currentMonthLabel(i)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Event Class</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as FutureEvent['type'])}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-200 text-xs focus:outline-none focus:border-accent-gold appearance-none cursor-pointer"
                >
                  <option value="one-time-expense">One-Time Expense</option>
                  <option value="one-time-income">One-Time Income</option>
                  <option value="recurring-expense">Recurring Expense (Starts here)</option>
                  <option value="recurring-income">Recurring Income (Starts here)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Budget Category Map</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-200 text-xs focus:outline-none focus:border-accent-gold appearance-none cursor-pointer"
                >
                  {budgets.map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all duration-300"
              >
                <Plus className="w-3.5 h-3.5" />
                Inject Adjuster
              </button>
            </form>
          </div>
        </div>

        {/* Future Events Manager List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4 h-full min-h-[350px]">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300">
              Active Adjusters ({futureEvents.length})
            </h3>
            
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {futureEvents.map(event => {
                const isExpense = event.type.includes('expense');
                return (
                  <div 
                    key={event.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      event.isActive 
                        ? 'bg-zinc-900/60 border-zinc-800' 
                        : 'bg-zinc-900/20 border-zinc-900/40 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Toggle status */}
                      <button 
                        onClick={() => toggleFutureEvent(event.id)}
                        className="text-zinc-500 hover:text-zinc-300"
                        title={event.isActive ? "Deactivate" : "Activate"}
                      >
                        {event.isActive ? (
                          <ToggleRight className="w-6 h-6 text-accent-gold" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </button>
                      
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-zinc-200">{event.label}</span>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono font-medium">
                          <span className="capitalize">{event.type.replace('-', ' ')}</span>
                          <span>•</span>
                          <span>Starts Mo. {event.monthOffset + 1} ({currentMonthLabel(event.monthOffset)})</span>
                          <span>•</span>
                          <span>Category: {event.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold font-mono ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isExpense ? '-' : '+'}{formatCurrency(event.amount)}
                      </span>
                      <button
                        onClick={() => deleteFutureEvent(event.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors duration-250"
                        title="Delete adjuster"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {futureEvents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500 space-y-2 border border-dashed border-zinc-800/80 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-zinc-600" />
                  <p className="text-xs font-mono">No adjusters loaded in model.</p>
                  <p className="text-[10px] text-zinc-600">Add an event on the left to start sandbox modeling.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Projection Basis breakdown ── */}
      <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden">
        <button
          id="projection-basis-toggle"
          onClick={() => setShowBasis(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-zinc-900/40 transition-colors"
        >
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">Projection Basis</span>
            <p className="text-[10px] text-zinc-600 mt-0.5">Exact income &amp; expense values the engine uses each month</p>
          </div>
          {showBasis ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </button>

        {showBasis && monthlyProjections[0] && (() => {
          const m0 = monthlyProjections[0];
          const breakdown = Object.entries(m0.categoryBreakdown)
            .map(([name, value]) => ({ name, value: Math.round(value as number) }))
            .filter(e => e.value > 0)
            .sort((a, b) => b.value - a.value);
          const totalExpenses = breakdown.reduce((s, e) => s + e.value, 0);

          return (
            <div className="px-6 pb-6 space-y-3">
              {/* Income row */}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                <span className="text-xs font-semibold text-emerald-400">Monthly Income (projected)</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">+{new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(m0.income)}</span>
              </div>

              {/* Column headers */}
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-600 px-3 pt-1">
                <span>Expense Category</span>
                <span>Monthly (projected)</span>
              </div>

              {/* Expense rows */}
              <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                {breakdown.map(item => {
                  const pct = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
                  const isLarge = pct > 20;
                  return (
                    <div key={item.name} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-zinc-900/40 transition-colors">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className="h-1 rounded-full shrink-0"
                          style={{ width: `${Math.max(pct, 2)}%`, maxWidth: '80px', backgroundColor: isLarge ? '#f43f5e' : '#52525b' }}
                        />
                        <span className={`text-xs truncate ${isLarge ? 'text-rose-300 font-semibold' : 'text-zinc-400'}`}>{item.name}</span>
                        {isLarge && <span className="text-[9px] font-bold text-rose-500 bg-rose-950/40 px-1.5 py-0.5 rounded-full shrink-0">HIGH</span>}
                      </div>
                      <span className={`font-mono text-xs font-semibold ml-4 shrink-0 ${isLarge ? 'text-rose-400' : 'text-zinc-300'}`}>
                        -{new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(item.value)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Total footer */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800 px-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Monthly Expenses</span>
                <span className="font-mono font-bold text-rose-400">
                  -{new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(totalExpenses)}
                </span>
              </div>
              <div className="flex items-center justify-between px-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Net</span>
                <span className={`font-mono font-bold text-sm ${m0.netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {m0.netSavings >= 0 ? '+' : ''}{new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(m0.netSavings)}
                </span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
