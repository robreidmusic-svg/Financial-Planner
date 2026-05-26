"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Transaction, 
  BudgetCategory, 
  FutureEvent, 
  CategorizationRule, 
  MonthlyProjection, 
  ChatMessage,
  AIAnalysisReport 
} from '../types';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: BudgetCategory[];
  futureEvents: FutureEvent[];
  rules: CategorizationRule[];
  initialCash: number;
  geminiApiKey: string;
  chatHistory: ChatMessage[];
  activeReport: AIAnalysisReport | null;
  isLoadingReport: boolean;
  
  // Actions
  importTransactionsFromCSV: (csvText: string) => { success: boolean; count: number; error?: string };
  addRule: (keyword: string, category: string) => void;
  deleteRule: (id: string) => void;
  updateBudget: (categoryName: string, limit: number) => void;
  addFutureEvent: (event: Omit<FutureEvent, 'id' | 'isActive'>) => void;
  deleteFutureEvent: (id: string) => void;
  toggleFutureEvent: (id: string) => void;
  setInitialCash: (amount: number) => void;
  setGeminiApiKey: (key: string) => void;
  askAdvisorQuestion: (text: string) => Promise<void>;
  generateAdvisorReport: () => Promise<void>;
  clearAllData: () => void;
  loadDemoData: () => void;
  
  // Computed Projections & Stats
  categoryAverages: Record<string, number>;
  monthlyProjections: MonthlyProjection[];
  isDataLoaded: boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const DEFAULT_CATEGORIES = [
  'Income',
  'Housing & Rent',
  'Groceries',
  'Dining & Takeout',
  'Utilities & Bills',
  'Transport & Travel',
  'Entertainment & Leisure',
  'Shopping',
  'Subscriptions',
  'Loan Repayment',
  'Insurance',
  'Gym Membership',
  'Mobile & Broadband',
  'Credit Card Payment',
  'Investments',
  'Transfers to Sarah',
  'Transfers to Leanne',
  'Transfers to Georgia',
  'Transfers to Katie',
  'Miscellaneous transfers',
  'Spare Change Transfers',
  'Uncategorized'
];

const DEFAULT_RULES: CategorizationRule[] = [
  { id: '1', keyword: 'netflix', category: 'Subscriptions' },
  { id: '2', keyword: 'spotify', category: 'Subscriptions' },
  { id: '3', keyword: 'uber', category: 'Transport & Travel' },
  { id: '4', keyword: 'lyft', category: 'Transport & Travel' },
  { id: '5', keyword: 'walmart', category: 'Shopping' },
  { id: '6', keyword: 'amazon', category: 'Shopping' },
  { id: '7', keyword: 'kroger', category: 'Groceries' },
  { id: '8', keyword: 'safeway', category: 'Groceries' },
  { id: '9', keyword: 'wholefds', category: 'Groceries' },
  { id: '10', keyword: 'electric', category: 'Utilities & Bills' },
  { id: '11', keyword: 'water', category: 'Utilities & Bills' },
  { id: '12', keyword: 'salary', category: 'Income' },
  { id: '13', keyword: 'payroll', category: 'Income' },
  { id: '14', keyword: 'deposit', category: 'Income' },
  { id: '15', keyword: 'starbucks', category: 'Dining & Takeout' },
  { id: '16', keyword: 'mcdonalds', category: 'Dining & Takeout' },
  { id: '17', keyword: 'sarah', category: 'Transfers to Sarah' },
  { id: '18', keyword: 'leanne', category: 'Transfers to Leanne' },
  { id: '19', keyword: 'georgia', category: 'Transfers to Georgia' },
  { id: '20', keyword: 'katie', category: 'Transfers to Katie' },
  { id: '21', keyword: 'rent', category: 'Housing & Rent' },
  // Specific merchant/payee rules — must come BEFORE the generic 'transfer' catch-all
  { id: '24', keyword: 'Credit Union Dd', category: 'Loan Repayment' },
  { id: '25', keyword: '123 Money Limited', category: 'Insurance' },
  { id: '26', keyword: 'Westwood Leopardstown', category: 'Gym Membership' },
  { id: '27', keyword: 'Mary Reid', category: 'Housing & Rent' },
  { id: '31', keyword: 'Eddie Reid', category: 'Housing & Rent' },
  { id: '28', keyword: 'Vodafone Ireland Ltd', category: 'Mobile & Broadband' },
  { id: '29', keyword: 'Aib Card Pymt', category: 'Credit Card Payment' },
  { id: '30', keyword: 'To Robo Portfolio', category: 'Investments' },
  { id: '23', keyword: 'To EUR Flexible Cash Funds', category: 'Spare Change Transfers' },
  { id: '22', keyword: 'transfer', category: 'Miscellaneous transfers' }
];

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [futureEvents, setFutureEvents] = useState<FutureEvent[]>([]);
  const [rules, setRules] = useState<CategorizationRule[]>(DEFAULT_RULES);
  const [initialCash, setInitialCashState] = useState<number>(5000);
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeReport, setActiveReport] = useState<AIAnalysisReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize and load from local storage
  useEffect(() => {
    setIsMounted(true);
    const storedTx = localStorage.getItem('zw_transactions');
    const storedBudgets = localStorage.getItem('zw_budgets');
    const storedEvents = localStorage.getItem('zw_events');
    const storedRules = localStorage.getItem('zw_rules');
    const storedCash = localStorage.getItem('zw_initial_cash');
    const storedKey = localStorage.getItem('zw_gemini_key');
    const storedChat = localStorage.getItem('zw_chat');
    const storedReport = localStorage.getItem('zw_report');

    if (storedTx) setTransactions(JSON.parse(storedTx));
    if (storedBudgets) setBudgets(JSON.parse(storedBudgets));
    if (storedEvents) setFutureEvents(JSON.parse(storedEvents));
    
    if (storedRules) {
      // Merge new default rules in case user is updating app
      const parsedRules = JSON.parse(storedRules) as CategorizationRule[];
      const missingDefaults = DEFAULT_RULES.filter(dr => !parsedRules.some(pr => pr.keyword === dr.keyword));
      setRules([...parsedRules, ...missingDefaults]);
    }

    if (storedCash) setInitialCashState(Number(storedCash));
    
    if (!storedBudgets) {
      // Set default budget templates
      setBudgets(DEFAULT_CATEGORIES.map(cat => ({
        name: cat,
        limit: cat === 'Income' ? 0 : cat === 'Housing & Rent' ? 1500 : cat === 'Uncategorized' ? 0 : 300
      })));
    } else {
      // Merge any new default categories that the stored budgets may not yet have
      const parsedBudgets = JSON.parse(storedBudgets) as { name: string; limit: number }[];
      const existingBudgetNames = parsedBudgets.map(b => b.name);
      const missingBudgets = DEFAULT_CATEGORIES
        .filter(cat => !existingBudgetNames.includes(cat))
        .map(cat => ({
          name: cat,
          limit: cat === 'Income' ? 0 : cat === 'Uncategorized' ? 0 : 300
        }));
      if (missingBudgets.length > 0) {
        setBudgets([...parsedBudgets, ...missingBudgets]);
      }
    }

    if (storedEvents) setFutureEvents(JSON.parse(storedEvents));
    if (storedCash) setInitialCashState(Number(storedCash));
    if (storedKey) setGeminiApiKeyState(storedKey);
    
    if (storedChat) {
      setChatHistory(JSON.parse(storedChat));
    } else {
      setChatHistory([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hi! I'm your AI Advisor for Rob's Financial Planner. 🧘‍♂️ Upload your bank statements, set up your budget, and we'll project your financial runway over the next 24 months. Ask me anything about how adjustments might affect your future cash balance!",
          timestamp: Date.now()
        }
      ]);
    }

    if (storedReport) setActiveReport(JSON.parse(storedReport));
  }, []);

  // Save changes to localStorage when state changes
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zw_transactions', JSON.stringify(transactions));
  }, [transactions, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zw_budgets', JSON.stringify(budgets));
  }, [budgets, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zw_events', JSON.stringify(futureEvents));
  }, [futureEvents, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zw_rules', JSON.stringify(rules));
  }, [rules, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zw_initial_cash', initialCash.toString());
  }, [initialCash, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zw_gemini_key', geminiApiKey);
  }, [geminiApiKey, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('zw_chat', JSON.stringify(chatHistory));
  }, [chatHistory, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    if (activeReport) {
      localStorage.setItem('zw_report', JSON.stringify(activeReport));
    } else {
      localStorage.removeItem('zw_report');
    }
  }, [activeReport, isMounted]);

  const isDataLoaded = useMemo(() => transactions.length > 0, [transactions]);

  // Set initial cash
  const setInitialCash = (amount: number) => {
    setInitialCashState(amount);
  };

  // Set API Key
  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
  };

  // Category assignment helper using keyword rules
  const autoCategorize = (description: string, defaultCategory = 'Uncategorized'): string => {
    const descLower = description.toLowerCase();
    for (const rule of rules) {
      if (descLower.includes(rule.keyword.toLowerCase())) {
        return rule.category;
      }
    }
    return defaultCategory;
  };

  // Import transactions from raw CSV string
  const importTransactionsFromCSV = (csvText: string) => {
    try {
      const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length < 2) {
        return { success: false, count: 0, error: 'CSV file is empty or only contains one line.' };
      }

      // Simple CSV parser that handles commas inside quotes
      const parseCSVLine = (text: string): string[] => {
        const result: string[] = [];
        let curVal = '';
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(curVal.trim());
            curVal = '';
          } else {
            curVal += char;
          }
        }
        result.push(curVal.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, ''));
      
      // Determine index of date, description, amount, category
      let dateIdx = -1;
      let descIdx = -1;
      let amountIdx = -1;
      let debitIdx = -1;
      let creditIdx = -1;
      let catIdx = -1;

      headers.forEach((header, index) => {
        if (header.includes('date')) dateIdx = index;
        else if (header.includes('desc') || header.includes('name') || header.includes('payee') || header.includes('memo') || header.includes('details')) descIdx = index;
        else if (header.includes('amount') || header.includes('value')) amountIdx = index;
        else if (header.includes('debit') || header.includes('spend') || header.includes('withdraw')) debitIdx = index;
        else if (header.includes('credit') || header.includes('deposit') || header.includes('income')) creditIdx = index;
        else if (header.includes('category') || header.includes('type')) catIdx = index;
      });

      // Fail-safes if columns couldn't be detected
      if (dateIdx === -1) dateIdx = 0;
      if (descIdx === -1) descIdx = headers.length > 1 ? 1 : 0;
      if (amountIdx === -1 && debitIdx === -1) {
        amountIdx = headers.length > 2 ? 2 : headers.length - 1;
      }

      const parsedTransactions: Transaction[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < Math.max(dateIdx, descIdx, amountIdx, debitIdx, creditIdx) + 1) continue;

        const dateStr = cols[dateIdx].replace(/['"]/g, '');
        const desc = cols[descIdx].replace(/['"]/g, '');
        
        let amount = 0;
        if (amountIdx !== -1) {
          const rawAmt = cols[amountIdx].replace(/[$,€'"\s]/g, '');
          amount = parseFloat(rawAmt);
        } else {
          // If Debit and Credit are separate columns
          const rawDebit = debitIdx !== -1 ? cols[debitIdx].replace(/[$,€'"\s]/g, '') : '';
          const rawCredit = creditIdx !== -1 ? cols[creditIdx].replace(/[$,€'"\s]/g, '') : '';
          const debitVal = rawDebit ? parseFloat(rawDebit) : 0;
          const creditVal = rawCredit ? parseFloat(rawCredit) : 0;
          
          if (!isNaN(creditVal) && creditVal > 0) {
            amount = creditVal;
          } else if (!isNaN(debitVal) && debitVal > 0) {
            amount = -debitVal; // Debit is negative
          }
        }

        if (isNaN(amount)) continue;

        // Try standardizing date format
        // Handle DD/MM/YYYY or DD-MM-YYYY (European)
        let formattedDate = dateStr;
        const eurDateMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (eurDateMatch) {
          const day = eurDateMatch[1].padStart(2, '0');
          const month = eurDateMatch[2].padStart(2, '0');
          const year = eurDateMatch[3];
          formattedDate = `${year}-${month}-${day}`;
        } else {
          const dateObj = new Date(dateStr);
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toISOString().split('T')[0];
          }
        }

        const originalCat = catIdx !== -1 ? cols[catIdx].replace(/['"]/g, '') : undefined;
        const finalCategory = autoCategorize(desc, originalCat || 'Uncategorized');

        parsedTransactions.push({
          id: `${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: formattedDate,
          description: desc,
          amount: amount,
          category: finalCategory,
          originalCategory: originalCat
        });
      }

      if (parsedTransactions.length === 0) {
        return { success: false, count: 0, error: 'Could not extract valid transaction rows. Check your headers.' };
      }

      // Merge or overwrite? Let's sort and merge transactions based on ID/date, or just overwrite to set new statements.
      // Usually, overwriting makes the experience much cleaner for statement uploads, or we can prepend/append.
      // Let's replace the existing transaction log with this newly uploaded statement log, sorting by date descending.
      const sortedTransactions = [...parsedTransactions].sort((a, b) => b.date.localeCompare(a.date));

      // Heuristic: If the statement ONLY contains positive amounts, assume expenses were exported as positive numbers
      const hasNegative = sortedTransactions.some(t => t.amount < 0);
      if (!hasNegative) {
        sortedTransactions.forEach(t => {
          // If it's not explicitly income, assume it's an expense and make it negative
          if (t.category !== 'Income') {
            t.amount = -Math.abs(t.amount);
          }
        });
      }

      setTransactions(sortedTransactions);

      // Auto-recalculate initial cash if the transactions contain cash flow balance
      // Or let the user adjust it. We'll keep our current initialCash, but suggest updating.
      
      // Auto-update budget categories that exist in the transactions
      const uniqueCats = Array.from(new Set(sortedTransactions.map(t => t.category)));
      setBudgets(prev => {
        const existingNames = prev.map(b => b.name);
        const newBudgets = [...prev];
        uniqueCats.forEach(cat => {
          if (!existingNames.includes(cat) && cat !== 'Uncategorized') {
            newBudgets.push({ name: cat, limit: 200 });
          }
        });
        return newBudgets;
      });

      return { success: true, count: sortedTransactions.length };
    } catch (e: any) {
      return { success: false, count: 0, error: e.message || 'Unknown parsing error.' };
    }
  };

  // Rule management
  const addRule = (keyword: string, category: string) => {
    const newRule: CategorizationRule = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      keyword,
      category
    };
    const updatedRules = [...rules, newRule];
    setRules(updatedRules);

    // Apply rule retroactively to current transactions
    setTransactions(prev => prev.map(t => {
      if (t.description.toLowerCase().includes(keyword.toLowerCase())) {
        return { ...t, category };
      }
      return t;
    }));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  // Update budget limit
  const updateBudget = (categoryName: string, limit: number) => {
    setBudgets(prev => prev.map(b => b.name === categoryName ? { ...b, limit } : b));
  };

  // Future Adjusters
  const addFutureEvent = (event: Omit<FutureEvent, 'id' | 'isActive'>) => {
    const newEvent: FutureEvent = {
      ...event,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isActive: true
    };
    setFutureEvents(prev => [...prev, newEvent]);
  };

  const deleteFutureEvent = (id: string) => {
    setFutureEvents(prev => prev.filter(e => e.id !== id));
  };

  const toggleFutureEvent = (id: string) => {
    setFutureEvents(prev => prev.map(e => e.id === id ? { ...e, isActive: !e.isActive } : e));
  };

  // Clear data
  const clearAllData = () => {
    setTransactions([]);
    setBudgets(DEFAULT_CATEGORIES.map(cat => ({
      name: cat,
      limit: cat === 'Income' ? 0 : cat === 'Housing & Rent' ? 1500 : cat === 'Uncategorized' ? 0 : 300
    })));
    setFutureEvents([]);
    setRules(DEFAULT_RULES);
    setInitialCashState(5000);
    setChatHistory([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm your AI Advisor for Rob's Financial Planner. 🧘‍♂️ Data cleared. Let's upload a fresh bank statement to start.",
        timestamp: Date.now()
      }
    ]);
    setActiveReport(null);
    localStorage.removeItem('zw_transactions');
    localStorage.removeItem('zw_budgets');
    localStorage.removeItem('zw_events');
    localStorage.removeItem('zw_rules');
    localStorage.removeItem('zw_initial_cash');
    localStorage.removeItem('zw_chat');
    localStorage.removeItem('zw_report');
  };

  // Load Demo Data
  const loadDemoData = () => {
    const today = new Date();
    const demoTx: Transaction[] = [];
    
    // Helper to format past date
    const getPastDate = (daysAgo: number) => {
      const d = new Date(today);
      d.setDate(today.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    // Create 3 months of historical transactions
    for (let i = 0; i < 90; i++) {
      // Rent monthly
      if (i % 30 === 0) {
        demoTx.push({
          id: `rent-${i}`,
          date: getPastDate(i),
          description: 'ACME PROPERTY MANAGEMT Rent Payment',
          amount: -1600,
          category: 'Housing & Rent'
        });
      }
      
      // Salary biweekly
      if (i % 14 === 0) {
        demoTx.push({
          id: `salary-${i}`,
          date: getPastDate(i),
          description: 'DIRECT DEP STRIPE PAYROLL',
          amount: 3200,
          category: 'Income'
        });
      }

      // Grocery weekly
      if (i % 7 === 0) {
        demoTx.push({
          id: `grocery-${i}`,
          date: getPastDate(i),
          description: 'SAFEWAY GROCERY #283',
          amount: -145.50 - (i % 5) * 10,
          category: 'Groceries'
        });
      }

      // Dining out
      if (i % 3 === 0) {
        demoTx.push({
          id: `dining-${i}`,
          date: getPastDate(i),
          description: 'STARBUCKS COFFEE #1203',
          amount: -6.50 - (i % 3) * 2,
          category: 'Dining & Takeout'
        });
        demoTx.push({
          id: `restaurant-${i}`,
          date: getPastDate(i),
          description: 'DOORDASH RESTAURANT DELIVERY',
          amount: -28.40 - (i % 4) * 8,
          category: 'Dining & Takeout'
        });
      }

      // Utilities monthly
      if (i % 28 === 2) {
        demoTx.push({
          id: `utility-elec-${i}`,
          date: getPastDate(i),
          description: 'CITY POWER ELECTRIC BILL',
          amount: -92.15,
          category: 'Utilities & Bills'
        });
        demoTx.push({
          id: `utility-water-${i}`,
          date: getPastDate(i),
          description: 'METRO WATER SERVICE',
          amount: -45.00,
          category: 'Utilities & Bills'
        });
      }

      // Subscriptions
      if (i % 30 === 5) {
        demoTx.push({
          id: `sub-netflix-${i}`,
          date: getPastDate(i),
          description: 'NETFLIX.COM STREAMING',
          amount: -15.49,
          category: 'Subscriptions'
        });
        demoTx.push({
          id: `sub-spotify-${i}`,
          date: getPastDate(i),
          description: 'SPOTIFY PREMIUM RENEWAL',
          amount: -10.99,
          category: 'Subscriptions'
        });
      }

      // Transport & Shopping
      if (i % 5 === 1) {
        demoTx.push({
          id: `uber-${i}`,
          date: getPastDate(i),
          description: 'UBER RIDE TRIPS HELP',
          amount: -18.50 - (i % 3) * 4,
          category: 'Transport & Travel'
        });
      }
      if (i % 10 === 4) {
        demoTx.push({
          id: `amazon-${i}`,
          date: getPastDate(i),
          description: 'AMAZON.COM ORDER M837X',
          amount: -42.80 - (i % 4) * 15,
          category: 'Shopping'
        });
      }
    }

    setTransactions(demoTx.sort((a, b) => b.date.localeCompare(a.date)));
    setInitialCashState(8450);
    setBudgets([
      { name: 'Income', limit: 0 },
      { name: 'Housing & Rent', limit: 1650 },
      { name: 'Groceries', limit: 650 },
      { name: 'Dining & Takeout', limit: 400 },
      { name: 'Utilities & Bills', limit: 200 },
      { name: 'Transport & Travel', limit: 150 },
      { name: 'Entertainment & Leisure', limit: 200 },
      { name: 'Shopping', limit: 300 },
      { name: 'Subscriptions', limit: 50 },
      { name: 'Uncategorized', limit: 100 }
    ]);

    // Demo Future Events
    setFutureEvents([
      {
        id: 'fe-1',
        label: 'Purchase New Laptop',
        amount: 2400,
        monthOffset: 3,
        type: 'one-time-expense',
        category: 'Shopping',
        isActive: true
      },
      {
        id: 'fe-2',
        label: 'Annual Performance Bonus',
        amount: 5000,
        monthOffset: 6,
        type: 'one-time-income',
        category: 'Income',
        isActive: true
      },
      {
        id: 'fe-3',
        label: 'Rent Increase',
        amount: 100,
        monthOffset: 12,
        type: 'recurring-expense',
        category: 'Housing & Rent',
        isActive: true
      }
    ]);

    setChatHistory([
      {
        id: 'welcome',
        role: 'assistant',
        content: "I've loaded the demo financial profile for you. 📊 Note the baseline averages: you earn about €6,400 per month and spend roughly €4,200, giving you a strong monthly savings rate. I've also modelled a laptop purchase in Month 4, a bonus in Month 7, and a rent increase in Month 13. You can review this in the Forecast tab or chat with me!",
        timestamp: Date.now()
      }
    ]);
    setActiveReport(null);
  };

  // Computes the average monthly spending per category from the historical transactions
  const categoryAverages = useMemo(() => {
    if (transactions.length === 0) return {};

    // Group transactions by category and month/year key (e.g. "2026-05")
    const categoryMonthTotals: Record<string, Record<string, number>> = {};
    const monthsSet = new Set<string>();

    transactions.forEach(tx => {
      if (tx.amount >= 0 && tx.category !== 'Income') return; // Ignore deposit items in spending categories
      if (tx.category === 'Income' && tx.amount < 0) return; // Ignore negative items in Income
      if (tx.category === 'Spare Change Transfers') return; // Ignore automated savings transfers

      const monthKey = tx.date.substring(0, 7); // "YYYY-MM"
      monthsSet.add(monthKey);

      if (!categoryMonthTotals[tx.category]) {
        categoryMonthTotals[tx.category] = {};
      }
      if (!categoryMonthTotals[tx.category][monthKey]) {
        categoryMonthTotals[tx.category][monthKey] = 0;
      }
      categoryMonthTotals[tx.category][monthKey] += Math.abs(tx.amount);
    });

    const monthsCount = Math.max(monthsSet.size, 1);
    const averages: Record<string, number> = {};

    Object.keys(categoryMonthTotals).forEach(cat => {
      const totalAmount = Object.values(categoryMonthTotals[cat]).reduce((sum, val) => sum + val, 0);
      averages[cat] = Math.round((totalAmount / monthsCount) * 100) / 100;
    });

    return averages;
  }, [transactions]);

  // Compute 24-month projections combining budgets and future events
  const monthlyProjections = useMemo(() => {
    const projections: MonthlyProjection[] = [];
    let runningCash = initialCash;

    // Get current date or use project base date (defaulting to current month)
    const baseDate = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Find the base base-budget projection figures
    // If no transactions have been uploaded, we rely solely on configured budget limits
    // If transactions have been uploaded, we can base expenses on either category budget limits or historical averages.
    // For projection safety, we will project expenses using the set budget limits, since that is the "plan", 
    // and project income using the set income limit (or historical income average if limit is 0).
    const baseBudgetIncome = budgets.find(b => b.name === 'Income')?.limit || categoryAverages['Income'] || 0;

    // Base monthly expense budget sum (excluding income category)
    const baseBudgetExpensesMap: Record<string, number> = {};
    budgets.forEach(b => {
      if (b.name !== 'Income' && b.name !== 'Spare Change Transfers') {
        baseBudgetExpensesMap[b.name] = b.limit || categoryAverages[b.name] || 0;
      }
    });

    // Run 24 month projections
    for (let offset = 0; offset < 24; offset++) {
      const currentMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1);
      const label = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

      // Start calculating flows for this offset month
      let monthIncome = baseBudgetIncome;
      
      // Copy base budget expenses
      const monthExpensesBreakdown = { ...baseBudgetExpensesMap };
      
      // Layer in future active events
      let oneTimeIncomesVal = 0;
      let oneTimeExpensesVal = 0;
      let recurringIncomesVal = 0;
      let recurringExpensesVal = 0;

      // Find events applying to this month
      futureEvents.forEach(event => {
        if (!event.isActive) return;

        const isEventTriggered = 
          event.type.startsWith('one-time') ? event.monthOffset === offset :
          event.type.startsWith('recurring') ? offset >= event.monthOffset : false;

        if (isEventTriggered) {
          if (event.type === 'one-time-income') {
            oneTimeIncomesVal += event.amount;
          } else if (event.type === 'one-time-expense') {
            oneTimeExpensesVal += event.amount;
            monthExpensesBreakdown[event.category] = (monthExpensesBreakdown[event.category] || 0) + event.amount;
          } else if (event.type === 'recurring-income') {
            recurringIncomesVal += event.amount;
          } else if (event.type === 'recurring-expense') {
            recurringExpensesVal += event.amount;
            monthExpensesBreakdown[event.category] = (monthExpensesBreakdown[event.category] || 0) + event.amount;
          }
        }
      });

      monthIncome += oneTimeIncomesVal + recurringIncomesVal;
      
      // Calculate total expenses for this month
      let totalExpenses = Object.values(monthExpensesBreakdown).reduce((sum, val) => sum + val, 0);

      const netSavings = monthIncome - totalExpenses;
      const startingCash = runningCash;
      runningCash += netSavings;

      projections.push({
        monthIndex: offset,
        monthLabel: label,
        startingCash: Math.round(startingCash),
        income: Math.round(monthIncome),
        expenses: Math.round(totalExpenses),
        netSavings: Math.round(netSavings),
        endingCash: Math.round(runningCash),
        categoryBreakdown: monthExpensesBreakdown
      });
    }

    return projections;
  }, [initialCash, budgets, futureEvents, categoryAverages]);

  // AI Chat & Insights handler
  const askAdvisorQuestion = async (text: string) => {
    if (!text.trim()) return;

    // Create user message
    const userMsg: ChatMessage = {
      id: `chat-u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, userMsg]);

    // Create a loading state placeholder
    const loadingMsgId = `chat-loading-${Date.now()}`;
    setChatHistory(prev => [...prev, {
      id: loadingMsgId,
      role: 'assistant',
      content: "Thinking... Let me check the numbers 📈",
      timestamp: Date.now()
    }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory.filter(c => c.id !== 'welcome').map(c => ({ role: c.role, content: c.content })),
          apiKey: geminiApiKey,
          // Send summary context of current financial health
          financialContext: {
            initialCash,
            currentBudget: budgets,
            futureEvents: futureEvents.filter(e => e.isActive),
            historicalAverages: categoryAverages,
            projectionsSummary: monthlyProjections.map(p => ({
              month: p.monthLabel,
              cash: p.endingCash,
              income: p.income,
              expenses: p.expenses,
              net: p.netSavings
            }))
          }
        })
      });

      const data = await response.json();
      
      setChatHistory(prev => prev.map(c => {
        if (c.id === loadingMsgId) {
          return {
            id: `chat-a-${Date.now()}`,
            role: 'assistant',
            content: data.reply || "Sorry, I had trouble parsing the forecast model. Let's try adjusting the variables.",
            timestamp: Date.now()
          };
        }
        return c;
      }));

    } catch (e) {
      setChatHistory(prev => prev.map(c => {
        if (c.id === loadingMsgId) {
          return {
            id: `chat-a-${Date.now()}`,
            role: 'assistant',
            content: "I couldn't reach the AI Advisor engine. Please verify your internet connection or check your API Key in the Settings tab.",
            timestamp: Date.now()
          };
        }
        return c;
      }));
    }
  };

  const generateAdvisorReport = async () => {
    setIsLoadingReport(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'report',
          apiKey: geminiApiKey,
          financialContext: {
            initialCash,
            currentBudget: budgets,
            futureEvents: futureEvents.filter(e => e.isActive),
            historicalAverages: categoryAverages,
            projectionsSummary: monthlyProjections.map(p => ({
              month: p.monthLabel,
              cash: p.endingCash,
              income: p.income,
              expenses: p.expenses,
              net: p.netSavings
            }))
          }
        })
      });

      const data = await response.json();
      
      if (data.report) {
        setActiveReport(data.report);
      } else {
        // Fallback static analysis if AI is offline
        const avgSpend = Object.values(categoryAverages).reduce((sum, v) => sum + v, 0) - (categoryAverages['Income'] || 0);
        const savingsRate = baseBudgetIncome() > 0 ? ((baseBudgetIncome() - avgSpend) / baseBudgetIncome()) * 100 : 0;
        
        const fallbackReport: AIAnalysisReport = {
          timestamp: Date.now(),
          summary: "This is a local-only financial baseline analysis. Set a Gemini API Key in Settings for a full interactive AI audit! 🧘‍♂️",
          savingsRateAdvice: `Your current monthly income is projected at €${Math.round(baseBudgetIncome())} against baseline expenses of €${Math.round(avgSpend)}. Your savings rate is roughly ${Math.round(savingsRate)}%.`,
          subscriptionNotes: `We detected subscriptions totaling €${Math.round(categoryAverages['Subscriptions'] || 0)} per month. Projections show that keeping subscriptions active costs you €${Math.round((categoryAverages['Subscriptions'] || 0) * 24)} over 24 months.`,
          runwayRiskAlerts: monthlyProjections.some(p => p.endingCash < 0) 
            ? "⚠️ CRITICAL RUNWAY ALERT: Your ending cash balance is projected to fall below zero. Review your future purchases or add an income adjuster."
            : "✅ SOLID RUNWAY: Your current projection shows a healthy positive cash balance over the entire 24-month horizon.",
          actionableSteps: [
            "Review categories where set budget limits exceed your actual historical averages.",
            "Model a recurring income event (e.g. side gig or raise) to check how it changes your long-term saving trend.",
            "Verify all major historical charges are correctly categorized to ensure prediction accuracy."
          ]
        };
        setActiveReport(fallbackReport);
      }
    } catch (e) {
      // Fallback on error
      const avgSpend = Object.values(categoryAverages).reduce((sum, v) => sum + v, 0) - (categoryAverages['Income'] || 0);
      const fallbackReport: AIAnalysisReport = {
        timestamp: Date.now(),
        summary: "This is an offline baseline analysis. Set your Gemini API Key in Settings for personalized coaching! 🧘‍♂️",
        savingsRateAdvice: `Your baseline monthly spending is €${Math.round(avgSpend)} against budget inputs.`,
        subscriptionNotes: `Subscriptions average €${Math.round(categoryAverages['Subscriptions'] || 0)} per month.`,
        runwayRiskAlerts: monthlyProjections.some(p => p.endingCash < 0) 
          ? "⚠️ RUNWAY EXHAUSTION DETECTED: Projections dip below zero. Reduce OpEx or add new income streams."
          : "✅ STABLE OUTLOOK: You maintain a positive cash surplus over the 24-month horizon.",
        actionableSteps: [
          "Provide a Gemini API Key in Settings to get deep, context-aware coaching.",
          "Check the forecast table to isolate months with high cash burn.",
          "Set categorical budget alerts for items that frequently drift higher."
        ]
      };
      setActiveReport(fallbackReport);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const baseBudgetIncome = (): number => {
    return budgets.find(b => b.name === 'Income')?.limit || categoryAverages['Income'] || 0;
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      budgets,
      futureEvents,
      rules,
      initialCash,
      geminiApiKey,
      chatHistory,
      activeReport,
      isLoadingReport,
      importTransactionsFromCSV,
      addRule,
      deleteRule,
      updateBudget,
      addFutureEvent,
      deleteFutureEvent,
      toggleFutureEvent,
      setInitialCash,
      setGeminiApiKey,
      askAdvisorQuestion,
      generateAdvisorReport,
      clearAllData,
      loadDemoData,
      categoryAverages,
      monthlyProjections,
      isDataLoaded
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
