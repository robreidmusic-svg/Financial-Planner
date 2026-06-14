# Financial Simulator — Dark Zinc Design System

## Philosophy

Premium dark-mode financial tool. Feels like a Bloomberg terminal crossed with a
modern SaaS dashboard — precise, data-dense, and trustworthy. Every surface
should feel considered and deliberate, never generic. The amber gold accent is the
single source of energy; everything else recedes into disciplined zinc neutrals.

---

## 1. Color Tokens

Defined in `src/app/globals.css`. **Always use tokens, never raw hex in components.**

### Base Surface Palette
| Token | Hex | Usage |
|---|---|---|
| `--background` | `#09090b` | Page background (near-black) |
| `--foreground` | `#f4f4f5` | Primary body text |
| `--card-bg` | `#18181b` | Card / panel fill |
| `--card-border` | `#27272a` | Card borders and dividers |

### Brand Accents
| Token | Hex | Usage |
|---|---|---|
| `--accent-gold` | `#fbbf24` | Primary CTA, KPI highlights, footer totals |
| `--accent-gold-hover` | `#f59e0b` | Active states, selected buttons |
| `--accent-sage` | `#34d399` | Income, positive delta, success states |
| `--accent-rose` | `#fb7185` | Overspend, negative delta, warnings |
| `--accent-violet` | `#a78bfa` | Forecasting, projections, AI indicators |

### Zinc Neutral Scale (Tailwind)
Use the `zinc-*` scale for all neutral UI — never raw grey:
- `zinc-100` (`#f4f4f5`) — primary text
- `zinc-300` (`#d4d4d8`) — secondary text on hover
- `zinc-400` (`#a1a1aa`) — muted labels, chart text
- `zinc-500` (`#71717a`) — inactive button text, placeholder text
- `zinc-600` (`#52525b`) — footer sub-labels, borders on inactive controls
- `zinc-700` (`#3f3f46`) — divider lines
- `zinc-800` (`#27272a`) — section dividers, grid lines
- `zinc-900` (`#18181b`) — card fill used directly

---

## 2. Typography

| Role | Font | Class |
|---|---|---|
| UI, headings, body | Geist Sans | `font-sans` (default) |
| All numbers, all currency | Geist Mono | `font-mono` |

**Rule**: Every currency value, every percentage, every numeric KPI uses `font-mono`.
Never use a serif or display font anywhere in this project.

---

## 3. Surface Hierarchy

Four levels of depth from deepest to most elevated:

1. **Page** — `bg-[#09090b]` bare background
2. **Panel** — `.glass-panel`: `rgba(24,24,27,0.7)` + `backdrop-filter: blur(12px)` + `1px solid rgba(63,63,70,0.3)`
3. **Card** — `.glass-card`: `rgba(39,39,42,0.3)` + `backdrop-filter: blur(8px)` + `1px solid rgba(63,63,70,0.2)`
4. **Row hover** — `backgroundColor: COLORS[index] + '1a'` (10% alpha tint of the row's category colour)

Never add a heavy `box-shadow` to a card. Depth comes from backdrop blur and subtle borders, not shadows.

---

## 4. Typography Scale for Components

| Role | Class |
|---|---|
| Section heading | `text-xs font-semibold tracking-wider uppercase text-zinc-400` |
| KPI primary value | `text-2xl font-bold font-mono text-zinc-100` |
| KPI secondary label | `text-[10px] uppercase tracking-widest text-zinc-500` |
| Data row label | `text-xs leading-tight text-zinc-300` |
| Data row value | `font-mono font-semibold text-xs text-right` |
| Footer total | `font-mono font-bold text-xl text-amber-400` |
| Muted sub-label | `text-[10px] text-zinc-600` |
| Chart axis / tick | `fontSize: 9, fontFamily: var(--font-mono)` |

---

## 5. Button Rules

**Active / selected state**
```
backgroundColor: '#f59e0b'
color: '#18181b'
border: '1px solid #f59e0b'
```

**Inactive / default state**
```
backgroundColor: 'transparent'
color: '#71717a'
border: '1px solid #3f3f46'
```

**Shape**: Use `rounded-lg` for rectangular controls (date pickers, action buttons).
Use `rounded-full` for pill toggles.

All buttons: `transition-all duration-150`

---

## 6. Interaction Patterns

- **Row cross-highlight**: donut segments and legend rows share `activeIndex` state — hovering either highlights both
- **Hover tint**: `backgroundColor: COLOR + '1a'` (10% alpha) — never a border change or shadow lift
- **Swatch scale**: `transform: isActive ? 'scale(1.4)' : 'scale(1)'` on colour swatches
- **Bar fill animation**: `transition: width 0.4s ease` on progress bars
- **State transitions**: `transition-all duration-150` on interactive elements
- **Opacity fade on dim**: `opacity: activeIndex === null || activeIndex === index ? 1 : 0.28` on unfocused segments

---

## 7. Chart Conventions (Recharts)

**Tooltip**
```js
contentStyle: {
  backgroundColor: '#18181b',
  border: '1px solid #3f3f46',
  borderRadius: '12px',
  padding: '10px 14px'
}
itemStyle: { color: '#f4f4f5', fontSize: '13px' }
labelStyle: { color: '#a1a1aa', fontSize: '11px', marginBottom: 4 }
```

**Grid lines**: `<CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />`

**Axes**: `stroke="#52525b"`, `fontSize={9}`, `fontFamily="var(--font-mono)"`, `tickLine={false}`

**Donut geometry**: `innerRadius={100}`, `outerRadius={162}`, `paddingAngle={2}`, `strokeWidth={0}`

**Rule**: No inline segment labels on any chart. Always use tooltip + external legend/table.

---

## 8. Category Colour Palette

18-colour cycle for category colouring. Always assign in index order — never randomise.

```js
const COLORS = [
  '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6',
  '#38bdf8', '#fb923c', '#2dd4bf', '#f472b6',
  '#94a3b8', '#a3e635', '#60a5fa', '#fbbf24',
  '#34d399', '#c084fc', '#fb7185', '#22d3ee',
  '#facc15', '#4ade80',
];
```

---

## 9. Custom CSS Utilities (from `globals.css`)

| Class | Use |
|---|---|
| `.glass-panel` | Outer wrapper panels (sidebar, full-width sections) |
| `.glass-card` | Inner content cards |
| `.ledger-grid` | Background grid pattern for the P&L ledger view |
| `.ai-glow-orb` | Pulsing amber glow for AI Advisor avatar only |
| `.scrollbar-hide` | Hide scrollbar on scrollable pill rows |

---

## 10. Implementation Checklist

Before shipping any UI change, verify:
- [ ] All currency values use `font-mono` and `formatCurrency` (en-IE, EUR, 0dp)
- [ ] New colours use existing CSS tokens — no raw hex in JSX style props
- [ ] Hover states use the `+ '1a'` alpha tint pattern, not borders or shadows
- [ ] Section headings match the `text-xs font-semibold tracking-wider uppercase text-zinc-400` class
- [ ] Any new chart respects the tooltip contentStyle object above
- [ ] New interactive elements have `transition-all duration-150`
