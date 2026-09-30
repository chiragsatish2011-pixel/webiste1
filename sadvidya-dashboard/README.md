# Sadvidya Translation Scorecard

A personal dashboard for the Sadvidya Magazine translation work. Upload the Flag
Report PDF Claude gives you after each English → Hindi (or Gujarati) review, and
the dashboard scores the article out of 10, explains the result in simple
English, and shows how the translations improve over time.

**Everything runs in your browser.** No login, no server, no AI calls. Reports
are stored in this browser's IndexedDB and never leave your machine.

---

## Running it

```bash
cd sadvidya-dashboard
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

Other commands:

| Command | What it does |
|---|---|
| `npm run dev` | Run it on your machine while you use it |
| `npm test` | Run the tests (scoring, parser, insights, backup) |
| `npm run build` | Build a `dist/` folder you can put on any static host |
| `npm run preview` | Preview that build locally |
| `npm run make-sample-pdf` | Rebuild `public/sample-flag-report.pdf` |

### Putting it online

**GitHub Pages is set up and is the one to use.** `.github/workflows/deploy-scorecard.yml`
builds the dashboard and publishes it on every push to `main` that touches
`sadvidya-dashboard/`. It runs the tests first, so a broken build never goes live.

One switch, once: repository **Settings → Pages → Source = GitHub Actions**.
Then merge to `main` and the site appears at
<https://chiragsatish2011-pixel.github.io/webiste1/>. You can also redeploy by
hand from the **Actions** tab.

Two details the workflow handles for you: Pages serves the site under
`/webiste1/`, so it builds with `--base=/webiste1/` and the router picks that up
from `import.meta.env.BASE_URL`; and Pages has no rewrite rules, so `index.html`
is copied to `404.html` and a deep link such as `/webiste1/articles/3` still
loads the app.

#### If you ever move to Netlify or Vercel instead

The config for both is still in the repository, building from the
`main` branch. The config files sit at the repository root because the dashboard
lives in a sub-folder next to another site:

- `netlify.toml` — builds inside `sadvidya-dashboard/`, publishes `dist/`,
  and sends every unknown path to `index.html` so React Router deep links work.
- `vercel.json` — the same three things for Vercel.
- `public/_redirects` — Netlify's fallback rule, in case the site is created
  without reading `netlify.toml`.

**Netlify, once:** log in → *Add new site* → *Import an existing project* →
pick `chiragsatish2011-pixel/webiste1` → leave the build settings as they are
(`netlify.toml` fills them in) → *Deploy*. Production branch: `main`.

**Vercel, once:** log in → *Add New… → Project* → import the same repository →
leave Framework Preset as *Other* (`vercel.json` fills in the rest) → *Deploy*.
Production branch: `main`.

After that, every push to `main` redeploys automatically, and pull requests get
their own preview URL.

Nothing about the deployment changes how your data is stored: reports still live
only in the browser you use, one set per browser. The public site is the app, not
your reports.

---

## The three pages

1. **Home — Progress Garden (`/`)** — one animated diya per article (flame size
   and brightness follow the score), four stat cards, the score journey, the
   parameter radar, flags by parameter, your common mistakes, and milestone badges.
2. **Articles (`/articles`)** — searchable, sortable cards; click one for its
   report card with parameter scores, what went well, what to work on, and every
   flag with the English and Hindi lines side by side.
3. **Add Report (`/add`)** — drop the Flag Report PDF, check what the parser read
   in an editable table, then save. Nothing is stored until you press **Save Report**.

The ⚙ button opens settings: export a JSON backup, import one, load or remove
demo data, clear everything, and set the language filter (All / Hindi / Gujarati)
that applies across the dashboard.

---

## Scoring

Each parameter starts at 10. Every **FLAGGED** item deducts points; **UNSURE**
items are tracked but cost nothing.

| Parameter | Per flag | Weight |
|---|---|---|
| Meaning Drift | −2.0 | 35% |
| Voice & Conviction | −1.5 | 25% |
| Natural Phrasing | −1.0 | 25% |
| Term Consistency | −1.0 | 15% |

Overall score = the weighted average of the four, rounded to one decimal.
A CLEAN report scores 10.0 everywhere.

Grades: 9–10 "Written in Hindi" · 7.5–8.9 "Almost there" · 6–7.4 "Needs polish"
· below 6 "Reads like a translation".

**To change any of this, edit one file: `src/config/scoring.ts`.** The
deductions, the weights, the grade labels, the parameter colours, the tips and
the 8.0 target line all live there, and the whole dashboard follows.

---

## The Flag Report format

Ask Claude to write reviews in this format before saving them as PDF. The
**Copy review template** button on the Add Report page puts it on your clipboard.

```
FLAG REPORT
Article: <title>
Date: <YYYY-MM-DD>
Language: Hindi
Status: FLAGGED   (or CLEAN)

--- FLAG 1 ---
Line: 4
Parameter: Natural Phrasing
Status: FLAGGED
Term: (optional)
English: <english line>
Hindi: <hindi line>
Reason: <one or two sentences>

--- FLAG 2 ---
...

SUMMARY
Meaning Drift: 1 | Natural Phrasing: 2 | Term Consistency: 0 | Voice & Conviction: 1 | Unsure: 1
```

The parser is forgiving: parameter names match regardless of case, spacing or
small variations ("meaning-drift", "Term consistency", "tone"). If it reads
something wrong you can fix it in the review table, and if it cannot read the
PDF at all you get a blank form to fill in by hand.

`public/sample-flag-report.pdf` is a working example you can drop in to try the
flow. (Its Hindi lines are in Roman letters only because the generator script
can't draw Devanagari; real reports in Devanagari parse fine.)

---

## Where things live

```
sadvidya-dashboard/
├─ index.html
├─ public/sample-flag-report.pdf   a real Flag Report PDF for testing
├─ scripts/make-sample-pdf.mjs     builds that sample PDF
└─ src/
   ├─ main.tsx, App.tsx            entry point, nav and routes
   ├─ index.css                    the cream/terracotta design language
   ├─ types.ts                     what a Report and a Flag are
   ├─ config/scoring.ts            ← the one file to adjust scoring
   ├─ db/db.ts                     IndexedDB storage (Dexie)
   ├─ context/DataContext.tsx      shared reports + language filter
   ├─ lib/
   │  ├─ scoring.ts                the scoring algorithm
   │  ├─ parseFlagReport.ts        text → structured flags
   │  ├─ pdf.ts / pdfLines.ts      PDF → text (pdfjs-dist)
   │  ├─ insights.ts               streaks, weak spots, repeat offenders, badges
   │  ├─ demoData.ts               the six demo articles
   │  ├─ backup.ts                 JSON export / import
   │  └─ *.test.ts                 the tests for all of the above
   ├─ components/                  Diya, charts, review table, settings drawer…
   └─ pages/                       Home, Articles, ArticleDetail, AddReport
```

## Stack

React + Vite + TypeScript · Tailwind CSS · Recharts · Framer Motion ·
pdfjs-dist · Dexie (IndexedDB) · React Router · Vitest.
Fonts: Poppins (headings), Lora (body), Noto Sans Devanagari (Hindi/Gujarati).
