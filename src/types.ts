export interface Transaction {
  id: string;
  date: string;       // YYYY-MM-DD
  description: string;
  amount: number;     // Negative for debit/expense, positive for credit/income
  category: string;   // 'Groceries', 'Rent', 'Subscriptions', 'Income', etc.
  originalCategory?: string; // Original bank category if any
}

export interface BudgetCategory {
  name: string;
  limit: number;      // Target maximum monthly budget limit (0 for unlimited/income)
}

export interface FutureEvent {
  id: string;
  label: string;
  amount: number;     // Absolute value (positive)
  monthOffset: number; // 0 to 23 (months in the future)
  type: 'one-time-expense' | 'one-time-income' | 'recurring-expense' | 'recurring-income';
  category: string;
  isActive: boolean;
}

export interface CategorizationRule {
  id: string;
  keyword: string;    // Case-insensitive search string in description
  category: string;   // Target category to apply
}

export interface MonthlyProjection {
  monthIndex: number; // 0 to 23
  monthLabel: string; // e.g. "Jun 2026"
  startingCash: number;
  income: number;     // Projected base income + one-time-incomes + recurring-incomes
  expenses: number;   // Projected base expenses + one-time-expenses + recurring-expenses
  netSavings: number; // income - expenses
  endingCash: number;
  categoryBreakdown: Record<string, number>; // Breakdown of expenses by category for this month
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIAnalysisReport {
  timestamp: number;
  summary: string;
  savingsRateAdvice: string;
  subscriptionNotes: string;
  runwayRiskAlerts: string;
  actionableSteps: string[];
}
