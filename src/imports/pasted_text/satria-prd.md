


SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026



## PRODUCT REQUIREMENTS DOCUMENT

## SATRIA

AI-Powered Corporate Tax Risk Screening

for Southeast Asia

Helping government tax investigators identify suspicious companies faster — using public data alone.

## VERSION

## 1.0

## DATE

## March 2026

## STATUS

## Draft —
## Hackathon

## TOTAL FEATURES

## 26

## MVP FEATURES

## 18


What is SATRIA?

SATRIA is a web-based risk screening platform that helps Indonesian government tax investigators identify
suspicious corporate tax behavior using exclusively publicly available data. It replaces random tip-based
case selection, weeks of manual PDF reading, and fragmented cross-border registry lookups with a
data-driven triage dashboard, statistical anomaly detection, and auto-generated investigation reports.
Primary user: Budi Santoso — Senior Tax Investigator, DJP Transfer Pricing Unit, Jakarta.



## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 1 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


## 1

## Problem Statement
The scale, mechanisms, and structural causes of undetected tax avoidance in Indonesia


1.1 Scale of the Problem
Indonesia loses approximately USD 4.86 billion per year to corporate tax avoidance — roughly equivalent to
its entire national health insurance budget. The country ranks 11th globally for intensity of corporate tax
avoidance, with a tax-to-GDP ratio of 11–12%, well below the OECD average of 34%. A 2023 World Bank
survey covering 2,955 registered firms found approximately 1 in 4 Indonesian formal companies indirectly
admitted to tax evasion.

## 1.2 The Four Avoidance Methods

## Method

## How It Works

## Real Indonesian Case

## Detectable From

## Transfer Pricing

Selling goods or services to related parties at
artificial prices to shift profit to low-tax jurisdictions.
The most common method in SEA.
PT Adaro Energy via
Singapore subsidiary
## Coaltrade Services

Annual report
financials + RP
footnotes

## Debt Shifting

Parent loans to subsidiary at inflated interest rates.
Interest is tax-deductible, wiping out taxable profit
before assessment.
Widespread in mining
and plantation sectors

Balance sheet +
interest expense
line

## Royalty Stripping

Related company 'owns' the brand or IP. Operating
company pays inflated royalties that drain profit
before tax.
PT Bentoel / BAT —
USD 14M/yr lost

RP footnotes +
royalty expense
line

## Shell Layering

3–5 anonymous companies across jurisdictions
obscure the ultimate beneficial owner and
complicate money trail tracing.
Asian Agri Group — IDR
1.259T court verdict

## Ownership
registry +
subsidiary table


## 1.3 Why Fraud Goes Undetected — The Four Structural Blockers

## Blocker

## Current State

SATRIA's Answer

## 1

Data fragmentation

Evidence spread across 10+
jurisdictions. No aggregated public
view across IDX, OpenCorporates,
ACRA simultaneously.
Aggregates all public sources into one
risk dashboard. Cross-border ownership
chains built automatically.

## 2

Technical legality

Transfer pricing is legal — only the
price is manipulated. Proving it
requires industry benchmarks
investigators rarely have access to.
Z-score engine compares each
company's ratios against sector peers.
Statistical deviation is the flag, not legal
judgment.

## 3

Capacity gap

DJP's investigation unit can screen
~30 companies/year manually.
Indonesia has 900+ IDX-listed
companies plus thousands of private
firms.
Automated screening of all 900+ listed
companies. Risk score ranks them —
Budi's 30 investigation slots go to the top
## 30.

## 4

Secrecy by design

BVI, Cayman Islands, some Singapore
structures allow anonymous beneficial
ownership. Trails go cold at the border.
Ownership graph shows partial chain
even where beneficial owner is unknown.

## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 2 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


MLAT filing recommended for unknown
nodes.


## 2

## Target Users & Persona
Primary user, pain points, and workflow context


## 2.1 Primary Persona

## BUDI SANTOSO
## Senior Tax Investigator

DJP Transfer Pricing Unit

## Jakarta, Indonesia

Age 38 | 12 yrs experience

## PRIMARY PERSONA

"I know something is wrong the moment I see the numbers. A company earns
trillions in revenue but declares almost no profit. But proving it takes me across
five countries and eighteen months — if I'm lucky."

## Current Tools:

Microsoft Excel, IDX filing portal (idx.co.id), Google Search, OCCRP Aleph. No
integrated platform. All work is copy-paste and manual cross-referencing.
## Capacity:

Investigates 8–12 companies per year at full depth. Unit can screen ~30
companies annually. Indonesia has 900+ IDX-listed companies.
## Environment:

Underfunded unit. No access to Moody's Orbis, Sayari, or Bloomberg. Budget for
new tools: near zero. Reports to supervisor who demands evidence-backed,
defensible investigation memos.

## 2.2 Core Pain Points

## #

## Pain Point

## Current Experience

SATRIA's Solution

## 1

No triage system — too
many companies

30 companies/year chosen by tips, gut
feel, or random quota from 900+. Hit
rate is low. Months wasted on clean
companies.
Risk-score dashboard ranks all 900+ by
suspicion. Budi's 30 investigation slots
automatically go to highest-risk targets.

## 2

Evidence buried in
footnotes

1,500+ pages of PDFs per company (5
years × 300 pages). Manual Ctrl+F for
keywords. Misses variant phrasing. 3–6
hrs per company just for screening.
NLP extraction automatically surfaces
related-party disclosures, tax dispute
language, and royalty references with
source page citation.

## 3

Can't connect
cross-border ownership

Manual registry lookups across 4+
countries. Dead ends at BVI/Cayman —
no public records. PowerPoint diagram
rebuilt every time new info found.
Ownership network graph auto-built
from public registries. Tax haven nodes
highlighted in red. Shared directors
flagged automatically.

## 4

Can't defend his case
selection

Go/no-go decision based on gut feel. No
auditable trail. Supervisor can reject
without data. Wrong companies
investigated — no system to improve.
Every flag traceable to source document
+ formula. Risk score explainable with
component breakdown.
Recommendations cite legal
frameworks (PMK-213).

## 5

Institutional knowledge
walks out the door

Budi's case context lives in his
notebook. If he transfers, all
Watchlist notes, collection annotations,
and investigation history stored per

## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 3 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


investigation history is lost. No
knowledge continuity in the unit.
user. Archived collections preserve
closed case context permanently.




## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 4 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


## 3

## Solution Overview
Product pillars, competitive positioning, and Coretax differentiation


## 3.1 Product Vision
SATRIA gives every government tax investigator in Southeast Asia the analytical power of a forensic
accountant — using only public data, at no cost, in minutes instead of months.


## 3.2 The Three Pillars

## PILLAR 1

## Triage
"Which company?"

Ranked risk dashboard of all
IDX-listed companies. Data-driven
case selection replaces tips and gut
feel.
## PILLAR 2

## Diagnosis
"Why suspicious?"

Automated financial anomaly
detection, NLP footnote extraction,
and ownership graph mapping.
Replaces weeks of manual PDF
analysis.
## PILLAR 3

## Documentation
"How do I prove it?"

Auto-generated, fully-cited
investigation memo. Replaces
manual Word document assembly
with a legally defensible report.

## 3.3 Competitive Positioning

## Tool

Free/Low Cost

SEA Focus

Investigator UX

## Ownership
## Graph

## Risk Score

## Moody's Orbis
## ✗ $20k+/yr

## Partial

## ✗

## ✓

## ✓

## Sayari
## ✗ Enterprise

## Partial

## Partial

## ✓

## ✗

OpenCorporates
## ✓ Freemium

## Partial

## ✗

## ✗

## ✗

OCCRP Aleph
## ✓ Free

## Partial

## ✗

## ✗

## ✗

## SATRIA

## ✓ Free

✓ SEA-first

✓ DJP workflow

## ✓

## ✓


3.4 Coretax Differentiation — Why SATRIA Is Not Redundant
Coretax (DJP's new compliance platform) processes what companies declare to the government. SATRIA
screens what companies disclose to the public market. They solve completely different problems.


## Dimension

Coretax (DJP)

## SATRIA

Data used

Internal tax returns filed BY the company to
## DJP
Public annual reports, stock exchange
filings, open registries

Who uses it

Taxpayers (to file) + DJP admin staff (to
process)
Investigators and audit selection teams


## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 5 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


Core purpose

Compliance processing — accept, validate,
and record what companies report
Risk triage — identify which companies are
worth auditing

Access model
Restricted — DJP internal system only
Open — built on public data, accessible to
investigators

Workflow position
After a company files its return
Before an investigator opens a case

Blind spot

Accepts declared data at face value —
cannot compare against industry peers or
public market disclosures
Cannot access internal tax returns —
screens public-facing data only


Pitch framing: 'Coretax tells DJP what a company declared. SATRIA tells Budi which companies are worth
auditing. They are sequential steps in the same workflow — not competing products.'



## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 6 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


## 4

## Feature Requirements
All 26 features across 3 pillars with priority tiers


Priority tiers: MVP = build for hackathon | V2 = post-hackathon roadmap | Nice-to-have = include if time
allows


## 4.1 Complete Feature Table

## ID

## Feature Name

## Pillar

## Priority

## Frontend

## Backend

## PILL
## AR 1
## —
## TRIA
## GE

## F-01

Company listing dashboard + risk
ranking
## Triage

## MVP

## Yes

## Yes

## F-02

Filter by avoidance method type
## Triage

## MVP

## Yes

## —

## F-03

Risk score gauge per company
## (0–100)
## Triage

## MVP

## Yes

## —

## F-04

Alert system — ETR drop, revenue
divergence, new haven
## Triage

## MVP

## Yes

## Yes

## F-05

Watchlist — star + private notes per
company
## Triage

## MVP

## Yes

## Yes

## F-06

Bookmark collections — named case
folders
## Triage

## MVP

## Yes

## Yes

## F-07

Homepage news feed + new filing
alerts
## Triage

## Nice-to-have

## Yes

## Yes

## PILL
## AR 2
## —
## DIAG
## NOSI
## S:
## FINA
## NCIA
## L
## SIGN
## ALS

## F-08

ETR vs statutory rate chart (grouped
bar, 5yr)
## Diagnosis

## MVP

## Yes

## Yes

## F-09

Multi-year financial table (revenue
through ETR)
## Diagnosis

## MVP

## Yes

## Yes

## F-10

Net margin vs sector peers + Z-score
table
## Diagnosis

## MVP

## Yes

## Yes


## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 7 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


## F-11

Persistence score per signal
(consecutive years)
## Diagnosis

## MVP

## —

## Yes

## F-12

RP payment breakdown by
jurisdiction (donut)
## Diagnosis

## MVP

## Yes

## Yes

## F-13

Implied RP loan interest rate
calculator
## Diagnosis

## MVP

## Yes

## Yes

## F-14

Flagged mystery entities list
## Diagnosis

## MVP

## Yes

## Yes

## F-15

Royalty stripping signals
## Diagnosis

## V2

## Yes

## Yes

## PILL
## AR 2
## —
## DIAG
## NOSI
## S:
## OWN
## ERS
## HIP &
## CON
## DUC
## T

## F-16

Ownership network graph (interactive,
color-coded)
## Diagnosis

## MVP

## Yes

## Yes

## F-17

Tax haven affiliations counter +
jurisdiction badge
## Diagnosis

## MVP

## Yes

## Yes

## F-18

Shared director cross-reference
## Diagnosis

## V2

## —

## Yes

## F-19

Entity incorporation timing check
## Diagnosis

## V2

## —

## Yes

## F-20

Prior conduct flags (dispute NLP, DTL
spike, court)
## Diagnosis

## MVP

## Yes

## Yes

## F-21

News feed per company (tax-specific
NLP filter)
## Diagnosis

## Nice-to-have

## Yes

## Yes

## F-22

Leaked database integration (OCCRP
## + ICIJ)
## Diagnosis

## V2

## —

## Yes

## PILL
## AR 3
## —
## DOC
## UME
## NTAT
## ION

## F-23

Investigator annotation layer (private
input on top of public score)
## Documentation

## MVP

## Yes

## Yes

## F-24

AI-generated suspicion summary
## (template-based)
## Documentation

## MVP

## Yes

## Yes

## F-25

Recommended next actions
(rule-based, cites PMK-213)
## Documentation

## MVP

## Yes

## —

## F-26

PDF report generator (public score +
investigator annotations)
## Documentation

## MVP

## Yes

## Yes



## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 8 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026




## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 9 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


## 5

## Key Feature Specifications
Detailed spec for the most architecturally significant features


5.1 Risk Score Engine (F-01, F-03, F-11)

Risk Score (0-100) = weighted sum of signal scores


= (ETR_score x 0.25)

+ (margin_score x 0.20)

+ (RP_haven_score x 0.20)

+ (debt_score x 0.15)

+ (ownership_score x 0.10)

+ (conduct_score x 0.10)


Each signal score = min(100, Z_score x 20)

## Z=1.0 -> 20pts | Z=2.0 -> 40pts | Z=3.0 -> 60pts | Z=5.0 -> 100pts


## PERSISTENCE MULTIPLIER:

if anomaly persists 3+ consecutive years -> score x 1.3 (capped at 100)


## RISK TIERS:

0-30   -> Low (green)    no action

31-60  -> Medium (amber)  watchlist

61-80  -> High (red)      recommend screening

81-100 -> Critical        escalate to formal audit


5.2 Bookmark Collections (F-06)

Bookmark Collections are named folders Budi creates to organize watchlist companies into active
investigation batches — 'Q1 2026 Priority Cases,' 'Coal Sector Review,' 'Director X Network.' A company must
be on the watchlist before it can be added to a collection. Collections are a layer on top of — not a
replacement for — the watchlist.

## DATA MODEL:


## Collection {

id: uuid

user_id: uuid              // private per investigator

name: string               // e.g. 'Q1 2026 Priority Cases'

description: string?       // optional context note

color: string              // hex color label for sidebar

status: 'active' | 'archived'

created_at: timestamp

updated_at: timestamp

## }



## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 10 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


CollectionCompany {

collection_id: uuid

company_id: uuid           // must exist in user watchlist

priority_rank: integer     // manual ordering within collection

added_at: timestamp

note: string?              // collection-specific note (separate from watchlist note)

## }


## CONSTRAINTS:

company_id must exist in Watchlist for this user_id before insertion

max 20 active collections per user

max 50 companies per collection

one company can appear in unlimited collections simultaneously


## COLLECTION FEATURES
- Create, rename, recolor, delete, or archive collections at any time
- Archived collections preserve case history without cluttering the active workspace
- Each collection has its own mini risk heatmap — scoped to its companies only
- Collection summary card: company count, average risk score, highest risk company, total flags
- Batch PDF report — export one report covering ALL companies in a collection for supervisor
submission
- Drag-and-drop priority ordering within collection
- Add from company card, company detail page, or bulk-select from watchlist view

5.3 Investigator Annotation Layer (F-23)

Key design principle: the public risk score stays objective and reproducible. Investigator annotations are a
private layer on top — they enrich the report but never change the algorithmic score.


This feature exists because public filings are updated quarterly — an investigator who found something in the
DJP internal system last Tuesday needs a place to capture it now, connected to the company record. It also
addresses the 'institutional knowledge walks out the door' problem — annotations persist in the system even
if Budi transfers.

WHAT INVESTIGATORS CAN ADD (private, per-company):

manual_flag: string           // e.g. 'DJP internal shows 3 prior audits'

private_note: text            // free-text observation

source: string                // e.g. 'DJP SIDJP system, accessed 2026-03-15'

severity: 'low'|'medium'|'high'

date_observed: date


## WHAT THEY CANNOT DO:

-> cannot modify the public risk score

-> cannot modify any algorithmically computed signal

-> cannot be seen by other users


## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 11 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026



## HOW IT APPEARS IN REPORT (F-26):

Section A: 'SATRIA Public Data Analysis' (algorithmic, reproducible)

Section B: 'Investigator Additional Findings' (manual, clearly labeled as such)

Both sections clearly separated with different visual treatment


5.4 PDF Report Generator (F-26)

## REPORT STRUCTURE
- Cover page: company name, NPWP, sector, report date, investigator name
- Executive summary: AI-generated suspicion summary (F-24)
- Section A — Public Data Analysis: risk score gauge + component table + ETR chart + peer
comparison + RP breakdown + ownership graph + prior conduct flags
- Section B — Investigator Findings: all manual annotations clearly labeled as investigator-added
- Recommended next actions (F-25) citing specific legal frameworks
- Source citations: every figure linked to filing + page number
- Batch mode: one PDF for all companies in a bookmark collection

## CITATION FORMAT:

[Company] Annual Report [Year], p.[page], [section name]

Example: 'PT CoalCo AR 2023, p.187, Note 32 — Related Party Transactions'


## EVERY FLAGGED FIGURE MUST INCLUDE:

- Value used in calculation

- Source document + page number

- Formula applied

- Sector comparison figure

- Resulting flag level (red / amber / green)


WATERMARK: 'Preliminary — For Investigative Use Only. Not a Legal Determination.'

TECH STACK: WeasyPrint (Python) or Puppeteer (Node.js) for server-side PDF generation




## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 12 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


## 6

## Detection Signals & Anomaly Detection
How SATRIA identifies suspicious behavior from public data


6.1 Signal Overview by Avoidance Method

## Method

## Key Signal

## Formula / Source

## Threshold

## Score

## Transfer Pricing
ETR vs statutory rate
ETR = Tax_paid /
PreTax_profit x 100.
Gap = 22% - ETR
Gap > 10% for
2+ yrs

Up to 100pts

## Transfer Pricing
Net margin vs sector peers
## Z = (co_margin -
sector_mean) /
sector_std
## Z < -2.0

Up to 100pts

## Transfer Pricing
RP payment to tax havens
haven_RP / total_RP x
## 100. Havens:
## SGP,VGB,CYM,NLD,IRL...
## Ratio > 50%

Up to 100pts

## Debt Shifting
Implied RP loan interest rate
implied_rate =
RP_interest / RP_loan
x 100 vs BI rate
Rate > 2x BI rate

Up to 60pts

## Debt Shifting
Debt-to-equity ratio
DE = Total_liabilities
## / Total_equity. Safe
harbor = 4:1
## DE > 4

Up to 90pts

## Shell Layering
Tax haven node count
Count unique entities
in ownership chain in
tax haven
jurisdictions
## Any > 0

20pts each, max
## 100

## Shell Layering
Ownership chain depth
Shortest path from
operating co to each
node
## Depth > 2

25pts per layer

## Shell Layering
Mystery entities
RP_counterparties
minus
disclosed_subsidiaries
Any unmatched

30pts each

## Prior Conduct
Tax dispute in filing
NLP: 'sengketa
pajak','keberatan
pajak','tax
dispute'...
Any match

Up to 30pts

## Prior Conduct
Tax court verdict
## Query
putusan.mahkamahagung.
go.id
Verdict found

## 25-35pts




## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 13 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


## 7

## Data Sources & Architecture
Public data sources, access methods, and system architecture


## 7.1 Public Data Sources

## Source

What SATRIA Uses

## Coverage

## Access Method

IDX (idx.co.id)

Annual reports, financial
statements, subsidiary tables,
RP footnotes
All ~900 IDX-listed
companies
PDF download + HTML scraping.
Refreshed quarterly (Mar–Jun
filing season).

OpenCorporates

Company registry data,
directors, shareholders,
incorporation dates
140+ jurisdictions incl.
## Singapore
API — freemium (~10k calls/mo
free). Paid tier for V2.

ACRA BizFile
(Singapore)

Director names, shareholders,
registered address for SG
entities
## All Singapore-registered
companies
Manual lookup + SGD
5.50/company. Automated via
headless browser for V2.

ICIJ Offshore Leaks

## Panama Papers, Pandora
Papers, FinCEN Files entity
matching
Leaked datasets
## 2016–2021
Free API at offshoreleaks.icij.org

OCCRP Aleph

Cross-reference company +
director names against leaked
datasets
Global leaked + public data
Free API at aleph.occrp.org

## Tax Court Indonesia

Published tax court verdicts by
company name or NPWP
All published verdicts
Web scraping of
putusan.mahkamahagung.go.id

News APIs

Tax-related press coverage —
investigations, disputes, raids
## Kontan, Bisnis, Tempo,
## Kompas
NewsAPI.org or targeted scraping
with NLP relevance filter


## 7.2 System Architecture
- Data Layer — ingestion pipeline scrapes IDX filings quarterly, calls OpenCorporates + ICIJ APIs,
indexes news. Stores structured data in PostgreSQL.
- Processing Layer — risk scoring engine calculates Z-scores, applies weighted formulas, runs NLP
keyword extraction on PDF text, assembles ownership graphs using a graph data structure.
- Presentation Layer — React frontend with D3.js or Cytoscape.js for ownership graph, Chart.js for
financial charts, server-side PDF generation via WeasyPrint or Puppeteer.
- User Layer — per-user data (watchlist, collections, annotations) stored in isolated user tables. Never
mixed with public risk data.

## 8

User Journey — How Budi Uses SATRIA
Step-by-step workflow mapping across all three pillars


## Investigation
## Step

SATRIA Feature Used

## What Budi Does

## Time Before

## Time With
## SATRIA

Case selection

F-01 Risk dashboard +
## F-02 Filters

Opens SATRIA. Reviews top
20 high-risk companies.
2 weeks/year on
selection

< 1 hour


## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 14 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


Applies 'transfer pricing' filter.
Adds suspects to watchlist
## (F-05).
## Preliminary
screening

F-08 ETR chart + F-09
Financial table + F-10
## Peer Z-score

Clicks company. Reviews
ETR gap, margin vs peers,
multi-year trend. Reads
NLP-extracted RP
disclosures.
3–6 hrs per company

30 min per
company

## Ownership
mapping

F-16 Ownership graph +
F-17 Haven counter +
F-14 Mystery entities

Views auto-built ownership
graph. Red nodes = tax
havens. Checks mystery
entities list for unmatched
payment recipients.
2–3 days per company

2–3 hours

## Case
organization

## F-06 Bookmark
collections

Groups this company into 'Q1
## 2026 Priority Cases'
collection with 7 other
suspects. Adds
collection-specific note.
Manual Excel tabs

2 minutes

## Internal
enrichment

F-23 Annotation layer

Adds private note: 'DJP
SIDJP shows 3 prior audits
2019–2022. Follow up with
transfer pricing unit lead.'
Not possible in any tool

3 minutes

## Report
generation

F-26 PDF report + F-25
Next actions

Generates full investigation
memo. Public score section
auto-populated. Adds
annotation section. Reviews
recommended actions:
'Request TP docs under
## PMK-213.'
4–8 hrs manual writing

15 min review +
export

## Supervisor
submission

F-06 Batch report from
collection

Exports batch PDF for all 8
companies in 'Q1 2026
Priority Cases' collection.
Submits one document to
director.
8 separate reports

1 click




## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 15 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


## 9

Non-Functional Requirements
Performance, security, and operational constraints


## Category

## Requirement

## Detail

## Performance
Dashboard load < 2 seconds
Risk scores pre-computed and cached. Dashboard
fetches from DB, not real-time calculation.
Data freshness
Annual report data quarterly
IDX companies publish March–June. Pipeline runs
quarterly refresh. News and alerts near real-time.
## Accuracy
Z-score calculations reproducible
Every calculation stored with inputs, formula version, and
timestamp. Fully auditable.
## Accessibility
Standard government-issue laptops
No GPU required. Web-based — no installation.
Chrome/Firefox support minimum.
## Security
Investigator data strictly private
Watchlist, collections, and annotations stored
per-account. Not shared across users. No PII in public
features.
Data separation

Public score immutable by user
input
Investigator annotations stored in separate table. Never
feed back into algorithmic score calculation.
## Scalability

Supports 900 IDX companies at
launch
Architecture supports Malaysia, Vietnam, Philippines
expansion in V2 without redesign.
PDF output
Reports usable as official evidence
Every figure linked to source citation. Timestamped.
Watermarked 'Preliminary'.
## Transparency
Every flag explainable
No black-box scores. Every component score shows the
formula, value, sector comparison, and source.

## 10

## Scope, Roadmap & Risks

MVP constraints, phased expansion, and known risks


10.1 MVP Scope — Hackathon
SATRIA MVP focuses on transfer pricing and debt shifting detection in Indonesia only, using mock data
based on real company structures (PT Adaro Energy, PT Bentoel, Asian Agri Group). All 18 MVP features
are in scope. V2 features appear as roadmap slides in the pitch deck.


10.2 Explicitly Out of Scope for MVP
- Real-time or live data scraping — quarterly refresh only
- Tax authority internal API access — public data only
- Legally binding conclusions — output is 'risk screening' not 'evidence of guilt'
- Full ML model training — rule-based Z-score engine for MVP
- Coverage beyond Indonesia — SEA expansion is V2/V3
- Multi-user collaboration features — single investigator per account for MVP


## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 16 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


## 10.3 Product Roadmap

## Phase

## Timing

## Scope

## Key New Capabilities

MVP v1.0

## Hackathon

Transfer pricing + debt shifting |
Indonesia (IDX) | 18 MVP features
Risk dashboard, anomaly detection,
ownership graph, bookmark
collections, annotation layer, PDF
report
## V2

+ 3 months

+ Royalty stripping NLP | + Shared
director detection | + OCCRP/ICIJ
integration | + V2 features
Full 4-method detection, leaked
database matching, advanced
ownership analysis
## V3

+ 6 months

+ Malaysia, Vietnam | + Real-time filing
alerts | + Shell cycle detection
Multi-country SEA coverage, live
filing monitoring, graph cycle
detection
## V4

+ 12 months

+ NGO/journalist access tier | +
ASEAN-wide coverage | + Government
API integration
6-country ASEAN, multi-user tiers,
optional DJP system integration

## 10.4 Key Risks

## Risk

## Severity

## Likelihood

## Mitigation

IDX PDF format changes
break extraction
## High

## Medium

Format-agnostic parser with fallback
manual input. Monitor IDX format
changelog.
OpenCorporates API rate limits
## Medium

## High

Cache all registry data locally. Batch
off-peak. Upgrade to paid tier if needed.
Legal challenge to risk score
output
## High

## Low

All output labeled 'Preliminary screening
— not legal determination.' Every score
traceable to public source.
BVI/Cayman ownership
permanently opaque
## Medium

## Certain

Flag as 'Unknown UBO.' Partial visibility
still valuable. MLAT recommendation in
next actions.
Coretax expansion covers
investigator tools
## Medium

Low (2+ yrs)

Government systems won't serve
journalists/NGOs. Civil society user tier is
the long-term moat.
MVP scope creep beyond
hackathon capacity
## High

## High

18 MVP features strictly defined. V2
features blocked until post-hackathon.
Daily scope check.



## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 17 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


## 11

## Success Metrics
How we measure SATRIA's impact


## 11.1 Hackathon Evaluation Criteria
- Feasibility — all 18 MVP features buildable within hackathon timeframe using public data sources
- Societal impact — addresses USD 4.86B/year problem with documented, verifiable Indonesian case
examples
- Judge appeal — live demo: risk dashboard → company detail → ownership graph → PDF report
generation
- Differentiation — clearly articulates gap vs Moody's/OpenCorporates/OCCRP, and why Coretax
doesn't overlap

11.2 Post-Launch KPIs

## Metric

Target (Year 1)

## Why It Matters

DJP investigators using
## SATRIA

50+ active users
Validates product-market fit with primary persona
Companies screened per
investigator/year

900 (vs 30 today)

Core efficiency KPI — 30x triage capacity
improvement
Cases opened from SATRIA
flags

40%+ hit rate

Quality of risk score — flags should lead to real
investigations
Time to preliminary screening
per company

< 30 min (vs 3–6 hrs)
Core time-saving proposition validated
Bookmark collections created
per user

3+ active collections

Indicates investigators are using SATRIA as
ongoing case management, not one-off tool
PDF reports generated per
month

20+ reports

Active use of documentation pillar — investigation
memos being generated
Annotation layer entries per
user

10+ per month

Investigators integrating SATRIA into their daily
workflow, not just using it for initial screening

## A

## Appendix — Reference Cases
Real Indonesian cases SATRIA would have flagged using public data


The following documented cases demonstrate that SATRIA's detection signals, applied to publicly available
annual report data, would have flagged these companies well before formal investigations began.

## Company

## Method

## How It Worked

SATRIA Signal

## Revenue Loss

PT Adaro Energy

## Transfer Pricing

Sold coal below market price to
Singapore subsidiary Coaltrade
Services. Profit accumulated in
Singapore at near-zero tax.
Low net margin +
high RP
concentration to SGP
+ Coaltrade not listed
as subsidiary

USD 14M+/yr (est.)


## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 18 of 19




SATRIA — Product Requirements Document v1.0

AI-Powered Tax Risk Screening | March 2026


PT Bentoel / BAT

## Royalty Stripping
## + TP

Paid technology fees, royalties,
and management charges to
BAT-related entities overseas.
Operating profit suppressed to
near zero.
Royalty ratio anomaly
+ management fee
ratio + RP payments
to UK/SGP entities

USD 14M/yr
(ActionAid 2016)

## Asian Agri Group

## Transfer Pricing

Palm oil sold to related entities
in Hong Kong below market
price. Under-reported taxable
income across multiple years.
Net margin collapse
vs sector peers + RP
sales concentration +
prior conduct flags

IDR 1.259 trillion
(court verdict)


All three cases would score Critical (81–100) on SATRIA's risk engine based on publicly available annual
report data alone — without access to any DJP internal systems. This is the core proof of concept.


SATRIA PRD v1.0 | Universitas Gadjah Mada | March 2026 | Confidential — For Hackathon Submission Only


## Universitas Gadjah Mada | Confidential — Hackathon Submission

Page 19 of 19

