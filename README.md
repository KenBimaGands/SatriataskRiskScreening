# SATRIA
### AI-Powered Corporate Tax Risk Screening for Southeast Asia

> Helping government tax investigators identify suspicious companies faster — using public data alone.

---

## What is SATRIA?

SATRIA is a web-based risk screening platform that helps Indonesian government tax investigators detect suspicious corporate tax behavior — transfer pricing manipulation, debt shifting, royalty stripping, and shell company layering — using exclusively publicly available data.

Indonesia loses approximately **USD 4.86 billion per year** to corporate tax avoidance. Despite this, the Direktorat Jenderal Pajak (DJP) investigates fewer than 30–50 companies annually — not because the problem is hidden, but because investigators lack the tools to screen hundreds of companies quickly.

SATRIA replaces:
- Random tip-based case selection → **data-driven risk ranking**
- 3–6 hours of manual PDF reading per company → **automated signal extraction**
- Fragmented registry lookups across 4+ countries → **one ownership network graph**
- Manually written investigation memos → **auto-generated, fully-cited reports**

---

## The Problem in Numbers

| Stat | Source |
|------|--------|
| USD 4.86B lost/year in Indonesia to tax avoidance | Tax Justice Network |
| 1 in 4 Indonesian firms admitted to tax evasion | World Bank Survey 2023 |
| Indonesia ranks 11th globally for corporate tax avoidance intensity | ICTD |
| DJP investigates ~30 companies/year manually from 900+ listed | IDX |
| 0 free, SEA-specific, investigator-facing tools exist | Market research |

---

## The Four Avoidance Methods SATRIA Detects

| Method | How It Works | Real Indonesian Case |
|--------|-------------|---------------------|
| **Transfer Pricing** | Selling to related parties at artificial prices to shift profit to low-tax jurisdictions | PT Adaro Energy via Singapore subsidiary |
| **Debt Shifting** | Parent loans to subsidiary at inflated interest rates — interest wipes out taxable profit | Widespread in mining and plantation sectors |
| **Royalty Stripping** | Related entity "owns" the brand or IP — operating company pays inflated royalties | PT Bentoel / BAT — USD 14M/yr |
| **Shell Layering** | 3–5 anonymous companies across jurisdictions obscure the beneficial owner | Asian Agri Group — IDR 1.259T court verdict |

---

## Product Overview

SATRIA is built around three pillars:

```
┌─────────────────────────────────────────────────────┐
│  PILLAR 1 — TRIAGE        "Which company?"          │
│  Ranked risk dashboard of all IDX-listed companies  │
├─────────────────────────────────────────────────────┤
│  PILLAR 2 — DIAGNOSIS     "Why suspicious?"         │
│  Financial anomaly detection + ownership graph      │
├─────────────────────────────────────────────────────┤
│  PILLAR 3 — DOCUMENTATION "How do I prove it?"      │
│  Auto-generated, fully-cited investigation reports  │
└─────────────────────────────────────────────────────┘
```

---

## Features

### Pillar 1 — Triage
| ID | Feature | Priority |
|----|---------|----------|
| F-01 | Company listing dashboard + risk ranking | MVP |
| F-02 | Filter by avoidance method type | MVP |
| F-03 | Risk score gauge per company (0–100) | MVP |
| F-04 | Alert system — ETR drop, revenue divergence, new tax haven link | MVP |
| F-05 | Watchlist — star + private notes per company | MVP |
| F-06 | Bookmark collections — named case folders (e.g. "Q1 2026 Priority Cases") | MVP |
| F-07 | Homepage news feed + new filing alerts | Nice-to-have |

### Pillar 2 — Diagnosis: Financial Signals
| ID | Feature | Priority |
|----|---------|----------|
| F-08 | Effective tax rate vs statutory rate chart (grouped bar, 5-year) | MVP |
| F-09 | Multi-year financial table (revenue → ETR, color-coded) | MVP |
| F-10 | Net margin vs sector peers + Z-score table | MVP |
| F-11 | Persistence score per signal (consecutive years above threshold) | MVP |
| F-12 | Related-party payment breakdown by jurisdiction (donut chart) | MVP |
| F-13 | Implied RP loan interest rate calculator | MVP |
| F-14 | Flagged mystery entities list (received payments, no disclosed ownership) | MVP |
| F-15 | Royalty stripping signals (royalty ratio + mgmt fee ratio) | V2 |

### Pillar 2 — Diagnosis: Ownership & Conduct
| ID | Feature | Priority |
|----|---------|----------|
| F-16 | Ownership network graph (interactive, color-coded by jurisdiction risk) | MVP |
| F-17 | Tax haven affiliations counter + jurisdiction badge | MVP |
| F-18 | Shared director cross-reference across entities | V2 |
| F-19 | Entity incorporation timing check (vs first transaction date) | V2 |
| F-20 | Prior conduct flags (tax dispute NLP, deferred tax spike, court verdicts) | MVP |
| F-21 | News feed per company (tax-specific NLP filter) | Nice-to-have |
| F-22 | Leaked database integration (OCCRP Aleph + ICIJ Offshore Leaks) | V2 |

### Pillar 3 — Documentation
| ID | Feature | Priority |
|----|---------|----------|
| F-23 | Investigator annotation layer (private findings on top of public score) | MVP |
| F-24 | AI-generated suspicion summary (template-based, no LLM required) | MVP |
| F-25 | Recommended next actions (rule-based, cites PMK-213) | MVP |
| F-26 | PDF report generator (public score + investigator annotations) | MVP |

> **MVP = 18 features** | **V2 = 4 features** | **Nice-to-have = 2 features** | **Total = 26 features**

---

## Risk Scoring Engine

Every company receives a risk score from 0–100 based on a weighted combination of signals:

```
Risk Score = (ETR_score × 0.25)
           + (margin_score × 0.20)
           + (RP_haven_score × 0.20)
           + (debt_score × 0.15)
           + (ownership_score × 0.10)
           + (conduct_score × 0.10)

Each signal score = min(100, Z_score × 20)
Persistence multiplier: if anomaly persists 3+ years → score × 1.3 (capped at 100)
```

### Risk Tiers

| Score | Tier | Recommended Action |
|-------|------|-------------------|
| 0–30 | 🟢 Low | No action. Annual re-screen. |
| 31–60 | 🟡 Medium | Add to watchlist. Monitor next filing. |
| 61–80 | 🔴 High | Recommend preliminary screening. Request TP documentation. |
| 81–100 | ⛔ Critical | Escalate to formal audit immediately. |

---

## Key Design Principles

**Public score is immutable.** The algorithmic risk score is computed from public data only and cannot be modified by investigator input. This ensures objectivity and legal defensibility.

**Investigator annotations are a private layer.** Investigators can add private findings (from DJP internal systems, whistleblower tips, etc.) as annotations that enrich their personal report — but never feed back into the shared risk score.

**Every flag is explainable.** No black-box scores. Every component shows the formula used, the company's value, the sector comparison, and the source document + page number.

**Source citations are mandatory.** Every figure in an exported report is linked to its filing source: `PT CoalCo Annual Report 2023, p.187, Note 32 — Related Party Transactions`.

---

## Data Sources

| Source | What We Use | Access |
|--------|------------|--------|
| IDX (idx.co.id) | Annual reports, financial statements, RP footnotes | PDF download + scraping |
| OpenCorporates | Company registries, directors, incorporation dates | API (freemium) |
| ACRA BizFile | Singapore entity details | Manual + SGD 5.50/lookup |
| ICIJ Offshore Leaks | Panama/Pandora Papers entity matching | Free API |
| OCCRP Aleph | Cross-jurisdiction leaked dataset search | Free API |
| Tax Court Indonesia | Published verdict records | Web scraping |
| News APIs | Tax-related press coverage | NewsAPI.org + scraping |

All data sources are **publicly available**. SATRIA does not require access to DJP internal systems.

---

## How SATRIA Differs from Coretax

A common question: *doesn't Coretax (DJP's compliance platform) already do this?*

| Dimension | Coretax | SATRIA |
|-----------|---------|--------|
| Data used | Internal tax returns filed BY companies | Public annual reports + open registries |
| Who uses it | Taxpayers (to file) + DJP admin (to process) | Tax investigators + audit selection teams |
| Purpose | Compliance processing | Risk triage + investigation support |
| Workflow position | After a company files its return | Before an investigator opens a case |
| Blind spot | Accepts declared data at face value | Cannot access internal tax returns |

> **"Coretax processes what companies declare. SATRIA screens what companies hide in plain sight."**

They are sequential steps in the same workflow — not competing products.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  DATA LAYER                                             │
│  IDX scraper → OpenCorporates API → ICIJ API →         │
│  News feeds → PostgreSQL database                       │
├─────────────────────────────────────────────────────────┤
│  PROCESSING LAYER                                       │
│  Z-score engine → Risk scoring → NLP extractor →       │
│  Ownership graph builder → Alert engine                 │
├─────────────────────────────────────────────────────────┤
│  PRESENTATION LAYER                                     │
│  React frontend → D3.js / Cytoscape.js (ownership) →   │
│  Chart.js (financial charts) → PDF generator           │
├─────────────────────────────────────────────────────────┤
│  USER LAYER                                             │
│  Per-user: watchlist, bookmark collections,            │
│  annotations — isolated, never shared                  │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Chart.js, D3.js or Cytoscape.js |
| Backend | Python (FastAPI) or Node.js (Express) |
| Database | PostgreSQL |
| PDF Generation | WeasyPrint (Python) or Puppeteer (Node.js) |
| NLP | spaCy or simple keyword extraction (MVP) |
| Graph data | NetworkX (Python) or graph DB for V2 |
| Data ingestion | Python scrapers + REST API calls |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/satria.git
cd satria

# Install dependencies
npm install          # frontend
pip install -r requirements.txt --break-system-packages  # backend

# Set up environment variables
cp .env.example .env
# Fill in: DATABASE_URL, OPENCORPORATES_API_KEY, NEWS_API_KEY

# Run database migrations
python manage.py migrate

# Start development servers
npm run dev          # frontend (port 3000)
python manage.py runserver  # backend (port 8000)
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/satria

# External APIs
OPENCORPORATES_API_KEY=your_key_here
NEWS_API_KEY=your_key_here

# Optional (V2)
OCCRP_ALEPH_API_KEY=your_key_here

# App config
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

## Project Structure

```
satria/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/          # F-01 Company listing + risk ranking
│   │   │   ├── CompanyDetail/      # F-08–F-20 Diagnosis features
│   │   │   ├── OwnershipGraph/     # F-16 Network visualization
│   │   │   ├── Watchlist/          # F-05 Watchlist
│   │   │   ├── Collections/        # F-06 Bookmark collections
│   │   │   ├── Annotations/        # F-23 Investigator layer
│   │   │   └── ReportGenerator/    # F-26 PDF export
│   │   ├── pages/
│   │   └── utils/
├── backend/
│   ├── api/
│   │   ├── companies/              # Company data + risk scores
│   │   ├── signals/                # Detection signal calculators
│   │   ├── ownership/              # Graph builder
│   │   ├── reports/                # PDF generation
│   │   └── users/                  # Watchlist, collections, annotations
│   ├── ingestion/
│   │   ├── idx_scraper.py          # IDX annual report downloader
│   │   ├── opencorporates.py       # Registry API client
│   │   ├── icij_matcher.py         # Leaked database matching
│   │   └── news_fetcher.py         # News API + NLP filter
│   └── scoring/
│       ├── zscore_engine.py        # Statistical anomaly detection
│       ├── risk_calculator.py      # Weighted score aggregation
│       └── nlp_extractor.py        # Footnote keyword extraction
├── docs/
│   ├── PRD.docx                    # Product Requirements Document
│   ├── feature_spec.docx           # Technical feature specification
│   └── api_reference.md            # API documentation
└── README.md
```

---

## Reference Cases

All three of these real Indonesian cases would score **Critical (81–100)** on SATRIA's risk engine using only publicly available annual report data.

| Company | Method | SATRIA Detection Signal | Revenue Loss |
|---------|--------|------------------------|-------------|
| PT Adaro Energy | Transfer Pricing | Low net margin + high RP concentration to SGP + Coaltrade not listed as subsidiary | USD 14M+/yr |
| PT Bentoel / BAT | Royalty Stripping + TP | Royalty ratio anomaly + management fee Z-score + RP payments to UK/SGP entities | USD 14M/yr |
| Asian Agri Group | Transfer Pricing | Net margin collapse vs sector peers + RP sales concentration + prior court verdict | IDR 1.259T |

---

## Roadmap

- **v1.0 (MVP)** — Transfer pricing + debt shifting detection, Indonesia (IDX), 18 features
- **v2.0** — Royalty stripping NLP, shared director detection, OCCRP/ICIJ integration
- **v3.0** — Malaysia, Vietnam coverage; real-time filing alerts; shell cycle detection
- **v4.0** — ASEAN-wide coverage; NGO/journalist access tier; optional DJP API integration

---

## Contributing

This project was built as a hackathon submission by a team from Universitas Gadjah Mada. Contributions, feedback, and issue reports are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## Disclaimer

SATRIA is a **risk screening tool** — not a legal determination system. All output is labeled "Preliminary — For Investigative Use Only. Not a Legal Determination." Every score is traceable to its public source. Investigators make legal judgments; SATRIA surfaces which companies deserve investigation.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built at Universitas Gadjah Mada | March 2026 | Hackathon — Financial & Tax Domain*
