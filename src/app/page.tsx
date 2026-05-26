"use client";

import React, { useState } from 'react';
import { FinanceProvider } from '../context/FinanceContext';
import { BudgetDashboard } from '../components/BudgetDashboard';
import { CSVImporter } from '../components/CSVImporter';
import { TransactionList } from '../components/TransactionList';
import { Forecaster } from '../components/Forecaster';
import { BudgetEditor } from '../components/BudgetEditor';
import { FinancialLedger } from '../components/FinancialLedger';
import { AIAdvisorPanel } from '../components/AIAdvisorPanel';
import { SettingsPanel } from '../components/SettingsPanel';
import { LayoutDashboard, FileSpreadsheet, LineChart, Sliders, BrainCircuit, TableProperties, Settings, Wallet } from 'lucide-react';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'forecast' | 'budget' | 'advisor' | 'ledger' | 'settings'>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: FileSpreadsheet },
    { id: 'forecast', label: '24-Month Forecast', icon: LineChart },
    { id: 'budget', label: 'Budget Setup', icon: Sliders },
    { id: 'advisor', label: 'AI Advisor', icon: BrainCircuit },
    { id: 'ledger', label: 'Ledger Sheet', icon: TableProperties },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Premium Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/60 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-xl text-zinc-950">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] text-zinc-100 uppercase">Rob's Financial Planner</h1>
              <p className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">Interactive Forecast Engine</p>
            </div>
          </div>
          
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-zinc-500">SYSTEM STAT: SECURE / LOCAL-ONLY</span>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible bg-zinc-900/30 md:bg-transparent border border-zinc-800 md:border-0 rounded-2xl md:rounded-none p-2 md:p-0 gap-1 scrollbar-none md:space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap md:w-full select-none ${
                    isActive 
                      ? 'bg-accent-gold/10 border border-accent-gold/20 text-accent-gold shadow-[0_0_15px_rgba(251,191,36,0.05)]' 
                      : 'border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent-gold' : 'text-zinc-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Workspace */}
        <main className="flex-1 min-w-0">
          <div className="transition-all duration-300">
            {activeTab === 'dashboard' && <BudgetDashboard />}
            {activeTab === 'transactions' && (
              <div className="space-y-8">
                <div className="glass-card p-6 rounded-2xl border border-zinc-800">
                  <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-300 mb-4">Bank Statement Ingestion</h2>
                  <CSVImporter />
                </div>
                <div className="border-t border-zinc-900 pt-6">
                  <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-300 mb-4">Transaction Ledger & Automations</h2>
                  <TransactionList />
                </div>
              </div>
            )}
            {activeTab === 'forecast' && <Forecaster />}
            {activeTab === 'budget' && <BudgetEditor />}
            {activeTab === 'advisor' && <AIAdvisorPanel />}
            {activeTab === 'ledger' && <FinancialLedger />}
            {activeTab === 'settings' && <SettingsPanel />}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 bg-zinc-950/40 text-center text-[10px] font-mono text-zinc-600">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Rob's Financial Planner. Client-side compiled sandbox model. Zero external trackers.</p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <FinanceProvider>
      <DashboardContent />
    </FinanceProvider>
  );
}
