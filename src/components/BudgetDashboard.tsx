import React, { useState, useEffect, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { KPIGrid } from './KPIGrid';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';

export const BudgetDashboard: React.FC = () => {
  const { categoryAverages, budgets, isDataLoaded } = useFinance();
  const [isMounted, setIsMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Spending breakdown — exclude Income & Uncategorized
  const pieData = useMemo(() => {
    return Object.entries(categoryAverages)
      .filter(([name, value]) => name !== 'Income' && name !== 'Uncategorized' && value > 0)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [categoryAverages]);

  const totalSpend = useMemo(() => pieData.reduce((sum, d) => sum + d.value, 0), [pieData]);

  // Budget vs Actual bar chart data
  const comparisonData = useMemo(() => {
    return budgets
      .filter(b => b.name !== 'Income' && b.name !== 'Uncategorized')
      .map(b => ({
        name: b.name,
        Budget: Math.round(b.limit),
        Actual: Math.round(categoryAverages[b.name] || 0)
      }));
  }, [budgets, categoryAverages]);

  // Extended palette — handles many categories without repeating too soon
  const COLORS = [
    '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6',
    '#38bdf8', '#fb923c', '#2dd4bf', '#f472b6',
    '#94a3b8', '#a3e635', '#60a5fa', '#fbbf24',
    '#34d399', '#c084fc', '#fb7185', '#22d3ee',
    '#facc15', '#4ade80',
  ];

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="h-[120px] bg-zinc-900/30 rounded-2xl border border-zinc-800 animate-pulse" />
        <div className="h-[420px] bg-zinc-900/30 rounded-2xl border border-zinc-800 animate-pulse" />
        <div className="h-[280px] bg-zinc-900/30 rounded-2xl border border-zinc-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <KPIGrid />

      {isDataLoaded ? (
        <div className="space-y-6">

          {/* ── Spending Distribution — full-width panel ── */}
          <div className="glass-card p-6 rounded-2xl border border-zinc-800">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-zinc-400 mb-6">
              Spending Distribution (Monthly Actuals)
            </h3>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

              {/* Large donut — no inline labels */}
              <div
                className="w-full lg:w-[360px] shrink-0 flex items-center justify-center relative"
                style={{ height: 360 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={162}
                      paddingAngle={2}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                      strokeWidth={0}
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          opacity={activeIndex === null || activeIndex === index ? 1 : 0.28}
                          style={{ cursor: 'pointer', transition: 'opacity 0.18s ease' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #3f3f46',
                        borderRadius: '12px',
                        padding: '10px 14px'
                      }}
                      itemStyle={{ color: '#f4f4f5', fontSize: '13px' }}
                      formatter={(val: any) => [formatCurrency(Number(val || 0)), 'Avg / month']}
                      labelStyle={{ color: '#a1a1aa', fontSize: '11px', marginBottom: 4 }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centre label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Monthly</span>
                  <span className="text-2xl font-bold font-mono text-zinc-100 mt-0.5">
                    {formatCurrency(totalSpend)}
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">{pieData.length} categories</span>
                </div>
              </div>

              {/* Right-side legend list */}
              <div className="flex-1 flex flex-col min-w-0">

                {/* Column headers */}
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500 pb-2 border-b border-zinc-800 mb-1 pr-1">
                  <span>Category</span>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:block w-20 text-right">Distribution</span>
                    <span className="w-20 text-right">Avg / Month</span>
                  </div>
                </div>

                {/* Scrollable rows */}
                <div
                  className="overflow-y-auto space-y-0 pr-1"
                  style={{ maxHeight: 300 }}
                >
                  {pieData.map((item, index) => {
                    const pct = totalSpend > 0 ? (item.value / totalSpend) * 100 : 0;
                    const isActive = activeIndex === index;
                    const color = COLORS[index % COLORS.length];
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg transition-all duration-150 cursor-default group"
                        style={{ backgroundColor: isActive ? `${color}1a` : 'transparent' }}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {/* Swatch + full name */}
                        <div className="flex items-center gap-2 flex-1" style={{ minWidth: 0 }}>
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-150"
                            style={{
                              backgroundColor: color,
                              transform: isActive ? 'scale(1.4)' : 'scale(1)'
                            }}
                          />
                          <span
                            className="text-xs leading-tight transition-colors duration-150"
                            style={{ color: isActive ? '#f4f4f5' : '#d4d4d8' }}
                          >
                            {item.name}
                          </span>
                        </div>

                        {/* Mini bar + % + amount */}
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          {/* Progress bar + % */}
                          <div className="hidden sm:flex items-center gap-1.5 w-20">
                            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(pct, 100)}%`,
                                  backgroundColor: color,
                                  opacity: 0.85,
                                  transition: 'width 0.4s ease'
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 w-8 text-right">
                              {pct.toFixed(1)}%
                            </span>
                          </div>

                          {/* Amount */}
                          <span
                            className="font-mono font-semibold text-xs w-20 text-right"
                            style={{ color: isActive ? color : '#e4e4e7' }}
                          >
                            {formatCurrency(item.value)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grand total footer */}
                <div className="mt-4 pt-3 border-t border-zinc-700 flex items-center justify-between pr-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Total Monthly Outgoings
                    </span>
                    <span className="text-[10px] text-zinc-600 mt-0.5">avg across all categories</span>
                  </div>
                  <span className="font-mono font-bold text-xl text-amber-400">
                    {formatCurrency(totalSpend)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget vs Actual bar chart */}
          <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
              Budget Target vs. Historical Actual
            </h3>
            <div className="h-[260px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    stroke="#52525b"
                    fontSize={9}
                    fontFamily="var(--font-mono)"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#52525b"
                    fontSize={9}
                    fontFamily="var(--font-mono)"
                    tickLine={false}
                    tickFormatter={(val) => `€${val}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    labelStyle={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ fontSize: '12px' }}
                    formatter={(val: any) => [formatCurrency(Number(val || 0)), '']}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconSize={10}
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                  />
                  <Bar dataKey="Budget" fill="var(--color-border)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Actual" fill="var(--color-accent-gold)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl border border-zinc-800 text-center max-w-xl mx-auto space-y-4">
          <Info className="w-8 h-8 text-zinc-500 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-300">Financial Workspace Ready</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Upload your bank transaction statements under the Setup tab to see your historical averages, category distribution, and evaluate budget vs actual parameters!
          </p>
        </div>
      )}
    </div>
  );
};
