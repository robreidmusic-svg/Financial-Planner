<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all
differ from your training data. Read `node_modules/next/dist/docs/` before writing
any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project Agent: Financial Simulator

**Read `design.md` before writing any JSX or CSS.**

## Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict)
- **Styling**: Tailwind CSS v4 — config via `@theme` block in `src/app/globals.css`
- **Charts**: Recharts — do not introduce a second charting library
- **Icons**: lucide-react — do not introduce a second icon library
- **AI**: `@google/genai` via `/api/chat` route — server-side only, never import in client components
- **No router**: Single-page tab layout; tab state lives in `src/app/page.tsx`

## Architecture
- **Single context**: `src/context/FinanceContext.tsx` is the sole source of truth for
  `transactions`, `budgets`, `categoryAverages`, and `isDataLoaded`.
- **Derived data in components**: Expensive computations (filtered sets, pie data, monthly
  totals) live in `useMemo` hooks inside the component that needs them — not in context.
- **Context API is stable**: Do not change the shape of values/functions exported from
  `FinanceContext` without updating every consumer.
- **Components**: All components in `src/components/`. No sub-folders unless >5 related files.

## Key Utilities
- **Currency**: Always use `formatCurrency` — `en-IE`, `EUR`, `maximumFractionDigits: 0`
- **Date strings**: Transactions use `YYYY-MM-DD` ISO format. Month keys are `YYYY-MM`.
- **Category exclusions**: Always exclude `'Income'` and `'Spare Change Transfers'` from
  spending aggregations.

## Deployment
- **Platform**: Google Cloud Run
- **Project ID**: `robs-financial-planner`
- **Service**: `financial-planner`
- **Region**: `europe-west1`
- **Registry image**: `europe-west1-docker.pkg.dev/robs-financial-planner/cloud-run-source-deploy/financial-planner:latest`

**Deploy sequence** (always both steps in order):
```bash
# 1. Build and push image via Cloud Build
gcloud builds submit --tag europe-west1-docker.pkg.dev/robs-financial-planner/cloud-run-source-deploy/financial-planner:latest .

# 2. Deploy new revision to Cloud Run
gcloud run deploy financial-planner \
  --image europe-west1-docker.pkg.dev/robs-financial-planner/cloud-run-source-deploy/financial-planner:latest \
  --region europe-west1 \
  --platform managed
```

**Pre-deploy gate**: Run `npx tsc --noEmit` — must pass with zero errors.

## What NOT to Do
- Do not add a client-side router (no React Router, no Next.js `useRouter` for tab switching)
- Do not add `useState` for things that can be derived with `useMemo`
- Do not use inline `style` objects for values that are covered by CSS tokens
- Do not commit `.env` — secrets are injected at runtime via Cloud Run environment variables
- Do not use `px` for layout spacing — use Tailwind scale or `rem`
- Do not add a second chart library, icon library, or date library
