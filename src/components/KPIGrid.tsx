import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TrendingUp, TrendingDown, Clock, ShieldAlert, Sparkles, PiggyBank } from 'lucide-react';

export const KPIGrid: React.FC = () => {
  const { initialCash, monthlyProjections } = useFinance();

  const stats = useMemo(() => {
    const endingCash = monthlyProjections[monthlyProjections.length - 1]?.endingCash || 0;
    
    // Calculate average net savings across the projection period
    const totalNetSavings = monthlyProjections.reduce((sum, p) => sum + p.netSavings, 0);
    const avgNetSavings = Math.round(totalNetSavings / monthlyProjections.length);

    // Calculate runway: find the first month index where ending cash <= 0
    const zeroCashMonthIndex = monthlyProjections.findIndex(p => p.endingCash <= 0);
    
    let runwayText = 'Safe';
    let runwayMonths = -1;
    let runwayStatus: 'safe' | 'warning' | 'critical' = 'safe';

    if (zeroCashMonthIndex !== -1) {
      runwayMonths = zeroCashMonthIndex;
      runwayText = `${runwayMonths} Mo.`;
      runwayStatus = runwayMonths < 3 ? 'critical' : 'warning';
    } else {
      // If savings are positive or cash never depletes
      const negativeMonths = monthlyProjections.filter(p => p.netSavings < 0);
      if (negativeMonths.length === 0) {
        runwayText = 'Default Alive ⚡️';
        runwayStatus = 'safe';
      } else {
        runwayText = '24+ Mo.';
        runwayStatus = 'safe';
      }
    }

    return {
      endingCash,
      avgNetSavings,
      runwayText,
      runwayStatus,
      runwayMonths
    };
  }, [monthlyProjections]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Projected End Balance (24 Mo)</p>
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
          <p className="text-[10px] text-zinc-500 mt-1">
            {stats.avgNetSavings >= 0 ? 'Projected monthly net surplus' : 'Projected monthly net burn'}
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
