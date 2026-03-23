export type RiskTier = 'low' | 'medium' | 'high' | 'critical';
export type AvoidanceMethod = 'transfer_pricing' | 'debt_shifting' | 'royalty_stripping' | 'shell_layering';

export interface SignalScore {
  etr: number;
  margin: number;
  rpHaven: number;
  debt: number;
  ownership: number;
  conduct: number;
}

export interface FinancialYear {
  year: number;
  revenue: number; // in IDR Trillion
  ebitda: number;
  netProfit: number;
  taxPaid: number;
  preTaxProfit: number;
  etr: number; // effective tax rate %
  netMargin: number; // %
  totalLiabilities: number;
  totalEquity: number;
  deRatio: number;
  rpPayments: number; // related party payments in IDR Trillion
}

export interface OwnershipNode {
  id: string;
  name: string;
  jurisdiction: string;
  isTaxHaven: boolean;
  type: 'operating' | 'holding' | 'subsidiary' | 'unknown';
  x: number;
  y: number;
}

export interface OwnershipEdge {
  source: string;
  target: string;
  sharePercent: number;
}

export interface PriorConduct {
  type: 'tax_dispute' | 'court_verdict' | 'dtl_spike' | 'audit_history';
  description: string;
  year: number;
  severity: 'low' | 'medium' | 'high';
  source: string;
}

export interface MysteryEntity {
  name: string;
  jurisdiction: string;
  rpAmount: number; // IDR Trillion
  reason: string;
}

export interface RPJurisdiction {
  name: string;
  amount: number; // IDR Trillion
  isTaxHaven: boolean;
  flag: string;
}

export interface InvestigatorAnnotation {
  id: string;
  flag: string;
  note: string;
  source: string;
  severity: 'low' | 'medium' | 'high';
  dateObserved: string;
}

export interface Company {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  npwp: string;
  riskScore: number;
  riskTier: RiskTier;
  signals: SignalScore;
  avoidanceMethods: AvoidanceMethod[];
  financials: FinancialYear[];
  sectorPeerMeanMargin: number;
  sectorPeerStdMargin: number;
  zScore: number;
  ownershipNodes: OwnershipNode[];
  ownershipEdges: OwnershipEdge[];
  taxHavenCount: number;
  priorConduct: PriorConduct[];
  mysteryEntities: MysteryEntity[];
  rpJurisdictions: RPJurisdiction[];
  impliedRPRate: number; // %
  biRate: number; // %
  isWatchlisted: boolean;
  watchlistNote: string;
  annotations: InvestigatorAnnotation[];
  aiSummary: string;
  lastUpdated: string;
  alerts: string[];
}

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    ticker: 'ADRO',
    name: 'PT Adaro Energy Indonesia',
    sector: 'Coal Mining',
    npwp: '01.234.567.8-091.000',
    riskScore: 87,
    riskTier: 'critical',
    signals: { etr: 82, margin: 75, rpHaven: 95, debt: 55, ownership: 70, conduct: 60 },
    avoidanceMethods: ['transfer_pricing', 'shell_layering'],
    financials: [
      { year: 2019, revenue: 38.4, ebitda: 12.1, netProfit: 4.2, taxPaid: 1.1, preTaxProfit: 5.8, etr: 18.9, netMargin: 10.9, totalLiabilities: 45.2, totalEquity: 32.1, deRatio: 1.4, rpPayments: 14.2 },
      { year: 2020, revenue: 29.1, ebitda: 8.4, netProfit: 2.1, taxPaid: 0.6, preTaxProfit: 3.1, etr: 19.3, netMargin: 7.2, totalLiabilities: 42.1, totalEquity: 29.8, deRatio: 1.4, rpPayments: 12.8 },
      { year: 2021, revenue: 41.2, ebitda: 14.8, netProfit: 5.9, taxPaid: 0.8, preTaxProfit: 8.1, etr: 9.8, netMargin: 14.3, totalLiabilities: 44.8, totalEquity: 34.2, deRatio: 1.3, rpPayments: 18.4 },
      { year: 2022, revenue: 87.3, ebitda: 42.1, netProfit: 24.8, taxPaid: 2.1, preTaxProfit: 31.2, etr: 6.7, netMargin: 28.4, totalLiabilities: 52.1, totalEquity: 51.3, deRatio: 1.0, rpPayments: 38.7 },
      { year: 2023, revenue: 62.4, ebitda: 24.3, netProfit: 11.2, taxPaid: 1.3, preTaxProfit: 14.8, etr: 8.7, netMargin: 17.9, totalLiabilities: 48.3, totalEquity: 58.2, deRatio: 0.8, rpPayments: 28.3 },
    ],
    sectorPeerMeanMargin: 14.2,
    sectorPeerStdMargin: 6.8,
    zScore: -0.5,
    ownershipNodes: [
      { id: 'adro-op', name: 'PT Adaro Energy', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'operating', x: 300, y: 200 },
      { id: 'adro-sg', name: 'Adaro Singapore Pte Ltd', jurisdiction: 'Singapore', isTaxHaven: false, type: 'holding', x: 180, y: 100 },
      { id: 'coaltrade', name: 'Coaltrade Services Int\'l', jurisdiction: 'Singapore', isTaxHaven: false, type: 'subsidiary', x: 420, y: 100 },
      { id: 'adaro-bvi', name: 'Adaro Holdings Ltd', jurisdiction: 'British Virgin Islands', isTaxHaven: true, type: 'holding', x: 100, y: 20 },
      { id: 'garibaldi', name: 'Garibaldi Thohir (UBO)', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'unknown', x: 300, y: 310 },
    ],
    ownershipEdges: [
      { source: 'adaro-bvi', target: 'adro-sg', sharePercent: 100 },
      { source: 'adro-sg', target: 'adro-op', sharePercent: 66.7 },
      { source: 'adro-op', target: 'coaltrade', sharePercent: 100 },
      { source: 'garibaldi', target: 'adro-op', sharePercent: 5.4 },
    ],
    taxHavenCount: 2,
    priorConduct: [
      { type: 'tax_dispute', description: 'Transfer pricing dispute re: coal sales to Coaltrade Services (2018–2020)', year: 2020, severity: 'high', source: 'PT Adaro Energy AR 2020, p.214, Note 41' },
      { type: 'court_verdict', description: 'Tax court ruling on RP loan interest adjustment — partial win for DJP', year: 2021, severity: 'high', source: 'Putusan MA No. 1247/B/PK/Pjk/2021' },
    ],
    mysteryEntities: [
      { name: 'Adaro International Resources Ltd', jurisdiction: 'Mauritius', rpAmount: 4.2, reason: 'RP counterparty not listed as disclosed subsidiary' },
    ],
    rpJurisdictions: [
      { name: 'Singapore', amount: 18.4, isTaxHaven: false, flag: '🇸🇬' },
      { name: 'British Virgin Islands', amount: 8.1, isTaxHaven: true, flag: '🇻🇬' },
      { name: 'Mauritius', amount: 4.2, isTaxHaven: true, flag: '🇲🇺' },
      { name: 'Indonesia', amount: 3.1, isTaxHaven: false, flag: '🇮🇩' },
    ],
    impliedRPRate: 14.2,
    biRate: 6.25,
    isWatchlisted: true,
    watchlistNote: 'Priority case — Coaltrade TP arrangement under active review. Check Q1 2024 filing.',
    annotations: [
      { id: 'ann-1', flag: 'DJP SIDJP shows 3 prior transfer pricing audits 2016–2021', note: 'Internal records confirm significant TP adjustments in coal segment. Recommend formal audit referral.', source: 'DJP SIDJP system, accessed 2026-03-10', severity: 'high', dateObserved: '2026-03-10' }
    ],
    aiSummary: 'PT Adaro Energy Indonesia exhibits critical-level tax risk primarily driven by systematic profit routing through its Singapore subsidiary Coaltrade Services International. The effective tax rate has declined from 18.9% in 2019 to 8.7% in 2023 — a persistent 13.3 percentage point gap below the 22% statutory rate across 4 consecutive years. Related-party payments represent 45% of revenue, with 67% routed to tax haven jurisdictions (BVI and Mauritius). The Coaltrade arrangement — selling coal at below-market prices to a Singapore affiliate for resale — mirrors the pattern documented in the Adaro Energy OCCRP investigation (2019). A BVI holding layer above the Singapore entity further obscures the ultimate beneficial ownership chain.',
    lastUpdated: '2026-03-20',
    alerts: ['ETR dropped 2.1pp vs prior year', 'New BVI entity detected in 2023 filing'],
  },
  {
    id: 'comp-2',
    ticker: 'RMBA',
    name: 'PT Bentoel International Investama',
    sector: 'Tobacco',
    npwp: '01.987.654.3-021.000',
    riskScore: 91,
    riskTier: 'critical',
    signals: { etr: 90, margin: 88, rpHaven: 80, debt: 45, ownership: 65, conduct: 85 },
    avoidanceMethods: ['royalty_stripping', 'transfer_pricing'],
    financials: [
      { year: 2019, revenue: 22.1, ebitda: 1.8, netProfit: -0.4, taxPaid: 0.2, preTaxProfit: -0.1, etr: 4.2, netMargin: -1.8, totalLiabilities: 18.4, totalEquity: 4.2, deRatio: 4.4, rpPayments: 9.8 },
      { year: 2020, revenue: 19.8, ebitda: 1.2, netProfit: -1.1, taxPaid: 0.1, preTaxProfit: -1.4, etr: 3.8, netMargin: -5.6, totalLiabilities: 19.2, totalEquity: 3.1, deRatio: 6.2, rpPayments: 10.1 },
      { year: 2021, revenue: 21.4, ebitda: 1.4, netProfit: -0.8, taxPaid: 0.1, preTaxProfit: -1.0, etr: 3.1, netMargin: -3.7, totalLiabilities: 20.1, totalEquity: 2.3, deRatio: 8.7, rpPayments: 11.2 },
      { year: 2022, revenue: 23.8, ebitda: 2.1, netProfit: 0.2, taxPaid: 0.1, preTaxProfit: 0.4, etr: 25.0, netMargin: 0.8, totalLiabilities: 21.4, totalEquity: 2.5, deRatio: 8.6, rpPayments: 12.4 },
      { year: 2023, revenue: 25.2, ebitda: 1.9, netProfit: -0.3, taxPaid: 0.1, preTaxProfit: -0.2, etr: 2.8, netMargin: -1.2, totalLiabilities: 22.8, totalEquity: 2.2, deRatio: 10.4, rpPayments: 13.7 },
    ],
    sectorPeerMeanMargin: 8.4,
    sectorPeerStdMargin: 3.2,
    zScore: -3.2,
    ownershipNodes: [
      { id: 'rmba-op', name: 'PT Bentoel International', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'operating', x: 300, y: 200 },
      { id: 'bat-uk', name: 'British American Tobacco plc', jurisdiction: 'United Kingdom', isTaxHaven: false, type: 'holding', x: 180, y: 90 },
      { id: 'bat-nl', name: 'BAT Netherlands B.V.', jurisdiction: 'Netherlands', isTaxHaven: true, type: 'holding', x: 300, y: 90 },
      { id: 'bat-ip', name: 'BAT IP Holdings Ltd', jurisdiction: 'Jersey', isTaxHaven: true, type: 'subsidiary', x: 420, y: 90 },
    ],
    ownershipEdges: [
      { source: 'bat-uk', target: 'bat-nl', sharePercent: 100 },
      { source: 'bat-nl', target: 'rmba-op', sharePercent: 92.5 },
      { source: 'bat-ip', target: 'rmba-op', sharePercent: 0 },
    ],
    taxHavenCount: 2,
    priorConduct: [
      { type: 'tax_dispute', description: 'Royalty payment dispute — USD 14M/year drained to BAT IP Holdings (Jersey)', year: 2022, severity: 'high', source: 'PT Bentoel AR 2022, p.198, Note 38' },
      { type: 'dtl_spike', description: 'Deferred tax liability spiked 340% in 2021 — unexplained in footnotes', year: 2021, severity: 'medium', source: 'PT Bentoel AR 2021, p.156' },
    ],
    mysteryEntities: [
      { name: 'BAT Global IP Holdings B.V.', jurisdiction: 'Netherlands', rpAmount: 3.1, reason: 'Royalty recipient not disclosed as direct subsidiary in 2023 filing' },
    ],
    rpJurisdictions: [
      { name: 'Netherlands', amount: 7.2, isTaxHaven: true, flag: '🇳🇱' },
      { name: 'Jersey', amount: 4.1, isTaxHaven: true, flag: '🇯🇪' },
      { name: 'United Kingdom', amount: 2.1, isTaxHaven: false, flag: '🇬🇧' },
      { name: 'Indonesia', amount: 0.3, isTaxHaven: false, flag: '🇮🇩' },
    ],
    impliedRPRate: 18.9,
    biRate: 6.25,
    isWatchlisted: true,
    watchlistNote: 'Royalty stripping via Jersey IP holding. DE ratio exceeded safe harbor every year 2020–2023.',
    annotations: [],
    aiSummary: 'PT Bentoel International Investama presents the highest risk score in this screening cycle. The company has reported negative net margins in 4 of the past 5 years despite stable revenue, while systematically routing royalty payments (estimated USD 14M/year) to BAT IP Holdings in Jersey. The debt-to-equity ratio has exceeded the 4:1 safe harbor threshold continuously since 2020, reaching 10.4 in 2023 — indicating potential debt-shifting concurrent with royalty stripping. The effective tax rate of 2.8% in 2023 represents a 19.2 percentage point gap from the statutory rate. The Netherlands holding layer adds treaty-shopping risk.',
    lastUpdated: '2026-03-18',
    alerts: ['DE ratio exceeded safe harbor (10.4x vs 4:1)', 'ETR < 5% for 4th consecutive year'],
  },
  {
    id: 'comp-3',
    ticker: 'BUMI',
    name: 'PT Bumi Resources Tbk',
    sector: 'Coal Mining',
    npwp: '02.345.678.9-012.000',
    riskScore: 78,
    riskTier: 'high',
    signals: { etr: 70, margin: 72, rpHaven: 65, debt: 88, ownership: 55, conduct: 70 },
    avoidanceMethods: ['debt_shifting', 'shell_layering'],
    financials: [
      { year: 2019, revenue: 24.1, ebitda: 5.2, netProfit: -8.4, taxPaid: 0.4, preTaxProfit: -7.2, etr: 8.1, netMargin: -34.8, totalLiabilities: 112.4, totalEquity: 8.2, deRatio: 13.7, rpPayments: 6.2 },
      { year: 2020, revenue: 18.3, ebitda: 2.1, netProfit: -12.1, taxPaid: 0.2, preTaxProfit: -11.4, etr: 5.2, netMargin: -66.1, totalLiabilities: 121.2, totalEquity: -3.8, deRatio: 0, rpPayments: 7.1 },
      { year: 2021, revenue: 22.8, ebitda: 8.4, netProfit: 1.2, taxPaid: 0.5, preTaxProfit: 2.1, etr: 23.8, netMargin: 5.3, totalLiabilities: 118.4, totalEquity: -1.2, deRatio: 0, rpPayments: 8.3 },
      { year: 2022, revenue: 48.2, ebitda: 22.1, netProfit: 8.4, taxPaid: 1.2, preTaxProfit: 11.2, etr: 10.7, netMargin: 17.4, totalLiabilities: 105.2, totalEquity: 7.1, deRatio: 14.8, rpPayments: 12.1 },
      { year: 2023, revenue: 34.1, ebitda: 11.4, netProfit: 2.1, taxPaid: 0.6, preTaxProfit: 3.4, etr: 17.6, netMargin: 6.2, totalLiabilities: 98.4, totalEquity: 9.2, deRatio: 10.7, rpPayments: 9.8 },
    ],
    sectorPeerMeanMargin: 14.2,
    sectorPeerStdMargin: 6.8,
    zScore: -2.8,
    ownershipNodes: [
      { id: 'bumi-op', name: 'PT Bumi Resources', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'operating', x: 300, y: 200 },
      { id: 'bumi-cay', name: 'Bumi Resources Cayman', jurisdiction: 'Cayman Islands', isTaxHaven: true, type: 'holding', x: 200, y: 100 },
      { id: 'bumi-hk', name: 'Bumi Resources HK Ltd', jurisdiction: 'Hong Kong', isTaxHaven: false, type: 'holding', x: 380, y: 100 },
      { id: 'bumi-bvi', name: 'Bumi Int\'l Resources', jurisdiction: 'British Virgin Islands', isTaxHaven: true, type: 'unknown', x: 120, y: 30 },
    ],
    ownershipEdges: [
      { source: 'bumi-bvi', target: 'bumi-cay', sharePercent: 100 },
      { source: 'bumi-cay', target: 'bumi-op', sharePercent: 72.1 },
      { source: 'bumi-hk', target: 'bumi-op', sharePercent: 10.2 },
    ],
    taxHavenCount: 3,
    priorConduct: [
      { type: 'court_verdict', description: 'Tax court ruling on USD 231M debt restructuring tax treatment — DJP won partial adjustment', year: 2022, severity: 'high', source: 'Putusan MA No. 892/B/PK/Pjk/2022' },
      { type: 'tax_dispute', description: 'Ongoing dispute re: deductibility of RP loan interest from Cayman entity', year: 2023, severity: 'high', source: 'PT Bumi Resources AR 2023, p.241, Note 45' },
    ],
    mysteryEntities: [
      { name: 'Vallar Investments Ltd', jurisdiction: 'British Virgin Islands', rpAmount: 2.8, reason: 'Loan counterparty — not in subsidiary register' },
    ],
    rpJurisdictions: [
      { name: 'Cayman Islands', amount: 6.2, isTaxHaven: true, flag: '🇰🇾' },
      { name: 'British Virgin Islands', amount: 2.8, isTaxHaven: true, flag: '🇻🇬' },
      { name: 'Hong Kong', amount: 0.8, isTaxHaven: false, flag: '🇭🇰' },
    ],
    impliedRPRate: 16.8,
    biRate: 6.25,
    isWatchlisted: true,
    watchlistNote: 'Debt-to-equity ratio concern. Cayman structure needs ownership chain resolution.',
    annotations: [],
    aiSummary: 'PT Bumi Resources exhibits high-risk indicators centered on debt-shifting and shell layering. The company carries IDR 98.4 trillion in liabilities against IDR 9.2 trillion equity (DE ratio 10.7x) with a significant portion attributable to related-party loans from Cayman Islands entities at implied rates of 16.8% — 2.7x the Bank Indonesia benchmark rate. Three tax haven nodes have been identified in the ownership chain (BVI, Cayman Islands). Two active legal proceedings involving DJP adjustments are ongoing.',
    lastUpdated: '2026-03-15',
    alerts: ['DE ratio 10.7x — exceeds 4:1 safe harbor', 'New Cayman entity in 2023 ownership disclosure'],
  },
  {
    id: 'comp-4',
    ticker: 'INDY',
    name: 'PT Indika Energy Tbk',
    sector: 'Energy',
    npwp: '03.456.789.0-013.000',
    riskScore: 72,
    riskTier: 'high',
    signals: { etr: 68, margin: 65, rpHaven: 70, debt: 60, ownership: 58, conduct: 45 },
    avoidanceMethods: ['transfer_pricing', 'debt_shifting'],
    financials: [
      { year: 2019, revenue: 31.4, ebitda: 7.2, netProfit: 1.8, taxPaid: 0.9, preTaxProfit: 3.2, etr: 28.1, netMargin: 5.7, totalLiabilities: 52.1, totalEquity: 18.4, deRatio: 2.8, rpPayments: 8.4 },
      { year: 2020, revenue: 24.8, ebitda: 4.1, netProfit: -2.1, taxPaid: 0.4, preTaxProfit: -1.4, etr: 9.8, netMargin: -8.5, totalLiabilities: 54.2, totalEquity: 16.2, deRatio: 3.3, rpPayments: 9.2 },
      { year: 2021, revenue: 29.2, ebitda: 6.8, netProfit: 2.4, taxPaid: 0.7, preTaxProfit: 3.8, etr: 18.4, netMargin: 8.2, totalLiabilities: 51.8, totalEquity: 18.8, deRatio: 2.8, rpPayments: 10.1 },
      { year: 2022, revenue: 58.4, ebitda: 18.2, netProfit: 9.1, taxPaid: 1.4, preTaxProfit: 12.8, etr: 10.9, netMargin: 15.6, totalLiabilities: 48.2, totalEquity: 26.4, deRatio: 1.8, rpPayments: 18.4 },
      { year: 2023, revenue: 42.1, ebitda: 10.4, netProfit: 3.8, taxPaid: 0.9, preTaxProfit: 5.4, etr: 16.7, netMargin: 9.0, totalLiabilities: 46.8, totalEquity: 29.2, deRatio: 1.6, rpPayments: 14.2 },
    ],
    sectorPeerMeanMargin: 11.8,
    sectorPeerStdMargin: 5.4,
    zScore: -1.9,
    ownershipNodes: [
      { id: 'indy-op', name: 'PT Indika Energy', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'operating', x: 300, y: 200 },
      { id: 'indy-sg', name: 'Indika Energy Singapore', jurisdiction: 'Singapore', isTaxHaven: false, type: 'subsidiary', x: 180, y: 100 },
      { id: 'indy-neth', name: 'Indika Capital B.V.', jurisdiction: 'Netherlands', isTaxHaven: true, type: 'holding', x: 420, y: 100 },
    ],
    ownershipEdges: [
      { source: 'indy-neth', target: 'indy-op', sharePercent: 58.4 },
      { source: 'indy-op', target: 'indy-sg', sharePercent: 100 },
    ],
    taxHavenCount: 1,
    priorConduct: [
      { type: 'tax_dispute', description: 'Transfer pricing query re: coal trading margins through Singapore entity', year: 2022, severity: 'medium', source: 'PT Indika Energy AR 2022, p.178, Note 35' },
    ],
    mysteryEntities: [],
    rpJurisdictions: [
      { name: 'Singapore', amount: 9.8, isTaxHaven: false, flag: '🇸🇬' },
      { name: 'Netherlands', amount: 4.4, isTaxHaven: true, flag: '🇳🇱' },
    ],
    impliedRPRate: 11.2,
    biRate: 6.25,
    isWatchlisted: false,
    watchlistNote: '',
    annotations: [],
    aiSummary: 'PT Indika Energy shows elevated risk across multiple financial signals. The ETR has been below 18% in 3 of 5 years, with RP payments through Netherlands and Singapore entities accounting for approximately 34% of annual revenue. The Z-score of -1.9 places net margin significantly below sector peers.',
    lastUpdated: '2026-03-19',
    alerts: ['Revenue divergence from coal sector peers — 18% gap in 2023'],
  },
  {
    id: 'comp-5',
    ticker: 'LPKR',
    name: 'PT Lippo Karawaci Tbk',
    sector: 'Property',
    npwp: '04.567.890.1-014.000',
    riskScore: 65,
    riskTier: 'high',
    signals: { etr: 62, margin: 58, rpHaven: 60, debt: 72, ownership: 48, conduct: 55 },
    avoidanceMethods: ['debt_shifting', 'transfer_pricing'],
    financials: [
      { year: 2019, revenue: 15.2, ebitda: 2.8, netProfit: -4.2, taxPaid: 0.3, preTaxProfit: -3.8, etr: 7.2, netMargin: -27.6, totalLiabilities: 48.2, totalEquity: 24.1, deRatio: 2.0, rpPayments: 5.1 },
      { year: 2020, revenue: 10.4, ebitda: 1.2, netProfit: -6.8, taxPaid: 0.2, preTaxProfit: -6.1, etr: 5.1, netMargin: -65.4, totalLiabilities: 52.4, totalEquity: 17.8, deRatio: 2.9, rpPayments: 4.8 },
      { year: 2021, revenue: 12.1, ebitda: 2.4, netProfit: -2.1, taxPaid: 0.3, preTaxProfit: -1.4, etr: 11.2, netMargin: -17.4, totalLiabilities: 54.8, totalEquity: 15.2, deRatio: 3.6, rpPayments: 5.4 },
      { year: 2022, revenue: 14.8, ebitda: 3.8, netProfit: 0.8, taxPaid: 0.4, preTaxProfit: 1.4, etr: 28.6, netMargin: 5.4, totalLiabilities: 56.2, totalEquity: 16.1, deRatio: 3.5, rpPayments: 6.2 },
      { year: 2023, revenue: 16.2, ebitda: 3.2, netProfit: 0.4, taxPaid: 0.2, preTaxProfit: 0.8, etr: 25.0, netMargin: 2.5, totalLiabilities: 57.4, totalEquity: 16.5, deRatio: 3.5, rpPayments: 6.8 },
    ],
    sectorPeerMeanMargin: 10.2,
    sectorPeerStdMargin: 4.8,
    zScore: -2.4,
    ownershipNodes: [
      { id: 'lpkr-op', name: 'PT Lippo Karawaci', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'operating', x: 300, y: 200 },
      { id: 'lpkr-sg', name: 'Lippo China Resources', jurisdiction: 'Hong Kong', isTaxHaven: false, type: 'holding', x: 200, y: 100 },
      { id: 'lippo-cay', name: 'Lippo Ltd', jurisdiction: 'Cayman Islands', isTaxHaven: true, type: 'holding', x: 380, y: 100 },
    ],
    ownershipEdges: [
      { source: 'lpkr-sg', target: 'lpkr-op', sharePercent: 43.2 },
      { source: 'lippo-cay', target: 'lpkr-op', sharePercent: 12.1 },
    ],
    taxHavenCount: 1,
    priorConduct: [
      { type: 'tax_dispute', description: 'Inter-company loan dispute — interest rates on IDR 8T RP loans exceeded BI reference rate by 3.2x', year: 2021, severity: 'medium', source: 'PT Lippo Karawaci AR 2021, p.162' },
    ],
    mysteryEntities: [],
    rpJurisdictions: [
      { name: 'Hong Kong', amount: 3.8, isTaxHaven: false, flag: '🇭🇰' },
      { name: 'Cayman Islands', amount: 2.4, isTaxHaven: true, flag: '🇰🇾' },
      { name: 'Indonesia', amount: 0.6, isTaxHaven: false, flag: '🇮🇩' },
    ],
    impliedRPRate: 12.4,
    biRate: 6.25,
    isWatchlisted: false,
    watchlistNote: '',
    annotations: [],
    aiSummary: 'PT Lippo Karawaci shows persistent low ETR and negative margins despite revenue recovery post-2021. Debt-to-equity has remained elevated near the 4:1 safe harbor threshold, with RP interest charges contributing to continued losses.',
    lastUpdated: '2026-03-17',
    alerts: ['ETR dropped below statutory rate for 3rd year'],
  },
  {
    id: 'comp-6',
    ticker: 'INDF',
    name: 'PT Indofood Sukses Makmur',
    sector: 'Food & Beverage',
    npwp: '05.678.901.2-015.000',
    riskScore: 48,
    riskTier: 'medium',
    signals: { etr: 45, margin: 42, rpHaven: 35, debt: 50, ownership: 30, conduct: 25 },
    avoidanceMethods: ['transfer_pricing'],
    financials: [
      { year: 2019, revenue: 84.2, ebitda: 16.4, netProfit: 5.9, taxPaid: 2.8, preTaxProfit: 9.8, etr: 28.6, netMargin: 7.0, totalLiabilities: 58.4, totalEquity: 42.1, deRatio: 1.4, rpPayments: 12.1 },
      { year: 2020, revenue: 81.7, ebitda: 15.8, netProfit: 4.9, taxPaid: 2.4, preTaxProfit: 8.1, etr: 29.6, netMargin: 6.0, totalLiabilities: 60.2, totalEquity: 45.8, deRatio: 1.3, rpPayments: 11.8 },
      { year: 2021, revenue: 91.8, ebitda: 18.2, netProfit: 6.8, taxPaid: 3.1, preTaxProfit: 10.8, etr: 28.7, netMargin: 7.4, totalLiabilities: 62.4, totalEquity: 50.2, deRatio: 1.2, rpPayments: 13.4 },
      { year: 2022, revenue: 104.2, ebitda: 19.8, netProfit: 5.4, taxPaid: 2.8, preTaxProfit: 9.2, etr: 30.4, netMargin: 5.2, totalLiabilities: 64.8, totalEquity: 54.1, deRatio: 1.2, rpPayments: 15.2 },
      { year: 2023, revenue: 108.4, ebitda: 21.2, netProfit: 7.2, taxPaid: 3.1, preTaxProfit: 11.8, etr: 26.3, netMargin: 6.6, totalLiabilities: 66.2, totalEquity: 58.4, deRatio: 1.1, rpPayments: 16.1 },
    ],
    sectorPeerMeanMargin: 7.8,
    sectorPeerStdMargin: 2.4,
    zScore: -0.5,
    ownershipNodes: [
      { id: 'indf-op', name: 'PT Indofood', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'operating', x: 300, y: 200 },
      { id: 'first-pac', name: 'First Pacific Company', jurisdiction: 'Hong Kong', isTaxHaven: false, type: 'holding', x: 220, y: 100 },
    ],
    ownershipEdges: [
      { source: 'first-pac', target: 'indf-op', sharePercent: 50.1 },
    ],
    taxHavenCount: 0,
    priorConduct: [],
    mysteryEntities: [],
    rpJurisdictions: [
      { name: 'Indonesia', amount: 12.8, isTaxHaven: false, flag: '🇮🇩' },
      { name: 'Hong Kong', amount: 3.3, isTaxHaven: false, flag: '🇭🇰' },
    ],
    impliedRPRate: 7.8,
    biRate: 6.25,
    isWatchlisted: false,
    watchlistNote: '',
    annotations: [],
    aiSummary: 'PT Indofood Sukses Makmur shows medium-level risk with broadly compliant ETR (26–31% range). The primary area of concern is the increasing trend in related-party payments as a proportion of revenue (14.4% → 14.9%), though current metrics remain within sector norms.',
    lastUpdated: '2026-03-21',
    alerts: [],
  },
  {
    id: 'comp-7',
    ticker: 'BRPT',
    name: 'PT Barito Pacific Tbk',
    sector: 'Petrochemicals',
    npwp: '06.789.012.3-016.000',
    riskScore: 68,
    riskTier: 'high',
    signals: { etr: 65, margin: 60, rpHaven: 75, debt: 68, ownership: 62, conduct: 40 },
    avoidanceMethods: ['transfer_pricing', 'shell_layering'],
    financials: [
      { year: 2019, revenue: 28.4, ebitda: 6.8, netProfit: 1.4, taxPaid: 0.8, preTaxProfit: 2.8, etr: 28.6, netMargin: 4.9, totalLiabilities: 82.4, totalEquity: 28.2, deRatio: 2.9, rpPayments: 10.2 },
      { year: 2020, revenue: 22.1, ebitda: 3.2, netProfit: -3.8, taxPaid: 0.3, preTaxProfit: -3.1, etr: 6.8, netMargin: -17.2, totalLiabilities: 88.4, totalEquity: 24.1, deRatio: 3.7, rpPayments: 9.8 },
      { year: 2021, revenue: 31.8, ebitda: 8.4, netProfit: 2.8, taxPaid: 0.9, preTaxProfit: 4.8, etr: 18.8, netMargin: 8.8, totalLiabilities: 84.2, totalEquity: 27.8, deRatio: 3.0, rpPayments: 12.1 },
      { year: 2022, revenue: 42.4, ebitda: 12.1, netProfit: 5.2, taxPaid: 1.1, preTaxProfit: 7.4, etr: 14.9, netMargin: 12.3, totalLiabilities: 80.4, totalEquity: 32.1, deRatio: 2.5, rpPayments: 16.4 },
      { year: 2023, revenue: 38.2, ebitda: 9.8, netProfit: 2.4, taxPaid: 0.8, preTaxProfit: 4.2, etr: 19.0, netMargin: 6.3, totalLiabilities: 78.8, totalEquity: 34.4, deRatio: 2.3, rpPayments: 14.8 },
    ],
    sectorPeerMeanMargin: 9.8,
    sectorPeerStdMargin: 4.2,
    zScore: -1.6,
    ownershipNodes: [
      { id: 'brpt-op', name: 'PT Barito Pacific', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'operating', x: 300, y: 200 },
      { id: 'brpt-sg', name: 'Barito Pacific Singapore', jurisdiction: 'Singapore', isTaxHaven: false, type: 'subsidiary', x: 180, y: 100 },
      { id: 'brpt-bvi', name: 'Pacific Resources BVI', jurisdiction: 'British Virgin Islands', isTaxHaven: true, type: 'holding', x: 420, y: 100 },
    ],
    ownershipEdges: [
      { source: 'brpt-bvi', target: 'brpt-op', sharePercent: 67.2 },
      { source: 'brpt-op', target: 'brpt-sg', sharePercent: 100 },
    ],
    taxHavenCount: 1,
    priorConduct: [
      { type: 'tax_dispute', description: 'Transfer pricing adjustment re: petrochemical feedstock purchases from Singapore trading entity', year: 2022, severity: 'medium', source: 'PT Barito Pacific AR 2022, p.189, Note 36' },
    ],
    mysteryEntities: [
      { name: 'Pacific Trading Resources Pte', jurisdiction: 'Singapore', rpAmount: 4.8, reason: 'Trading counterparty — registration data not available in ACRA' },
    ],
    rpJurisdictions: [
      { name: 'Singapore', amount: 10.4, isTaxHaven: false, flag: '🇸🇬' },
      { name: 'British Virgin Islands', amount: 4.4, isTaxHaven: true, flag: '🇻🇬' },
    ],
    impliedRPRate: 10.8,
    biRate: 6.25,
    isWatchlisted: false,
    watchlistNote: '',
    annotations: [],
    aiSummary: 'PT Barito Pacific shows elevated risk from RP-heavy trading structures. ETR fell to 14.9% in 2022 and remained below 20% in 2023. A BVI holding structure obscures the ultimate beneficial owner.',
    lastUpdated: '2026-03-16',
    alerts: ['Mystery entity detected in Singapore trading chain'],
  },
  {
    id: 'comp-8',
    ticker: 'MEDC',
    name: 'PT Medco Energi Internasional',
    sector: 'Oil & Gas',
    npwp: '07.890.123.4-017.000',
    riskScore: 52,
    riskTier: 'medium',
    signals: { etr: 48, margin: 50, rpHaven: 45, debt: 58, ownership: 35, conduct: 42 },
    avoidanceMethods: ['debt_shifting'],
    financials: [
      { year: 2019, revenue: 18.4, ebitda: 6.8, netProfit: 1.2, taxPaid: 1.4, preTaxProfit: 4.2, etr: 33.3, netMargin: 6.5, totalLiabilities: 42.8, totalEquity: 18.4, deRatio: 2.3, rpPayments: 3.8 },
      { year: 2020, revenue: 12.1, ebitda: 3.2, netProfit: -2.4, taxPaid: 0.6, preTaxProfit: -1.8, etr: 18.1, netMargin: -19.8, totalLiabilities: 44.2, totalEquity: 16.1, deRatio: 2.7, rpPayments: 3.2 },
      { year: 2021, revenue: 16.8, ebitda: 6.1, netProfit: 1.8, taxPaid: 1.2, preTaxProfit: 3.8, etr: 31.6, netMargin: 10.7, totalLiabilities: 42.4, totalEquity: 18.2, deRatio: 2.3, rpPayments: 3.8 },
      { year: 2022, revenue: 26.4, ebitda: 10.8, netProfit: 4.2, taxPaid: 2.1, preTaxProfit: 6.8, etr: 30.9, netMargin: 15.9, totalLiabilities: 40.8, totalEquity: 22.1, deRatio: 1.8, rpPayments: 4.8 },
      { year: 2023, revenue: 22.8, ebitda: 8.4, netProfit: 2.8, taxPaid: 1.4, preTaxProfit: 4.8, etr: 29.2, netMargin: 12.3, totalLiabilities: 39.2, totalEquity: 24.8, deRatio: 1.6, rpPayments: 4.2 },
    ],
    sectorPeerMeanMargin: 11.4,
    sectorPeerStdMargin: 5.2,
    zScore: 0.2,
    ownershipNodes: [
      { id: 'medc-op', name: 'PT Medco Energi', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'operating', x: 300, y: 200 },
      { id: 'medc-sg', name: 'Medco International Ventures', jurisdiction: 'Singapore', isTaxHaven: false, type: 'subsidiary', x: 220, y: 100 },
    ],
    ownershipEdges: [
      { source: 'medc-sg', target: 'medc-op', sharePercent: 51.6 },
    ],
    taxHavenCount: 0,
    priorConduct: [],
    mysteryEntities: [],
    rpJurisdictions: [
      { name: 'Indonesia', amount: 2.8, isTaxHaven: false, flag: '🇮🇩' },
      { name: 'Singapore', amount: 1.4, isTaxHaven: false, flag: '🇸🇬' },
    ],
    impliedRPRate: 8.4,
    biRate: 6.25,
    isWatchlisted: false,
    watchlistNote: '',
    annotations: [],
    aiSummary: 'PT Medco Energi shows medium-level risk with generally compliant financial indicators. ETR has recovered to near-statutory levels in 2022–2023. Debt-to-equity has been on a declining trend and is currently within safe harbor. No tax haven affiliations detected.',
    lastUpdated: '2026-03-20',
    alerts: [],
  },
  {
    id: 'comp-9',
    ticker: 'GGRM',
    name: 'PT Gudang Garam Tbk',
    sector: 'Tobacco',
    npwp: '08.901.234.5-018.000',
    riskScore: 38,
    riskTier: 'medium',
    signals: { etr: 35, margin: 32, rpHaven: 28, debt: 30, ownership: 25, conduct: 20 },
    avoidanceMethods: ['transfer_pricing'],
    financials: [
      { year: 2019, revenue: 119.4, ebitda: 14.2, netProfit: 7.7, taxPaid: 3.4, preTaxProfit: 11.8, etr: 28.8, netMargin: 6.4, totalLiabilities: 29.4, totalEquity: 62.1, deRatio: 0.5, rpPayments: 8.4 },
      { year: 2020, revenue: 114.8, ebitda: 11.8, netProfit: 7.6, taxPaid: 3.2, preTaxProfit: 11.2, etr: 28.6, netMargin: 6.6, totalLiabilities: 27.8, totalEquity: 65.4, deRatio: 0.4, rpPayments: 8.1 },
      { year: 2021, revenue: 110.4, ebitda: 10.2, netProfit: 3.4, taxPaid: 2.1, preTaxProfit: 6.8, etr: 30.9, netMargin: 3.1, totalLiabilities: 26.4, totalEquity: 63.2, deRatio: 0.4, rpPayments: 7.8 },
      { year: 2022, revenue: 115.4, ebitda: 9.8, netProfit: 2.8, taxPaid: 1.8, preTaxProfit: 5.4, etr: 33.3, netMargin: 2.4, totalLiabilities: 25.8, totalEquity: 61.4, deRatio: 0.4, rpPayments: 7.4 },
      { year: 2023, revenue: 108.2, ebitda: 8.4, netProfit: 1.4, taxPaid: 1.1, preTaxProfit: 3.4, etr: 32.4, netMargin: 1.3, totalLiabilities: 24.2, totalEquity: 58.8, deRatio: 0.4, rpPayments: 7.2 },
    ],
    sectorPeerMeanMargin: 8.4,
    sectorPeerStdMargin: 3.2,
    zScore: -0.8,
    ownershipNodes: [
      { id: 'ggrm-op', name: 'PT Gudang Garam', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'operating', x: 300, y: 200 },
      { id: 'ggrm-fam', name: 'Suryaduta Investama (Family)', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'holding', x: 220, y: 100 },
    ],
    ownershipEdges: [
      { source: 'ggrm-fam', target: 'ggrm-op', sharePercent: 69.3 },
    ],
    taxHavenCount: 0,
    priorConduct: [],
    mysteryEntities: [],
    rpJurisdictions: [
      { name: 'Indonesia', amount: 7.2, isTaxHaven: false, flag: '🇮🇩' },
    ],
    impliedRPRate: 7.1,
    biRate: 6.25,
    isWatchlisted: false,
    watchlistNote: '',
    annotations: [],
    aiSummary: 'PT Gudang Garam shows medium-level risk, primarily due to declining net margins in the tobacco sector (6.4% → 1.3% over 5 years). ETR remains compliant at 28–33%. No offshore ownership structure or tax haven affiliations detected. The declining margin may indicate competitive pressures rather than tax avoidance.',
    lastUpdated: '2026-03-19',
    alerts: [],
  },
  {
    id: 'comp-10',
    ticker: 'ASII',
    name: 'PT Astra International Tbk',
    sector: 'Conglomerate',
    npwp: '09.012.345.6-019.000',
    riskScore: 22,
    riskTier: 'low',
    signals: { etr: 18, margin: 20, rpHaven: 15, debt: 22, ownership: 18, conduct: 10 },
    avoidanceMethods: [],
    financials: [
      { year: 2019, revenue: 237.2, ebitda: 40.8, netProfit: 21.7, taxPaid: 9.8, preTaxProfit: 32.1, etr: 30.5, netMargin: 9.2, totalLiabilities: 184.2, totalEquity: 180.4, deRatio: 1.0, rpPayments: 18.4 },
      { year: 2020, revenue: 190.4, ebitda: 28.4, netProfit: 12.8, taxPaid: 6.8, preTaxProfit: 20.4, etr: 33.3, netMargin: 6.7, totalLiabilities: 178.8, totalEquity: 186.2, deRatio: 1.0, rpPayments: 16.2 },
      { year: 2021, revenue: 222.8, ebitda: 38.2, netProfit: 20.1, taxPaid: 9.1, preTaxProfit: 30.2, etr: 30.1, netMargin: 9.0, totalLiabilities: 182.4, totalEquity: 200.1, deRatio: 0.9, rpPayments: 18.8 },
      { year: 2022, revenue: 301.4, ebitda: 52.8, netProfit: 31.2, taxPaid: 13.4, preTaxProfit: 46.8, etr: 28.6, netMargin: 10.4, totalLiabilities: 188.4, totalEquity: 224.8, deRatio: 0.8, rpPayments: 22.1 },
      { year: 2023, revenue: 320.8, ebitda: 56.4, netProfit: 33.8, taxPaid: 14.2, preTaxProfit: 49.8, etr: 28.5, netMargin: 10.5, totalLiabilities: 192.4, totalEquity: 248.2, deRatio: 0.8, rpPayments: 24.2 },
    ],
    sectorPeerMeanMargin: 9.8,
    sectorPeerStdMargin: 3.2,
    zScore: 0.2,
    ownershipNodes: [
      { id: 'asii-op', name: 'PT Astra International', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'operating', x: 300, y: 200 },
      { id: 'jardine', name: 'Jardine Cycle & Carriage', jurisdiction: 'Singapore', isTaxHaven: false, type: 'holding', x: 220, y: 100 },
    ],
    ownershipEdges: [
      { source: 'jardine', target: 'asii-op', sharePercent: 50.1 },
    ],
    taxHavenCount: 0,
    priorConduct: [],
    mysteryEntities: [],
    rpJurisdictions: [
      { name: 'Indonesia', amount: 20.8, isTaxHaven: false, flag: '🇮🇩' },
      { name: 'Singapore', amount: 3.4, isTaxHaven: false, flag: '🇸🇬' },
    ],
    impliedRPRate: 6.8,
    biRate: 6.25,
    isWatchlisted: false,
    watchlistNote: '',
    annotations: [],
    aiSummary: 'PT Astra International shows low tax risk. ETR consistently near statutory rate (28–33%). No offshore tax haven affiliations. Debt-to-equity well within safe harbor. RP payments are primarily domestic intragroup transactions consistent with a diversified conglomerate structure.',
    lastUpdated: '2026-03-21',
    alerts: [],
  },
  {
    id: 'comp-11',
    ticker: 'TLKM',
    name: 'PT Telekomunikasi Indonesia',
    sector: 'Telecommunications',
    npwp: '10.123.456.7-020.000',
    riskScore: 18,
    riskTier: 'low',
    signals: { etr: 15, margin: 16, rpHaven: 10, debt: 20, ownership: 12, conduct: 8 },
    avoidanceMethods: [],
    financials: [
      { year: 2019, revenue: 135.6, ebitda: 62.4, netProfit: 18.7, taxPaid: 8.2, preTaxProfit: 28.4, etr: 28.9, netMargin: 13.8, totalLiabilities: 94.2, totalEquity: 142.8, deRatio: 0.7, rpPayments: 4.2 },
      { year: 2020, revenue: 136.4, ebitda: 63.8, netProfit: 20.8, taxPaid: 8.8, preTaxProfit: 31.2, etr: 28.2, netMargin: 15.2, totalLiabilities: 92.4, totalEquity: 148.2, deRatio: 0.6, rpPayments: 4.4 },
      { year: 2021, revenue: 143.2, ebitda: 68.2, netProfit: 22.8, taxPaid: 9.4, preTaxProfit: 33.8, etr: 27.8, netMargin: 15.9, totalLiabilities: 90.8, totalEquity: 156.4, deRatio: 0.6, rpPayments: 4.8 },
      { year: 2022, revenue: 147.3, ebitda: 70.4, netProfit: 21.2, taxPaid: 8.8, preTaxProfit: 31.8, etr: 27.7, netMargin: 14.4, totalLiabilities: 89.2, totalEquity: 162.8, deRatio: 0.5, rpPayments: 5.1 },
      { year: 2023, revenue: 149.2, ebitda: 71.8, netProfit: 22.4, taxPaid: 9.2, preTaxProfit: 32.8, etr: 28.0, netMargin: 15.0, totalLiabilities: 88.4, totalEquity: 170.2, deRatio: 0.5, rpPayments: 5.4 },
    ],
    sectorPeerMeanMargin: 14.2,
    sectorPeerStdMargin: 3.8,
    zScore: 0.2,
    ownershipNodes: [
      { id: 'tlkm-op', name: 'PT Telkom Indonesia', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'operating', x: 300, y: 200 },
      { id: 'govt-id', name: 'Republic of Indonesia (GOI)', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'holding', x: 220, y: 100 },
    ],
    ownershipEdges: [
      { source: 'govt-id', target: 'tlkm-op', sharePercent: 52.1 },
    ],
    taxHavenCount: 0,
    priorConduct: [],
    mysteryEntities: [],
    rpJurisdictions: [
      { name: 'Indonesia', amount: 5.4, isTaxHaven: false, flag: '🇮🇩' },
    ],
    impliedRPRate: 6.2,
    biRate: 6.25,
    isWatchlisted: false,
    watchlistNote: '',
    annotations: [],
    aiSummary: 'PT Telkom Indonesia presents low tax risk. As a state-owned enterprise with 52.1% government ownership, the company maintains consistent ETR near statutory rates and has no offshore tax structure. Debt levels are conservative.',
    lastUpdated: '2026-03-21',
    alerts: [],
  },
  {
    id: 'comp-12',
    ticker: 'KLBF',
    name: 'PT Kalbe Farma Tbk',
    sector: 'Pharmaceuticals',
    npwp: '11.234.567.8-021.000',
    riskScore: 28,
    riskTier: 'low',
    signals: { etr: 24, margin: 22, rpHaven: 20, debt: 18, ownership: 22, conduct: 15 },
    avoidanceMethods: [],
    financials: [
      { year: 2019, revenue: 22.6, ebitda: 4.8, netProfit: 2.5, taxPaid: 1.1, preTaxProfit: 3.8, etr: 28.9, netMargin: 11.1, totalLiabilities: 5.4, totalEquity: 16.8, deRatio: 0.3, rpPayments: 1.8 },
      { year: 2020, revenue: 23.1, ebitda: 5.0, netProfit: 2.7, taxPaid: 1.2, preTaxProfit: 4.1, etr: 29.3, netMargin: 11.7, totalLiabilities: 5.6, totalEquity: 18.2, deRatio: 0.3, rpPayments: 1.9 },
      { year: 2021, revenue: 24.8, ebitda: 5.4, netProfit: 3.0, taxPaid: 1.3, preTaxProfit: 4.4, etr: 29.5, netMargin: 12.1, totalLiabilities: 5.8, totalEquity: 20.1, deRatio: 0.3, rpPayments: 2.1 },
      { year: 2022, revenue: 27.2, ebitda: 5.9, netProfit: 3.2, taxPaid: 1.4, preTaxProfit: 4.8, etr: 29.2, netMargin: 11.8, totalLiabilities: 6.2, totalEquity: 22.4, deRatio: 0.3, rpPayments: 2.3 },
      { year: 2023, revenue: 29.1, ebitda: 6.3, netProfit: 3.5, taxPaid: 1.5, preTaxProfit: 5.1, etr: 29.4, netMargin: 12.0, totalLiabilities: 6.6, totalEquity: 24.8, deRatio: 0.3, rpPayments: 2.5 },
    ],
    sectorPeerMeanMargin: 10.4,
    sectorPeerStdMargin: 2.8,
    zScore: 0.6,
    ownershipNodes: [
      { id: 'klbf-op', name: 'PT Kalbe Farma', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'operating', x: 300, y: 200 },
      { id: 'gira', name: 'PT Gira Sole Prima (Family)', jurisdiction: 'Indonesia', isTaxHaven: false, type: 'holding', x: 220, y: 100 },
    ],
    ownershipEdges: [
      { source: 'gira', target: 'klbf-op', sharePercent: 10.2 },
    ],
    taxHavenCount: 0,
    priorConduct: [],
    mysteryEntities: [],
    rpJurisdictions: [
      { name: 'Indonesia', amount: 2.5, isTaxHaven: false, flag: '🇮🇩' },
    ],
    impliedRPRate: 6.4,
    biRate: 6.25,
    isWatchlisted: false,
    watchlistNote: '',
    annotations: [],
    aiSummary: 'PT Kalbe Farma presents low risk across all indicators. ETR is consistently near statutory rates with no offshore structure. The company is domestically owned and exhibits above-peer net margins in the pharmaceutical sector.',
    lastUpdated: '2026-03-21',
    alerts: [],
  },
];

export const MOCK_COLLECTIONS = [
  {
    id: 'col-1',
    name: 'Q1 2026 Priority Cases',
    description: 'Top-priority cases for Q1 audit referral to supervisor',
    color: '#BF4D43',
    status: 'active' as const,
    companyIds: ['comp-1', 'comp-2'],
    createdAt: '2026-01-15',
  },
  {
    id: 'col-2',
    name: 'Coal Sector Review',
    description: 'Coal mining companies with transfer pricing exposure',
    color: '#D97757',
    status: 'active' as const,
    companyIds: ['comp-1', 'comp-3'],
    createdAt: '2026-02-01',
  },
  {
    id: 'col-3',
    name: 'Debt Shifting Watch',
    description: 'Companies approaching or exceeding 4:1 DE safe harbor',
    color: '#207FDE',
    status: 'active' as const,
    companyIds: ['comp-3', 'comp-5'],
    createdAt: '2026-02-20',
  },
];

export const SECTOR_STATS = {
  totalCompanies: 921,
  avgRiskScore: 41.2,
  criticalCount: 48,
  highCount: 124,
  mediumCount: 318,
  lowCount: 431,
};

export function getRiskColor(tier: RiskTier): string {
  switch (tier) {
    case 'critical': return '#BF4D43';
    case 'high': return '#D97757';
    case 'medium': return '#D4A017';
    case 'low': return '#4CAF74';
  }
}

export function getRiskLabel(tier: RiskTier): string {
  switch (tier) {
    case 'critical': return 'Critical';
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
  }
}

export function getAvoidanceLabel(method: AvoidanceMethod): string {
  switch (method) {
    case 'transfer_pricing': return 'Transfer Pricing';
    case 'debt_shifting': return 'Debt Shifting';
    case 'royalty_stripping': return 'Royalty Stripping';
    case 'shell_layering': return 'Shell Layering';
  }
}
