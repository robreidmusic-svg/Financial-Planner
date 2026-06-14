import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { message, history, apiKey, financialContext, mode } = await request.json();

    const activeApiKey = apiKey || process.env.GEMINI_API_KEY;

    if (!activeApiKey) {
      return NextResponse.json(
        { error: "No Gemini API Key provided. Enter a key in the Settings tab or configure GEMINI_API_KEY in .env.local." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: activeApiKey });

    // Format financial context into readable text for prompt
    const budgetsText = financialContext.currentBudget
      .map((b: any) => `- ${b.name}: Budget Limit €${b.limit}/mo`)
      .join('\n');

    const averagesText = Object.entries(financialContext.historicalAverages)
      .map(([cat, val]) => `- ${cat}: Actual Average spend/income of €${val}/mo`)
      .join('\n');

    const eventsText = financialContext.futureEvents
      .map((e: any) => `- Month ${e.monthOffset + 1}: "${e.label}" (${e.type}) of €${e.amount} in ${e.category}`)
      .join('\n');

    const trajectoryText = financialContext.projectionsSummary
      .map((p: any, i: number) => `  Month ${i + 1} (${p.month}): Income: €${p.income}, Expenses: €${p.expenses}, Net: €${p.net}, Cash Remaining: €${p.cash}`)
      .join('\n');

    // Format month-by-month breakdown — most recent 36 months to keep prompt size manageable
    const breakdown: Record<string, { income: number; spend: Record<string, number> }> = financialContext.monthlyBreakdown || {};
    const sortedMonths = Object.keys(breakdown).sort().slice(-36); // oldest → newest, max 36
    const monthlyBreakdownText = sortedMonths.length > 0
      ? sortedMonths.map(mk => {
          const { income, spend } = breakdown[mk];
          const spendParts = Object.entries(spend)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([cat, amt]) => `${cat}: €${amt}`)
            .join(' | ');
          return `  ${mk}  Income: €${income}  |  ${spendParts}`;
        }).join('\n')
      : 'No monthly breakdown available.';

    // Diagnostic log — visible in Cloud Run logs
    console.log(`[AI] monthlyBreakdown months received: ${sortedMonths.length}`, sortedMonths.length > 0 ? `(${sortedMonths[0]} → ${sortedMonths[sortedMonths.length - 1]})` : '(empty)');


    const systemInstructions = `
You are Rob's Financial Planner AI Coach & Analyst. 🧘‍♂️📊
Your mission is to serve as an empathetic, encouraging financial coach, combined with a highly rigorous, data-driven professional financial analyst.

Persona Rules:
- Support & Motivation: Use warm, encouraging, non-judgmental language. Financial planning can be stressful, so help the user feel empowered, calm, and in control of their future.
- Hard Analytical Truths: Do NOT sugarcoat or ignore problems. If their budget is unsustainable, if they are burning cash, or if their runway is negative, tell them with directness and exact numerical calculations.
- Be Actionable: Offer specific ideas to optimize spending, manage debt, and extend their financial runway.
- Numbers First: Always ground your comments in the provided data. If they ask a hypothetical question, calculate the exact difference it would make in their 24-month ending balance.
- Period Analysis: When asked about a specific period (e.g. "last 3 months", "Q1 2026", "last year"), use the Month-By-Month Breakdown table below to calculate precise averages or totals for that window. Do NOT fall back to all-time averages when period-specific data is available.

Current User Financial Data:
- Initial Starting Cash: €${financialContext.initialCash}
- Categorized Monthly Budgets (Limits set by user):
${budgetsText}
- Historical All-Time Spending Averages (use for general benchmarks):
${averagesText}
- Future Scheduled Transactions/Adjusters:
${eventsText || 'None scheduled'}
- Month-By-Month Actual Breakdown (use this for ALL period-specific questions — "last N months", specific quarters, trend analysis):
${monthlyBreakdownText}
- Projected 24-Month Ending Cash Trajectory (using current budgets + adjusters):
${trajectoryText}
`;


    if (mode === 'report') {
      // Return a structured JSON report auditing the user's finances
      const prompt = `
Generate a comprehensive, structured financial audit based on my data.
You must return a raw JSON object matching the schema below. Do not wrap the JSON in markdown code blocks, just return raw text.

JSON Schema:
{
  "summary": "Warm, encouraging overall assessment of their monthly finances and trajectory.",
  "savingsRateAdvice": "Specific analysis of their monthly savings rate (income vs expenses) and how it compares to target benchmarks, including numerical feedback.",
  "subscriptionNotes": "Analysis of their monthly subscription spend, cumulative 24-month cost, and tips on auditing them.",
  "runwayRiskAlerts": "Explicit warning if their cash balance goes negative in the 24 months, indicating exactly which month is the point of exhaustion, or positive confirmation if they are safe.",
  "actionableSteps": [
    "Step 1: First clear action item",
    "Step 2: Second action item",
    "Step 3: Third action item"
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemInstructions + '\n\n' + prompt }] }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const rawText = response.text || '';
      try {
        const parsedReport = JSON.parse(rawText.trim());
        return NextResponse.json({ report: { ...parsedReport, timestamp: Date.now() } });
      } catch (parseError) {
        console.error("JSON parsing error:", rawText, parseError);
        return NextResponse.json({ error: "Failed to generate structured report. Try again." }, { status: 500 });
      }
    } else {
      // Standard Chat session
      const formattedContents = [];
      
      // Seed context
      formattedContents.push({ role: 'user', parts: [{ text: systemInstructions }] });
      formattedContents.push({ role: 'model', parts: [{ text: "Understood. I have initialized your financial model and am ready to coach you on your numbers. What would you like to explore today?" }] });

      // Add chat history
      if (history && history.length > 0) {
        for (const msg of history) {
          formattedContents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      }

      // Add the final user message
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: formattedContents
      });

      return NextResponse.json({ reply: response.text });
    }

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while connecting to the AI Advisor." },
      { status: 500 }
    );
  }
}
