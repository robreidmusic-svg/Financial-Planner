import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TrendingUp, TrendingDown, Clock, ShieldAlert, PiggyBank, Percent } from 'lucide-react';

export const KPIGrid: React.FC = () => {
  const { initialCash, monthlyProjections, transactions } = useFinance();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Month-on-month delta: compare last two completed calendar months from actual transactions
  const monthlySavingsDelta = useMemo(() => {
    const EXCLUDED = new Set(['Spare Change Transfers', 'Pocket Transfers', 'Transfers to Savings', 'Credit Card Payment']);
    const byMonth: Record<string, { income: number; spend: number }> = {};

    transactions.forEach(tx => {
      if (EXCLUDED.has(tx.category)) return;
      const mk = tx.date.substring(0, 7);
      if (!byMonth[mk]) byMonth[mk] = { income: 0, spend: 0 };
      if (tx.category === 'Income' && tx.amount > 0) {
        byMonth[mk].income += tx.amount;
      } else if (tx.category !== 'Income' && tx.amount < 0) {
        byMonth[mk].spend += Math.abs(tx.amount);
      }
    });

    const now = new Date();
    const lastKey = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);
    const prevKey = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 7);

    const lastNet = byMonth[lastKey] ? byMonth[lastKey].income - byMonth[lastKey].spend : null;
    const prevNet = byMonth[prevKey] ? byMonth[prevKey].income - byMonth[prevKey].spend : null;

    return lastNet !== null && prevNet !== null ? Math.round(lastNet - prevNet) : null;
  }, [transactions]);

  const stats = useMemo(() => {
    const endingCash = monthlyProjections[monthlyProjections.length - 1]?.endingCash || 0;

    const totalNetSavings = monthlyProjections.reduce((sum, p) => sum + p.netSavings, 0);
    const avgNetSavings = Math.round(totalNetSavings / Math.max(monthlyProjections.length, 1));

    const totalIncome = monthlyProjections.reduce((sum, p) => sum + p.income, 0);
    const avgIncome = Math.round(totalIncome / Math.max(monthlyProjections.length, 1));
    const savingsRate = avgIncome > 0 ? Math.round((avgNetSavings / avgIncome) * 100) : null;

    const zeroCashMonthIndex = monthlyProjections.findIndex(p => p.endingCash <= 0);

    let runwayText = 'Safe';
    let runwayMonths = -1;
    let runwayStatus: 'safe' | 'warning' | 'critical' = 'safe';

    if (zeroCashMonthIndex !== -1) {
      runwayMonths = zeroCashMonthIndex;
      runwayText = `${runwayMonths} Mo.`;
      runwayStatus = runwayMonths < 3 ? 'critical' : 'warning';
    } else {
      const negativeMonths = monthlyProjections.filter(p => p.netSavings < 0);
      if (negativeMonths.length === 0) {
        runwayText = 'Default Alive ⚡️';
        runwayStatus = 'safe';
      } else {
        runwayText = '36+ Mo.';
        runwayStatus = 'safe';
      }
    }

    return { endingCash, avgNetSavings, savingsRate, runwayText, runwayStatus, runwayMonths };
  }, [monthlyProjections]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Starting Cash */}
      <div className="glass-card p-5 rounded-2xl border border-zinc-800 transition-all duration-300 hover:border-zinc-700">
        <div className="flex justify-between items-start">
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Starting Cash</p>
          <span className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
            <PiggyBank className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold font-mono text-zinc-100">{formatCurrency(initialCash)}</h3>
          <p className="text-[10px] text-zinc-500 mt-1">Starting account balance seed</p>
        </div>
      </div>

      {/* Projected Ending Cash */}
      <div className="glass-card p-5 rounded-2xl border border-zinc-800 transition-all duration-300 hover:border-zinc-700">
        <div className="flex justify-between items-start">
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Projected End Balance (36 Mo)</p>
          <span className={`p-2 rounded-lg ${stats.endingCash >= initialCash ? 'bg-emerald-950/55 text-emerald-400' : 'bg-rose-950/55 text-rose-400'}`}>
            {stats.endingCash >= initialCash ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </span>
        </div>
        <div className="mt-4">
          <h3 className={`text-2xl font-bold font-mono ${stats.endingCash >= initialCash ? 'text-emerald-400' : stats.endingCash <= 0 ? 'text-rose-400' : 'text-zinc-100'}`}>
            {formatCurrency(stats.endingCash)}
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1">
            {stats.endingCash >= initialCash
              ? `+€${Math.round(stats.endingCash - initialCash).toLocaleString()} from start`
              : `-€${Math.round(initialCash - stats.endingCash).toLocaleString()} from start`}
          </p>
        </div>
      </div>

      {/* Average Net Savings */}
      <div className="glass-card p-5 rounded-2xl border border-zinc-800 transition-all duration-300 hover:border-zinc-700">
        <div className="flex justify-between items-start">
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Avg Monthly Savings</p>
          <span className={`p-2 rounded-lg ${stats.avgNetSavings >= 0 ? 'bg-emerald-950/55 text-emerald-400' : 'bg-rose-950/55 text-rose-400'}`}>
            {stats.avgNetSavings >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </span>
        </div>
        <div className="mt-4">
          <h3 className={`text-2xl font-bold font-mono ${stats.avgNetSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(stats.avgNetSavings)}
          </h3>
          {monthlySavingsDelta !== null ? (
            <p className={`text-[10px] mt-1 font-mono font-semibold ${monthlySavingsDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {monthlySavingsDelta >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(monthlySavingsDelta))} vs prior month
            </p>
          ) : (
            <p className="text-[10px] text-zinc-500 mt-1">
              {stats.avgNetSavings >= 0 ? 'Projected monthly net surplus' : 'Projected monthly net burn'}
            </p>
          )}
        </div>
      </div>

      {/* Savings Rate */}
      <div className="glass-card p-5 rounded-2xl border border-zinc-800 transition-all duration-300 hover:border-zinc-700">
        <div className="flex justify-between items-start">
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Savings Rate</p>
          <span className={`p-2 rounded-lg ${stats.savingsRate !== null && stats.savingsRate >= 0 ? 'bg-emerald-950/55 text-emerald-400' : 'bg-rose-950/55 text-rose-400'}`}>
            <Percent className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-4">
          <h3 className={`text-2xl font-bold font-mono ${stats.savingsRate !== null && stats.savingsRate >= 20 ? 'text-emerald-400' : stats.savingsRate !== null && stats.savingsRate < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
            {stats.savingsRate !== null ? `${stats.savingsRate}%` : '—'}
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1">
            {stats.savingsRate !== null
              ? stats.savingsRate >= 20 ? 'Strong — above 20% target'
              : stats.savingsRate >= 10 ? 'Moderate — aim for 20%+'
              : stats.savingsRate >= 0 ? 'Low — review spending'
              : 'Negative — spending exceeds income'
              : 'Load data to calculate'}
          </p>
        </div>
      </div>

      {/* Runway Status */}
      <div className="glass-card p-5 rounded-2xl border border-zinc-800 transition-all duration-300 hover:border-zinc-700">
        <div className="flex justify-between items-start">
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Cash Runway</p>
          <span className={`p-2 rounded-lg ${
            stats.runwayStatus === 'safe' ? 'bg-emerald-950/55 text-emerald-400' :
            stats.runwayStatus === 'warning' ? 'bg-amber-950/55 text-amber-400' : 'bg-rose-950/55 text-rose-400'
          }`}>
            {stats.runwayStatus === 'safe' ? <Clock className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          </span>
        </div>
        <div className="mt-4">
          <h3 className={`text-2xl font-bold font-mono ${
            stats.runwayStatus === 'safe' ? 'text-emerald-400' :
            stats.runwayStatus === 'warning' ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {stats.runwayText}
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1">
            {stats.runwayStatus === 'safe' ? 'No runway exhaustion expected' : `Cash runs out in offset month ${stats.runwayMonths}`}
          </p>
        </div>
      </div>
    </div>
  );
};
