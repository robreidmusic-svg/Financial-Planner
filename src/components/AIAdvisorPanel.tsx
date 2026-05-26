import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Sparkles, MessageSquare, Compass, Send, Key, FileText, CheckSquare, BrainCircuit, Loader2 } from 'lucide-react';

export const AIAdvisorPanel: React.FC = () => {
  const { 
    chatHistory, 
    askAdvisorQuestion, 
    activeReport, 
    generateAdvisorReport, 
    isLoadingReport, 
    geminiApiKey 
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'audit' | 'chat'>('audit');
  const [question, setQuestion] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    askAdvisorQuestion(question.trim());
    setQuestion('');
  };

  const handleGenerateReport = () => {
    generateAdvisorReport();
  };

  const hasApiKey = !!geminiApiKey;

  return (
    <div className="space-y-6">
      {/* Advisor Header */}
      <div className="glass-card p-6 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center flex-shrink-0 ai-glow-orb relative">
            <BrainCircuit className="w-6 h-6 text-accent-gold" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300">Rob's AI Advisor</h3>
            <p className="text-xs text-zinc-400">
              An encouraging, data-focused coach to guide your budgeting and analyze long-term runway impact.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs font-mono font-semibold">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'audit' ? 'bg-zinc-850 text-accent-gold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Audit Report
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'chat' ? 'bg-zinc-850 text-accent-gold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Ask Advisor
          </button>
        </div>
      </div>

      {!hasApiKey && (
        <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl flex items-start gap-3 text-amber-300 text-xs">
          <Key className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h5 className="font-semibold uppercase tracking-wider text-[10px]">Private API Key Unset</h5>
            <p className="opacity-90">
              No Gemini API Key found in settings. The Advisor will run in a local baseline simulation mode. To unlock personalized AI analysis, paste your key in the **Settings** tab.
            </p>
          </div>
        </div>
      )}

      {/* Tabs Content */}
      <div className="min-h-[400px]">
        {activeTab === 'audit' ? (
          <div className="space-y-6">
            {/* Generate Report Trigger */}
            <div className="flex justify-center py-4">
              <button
                onClick={handleGenerateReport}
                disabled={isLoadingReport}
                className="py-3 px-6 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-accent-gold rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                {isLoadingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-accent-gold" />
                    Calculating Projections...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-accent-gold" />
                    {activeReport ? 'Refresh Financial Audit' : 'Generate Financial Audit'}
                  </>
                )}
              </button>
            </div>

            {/* Structured Report Card */}
            {activeReport && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side: Summary & Runway */}
                <div className="space-y-6">
                  {/* Executive Summary */}
                  <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Executive Summary</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">{activeReport.summary}</p>
                  </div>
                  
                  {/* Runway Warnings */}
                  <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Runway & Risk Audit</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">{activeReport.runwayRiskAlerts}</p>
                  </div>
                </div>

                {/* Right Side: Budgets, Subscriptions, Checklist */}
                <div className="space-y-6">
                  {/* Budget & Subscriptions */}
                  <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Savings & Cash Flow Rate</h4>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">{activeReport.savingsRateAdvice}</p>
                    </div>
                    <div className="border-t border-zinc-850 pt-4 space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Subscription Diagnostics</h4>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">{activeReport.subscriptionNotes}</p>
                    </div>
                  </div>

                  {/* Actions Checklists */}
                  <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Advisor Coaching Plan</h4>
                    <ul className="space-y-3 text-xs">
                      {activeReport.actionableSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-zinc-300">
                          <CheckSquare className="w-4 h-4 text-accent-gold mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {!activeReport && !isLoadingReport && (
              <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500 space-y-2 max-w-sm mx-auto">
                <Compass className="w-8 h-8 text-zinc-700" />
                <h4 className="text-sm font-semibold text-zinc-400">Financial Audit Pending</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Generate an audit report above. The advisor will analyze your cash balance, savings rate, categories, and suggest actionable adjustments.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Chat Panel */
          <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden flex flex-col h-[480px]">
            {/* Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((msg) => {
                const isModel = msg.role === 'assistant';
                return (
                  <div 
                    key={msg.id}
                    className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                      isModel 
                        ? 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none font-sans' 
                        : 'bg-accent-gold/10 border border-accent-gold/25 text-zinc-100 rounded-tr-none font-mono'
                    }`}>
                      <div className="font-mono text-[9px] text-zinc-500 mb-1">
                        {isModel ? "Rob's Coach" : 'User Simulation'}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendQuestion} className="bg-zinc-950 p-4 border-t border-zinc-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask e.g. 'Can I save an extra €200/mo by cutting down dining out?' or 'What if my rent increases?'"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 text-xs focus:outline-none focus:border-accent-gold"
              />
              <button
                type="submit"
                className="p-3 bg-zinc-850 border border-zinc-800 rounded-xl text-accent-gold hover:bg-zinc-800 transition-colors"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
