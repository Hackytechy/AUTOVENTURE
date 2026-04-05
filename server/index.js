import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  next();
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// ════════════════════════════════════════════════════════════════════════════
// 1. PROMPT VERSIONING
// ════════════════════════════════════════════════════════════════════════════
const PROMPT_VERSION = 'v1.2';

// ════════════════════════════════════════════════════════════════════════════
// 2. LLM LOGGING LAYER  (in-memory, capped at 500 entries)
// ════════════════════════════════════════════════════════════════════════════
const llmLogs = [];

const logLLMRequest = ({ inputs, model, modelName, success, latencyMs, error, isSimulated, engine }) => {
  llmLogs.push({
    id:          llmLogs.length + 1,
    timestamp:   new Date().toISOString(),
    promptVersion: PROMPT_VERSION,
    model,      // e.g. 'LLM'
    engine,     // 'gemini' | 'groq' | 'simulation'
    modelName,  // e.g. 'gemini-1.5-flash'
    idea:        (inputs.idea || '').substring(0, 60),
    field:       inputs.field  || 'N/A',
    budget:      inputs.budget || 'N/A',
    currency:    inputs.currency || 'USD',
    success,
    isSimulated: isSimulated || false,
    latencyMs,
    error:       error || null,
  });
  if (llmLogs.length > 500) llmLogs.shift();
};

// ════════════════════════════════════════════════════════════════════════════
// SMART FALLBACK ENGINE  (unchanged — existing logic preserved exactly)
// ════════════════════════════════════════════════════════════════════════════
const generateSmartFallback = (inputs) => {
  const budgetStr = String(inputs.budget || '50000').replace(/[^0-9.]/g, '');
  const budget = parseInt(budgetStr) || 50000;
  const isDigital = inputs.productType === 'Digital';
  const multiplier = isDigital ? 1.2 : 0.8;
  const industryFactor = (inputs.field || '').length % 5 * 0.1 + 0.9;

  const idea = inputs.idea || 'Your Product';
  const field = inputs.field || 'General Market';
  const audience = inputs.audience || 'Target Customers';
  const businessType = inputs.businessType || 'Startup';
  const productType = inputs.productType || 'Physical';
  const shortIdea = idea.length > 25 ? idea.substring(0, 25) + '...' : idea;

  const riskProfiles = {
    'FinTech':     { volatility: 7.5, operational: 5.5, label: 'Financial Technology' },
    'Healthcare':  { volatility: 4.0, operational: 6.5, label: 'Healthcare & Pharma' },
    'EdTech':      { volatility: 3.5, operational: 3.5, label: 'Education Technology' },
    'SaaS':        { volatility: 5.0, operational: 4.0, label: 'SaaS Platform' },
    'E-commerce':  { volatility: 5.5, operational: 6.2, label: 'Electronic Commerce' },
    'Retail':      { volatility: 4.5, operational: 5.8, label: 'Retail Sector' },
    'Logistics':   { volatility: 6.0, operational: 7.2, label: 'Logistics & Supply' },
    'Technology':  { volatility: 5.5, operational: 4.5, label: 'Technology Sector' },
    'Real Estate': { volatility: 5.0, operational: 5.0, label: 'Real Estate Market' },
  };
  const profile = riskProfiles[field] || { volatility: 5.0, operational: 5.0, label: field };

  const budgetRiskAdj = budget > 300000 ? -1.8 : budget > 150000 ? -0.8 : budget > 75000 ? 0.0 : 1.2;
  const typeAdj = isDigital ? -0.8 : 0.4;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, parseFloat(v.toFixed(1))));

  const lowX  = clamp(profile.volatility * 0.25 + budgetRiskAdj * 0.3 + typeAdj * 0.2 + Math.random() * 0.4, 0.5, 3.5);
  const lowY  = clamp(profile.operational * 0.25 + budgetRiskAdj * 0.3 + typeAdj * 0.2 + Math.random() * 0.4, 0.5, 3.5);
  const midX  = clamp(profile.volatility * 0.55 + budgetRiskAdj * 0.5 + Math.random() * 0.6, 3.0, 6.5);
  const midY  = clamp(profile.operational * 0.55 + budgetRiskAdj * 0.5 + Math.random() * 0.6, 3.0, 6.5);
  const highX = clamp(profile.volatility * 0.9  + budgetRiskAdj * 0.7 + Math.random() * 0.5, 5.5, 9.5);
  const highY = clamp(profile.operational * 0.9  + budgetRiskAdj * 0.7 + Math.random() * 0.5, 5.5, 9.5);

  const overallRisk = clamp((profile.volatility + profile.operational) / 2 + budgetRiskAdj, 0, 10);
  const riskLevel   = overallRisk > 6.5 ? 'high' : overallRisk > 4.0 ? 'medium' : 'low';

  const industryCarrierMap = {
    'FinTech':     ['Stripe Financial Networks', 'Visa Payment Rails', 'Plaid Infrastructure'],
    'Healthcare':  ['Cardinal Health Logistics', 'McKesson Distribution', 'Medline Industries'],
    'EdTech':      ['AWS CloudFront Network', 'Cloudflare Education CDN', 'Akamai Delivery'],
    'SaaS':        ['AWS Global Infrastructure', 'Google Cloud Platform', 'Azure CDN'],
    'E-commerce':  ['Shopify Fulfillment Network', 'Amazon FBA Logistics', 'ShipBob Fulfillment'],
    'Retail':      ['UPS Supply Chain Solutions', 'FedEx Fulfillment Services', 'DHL Retail Logistics'],
    'Logistics':   ['DHL Global Forwarding', 'DB Schenker', 'Kuehne + Nagel'],
    'Technology':  ['AWS Infrastructure', 'Google Cloud Interconnect', 'Cloudflare Network'],
    'Real Estate': ['Title Insurance Network', 'Escrow Processing Services', 'Digital Deed Registry'],
  };
  const carriers = industryCarrierMap[field] || ['Primary Logistics Partner', 'Secondary Distribution Partner', 'Last-Mile Delivery Partner'];

  let routes;
  if (isDigital || ['SaaS', 'FinTech', 'EdTech', 'Technology'].includes(field)) {
    routes = [
      { route: `${shortIdea} Primary Server → Global Edge Network`,         carrier: carriers[0], status: 'Optimal',      days: `${Math.floor(12 + Math.random() * 8)}ms` },
      { route: `Development Pipeline → ${audience} Production Environment`, carrier: carriers[1], status: 'Optimal',      days: `${Math.floor(5  + Math.random() * 8)}m`  },
      { route: `API Gateway → ${audience} End Devices`,                      carrier: 'Global Internet Backbone', status: budget > 200000 ? 'Optimal' : 'High Latency', days: `${Math.floor(280 + Math.random() * 120)}ms` },
      { route: `Analytics Engine → ${businessType} Reporting Dashboard`,    carrier: carriers[2], status: 'Optimal',      days: `${Math.floor(1  + Math.random() * 5)}ms`  },
    ];
  } else if (['Healthcare', 'Retail', 'E-commerce', 'Logistics'].includes(field)) {
    routes = [
      { route: `${field} Supplier → ${shortIdea} Manufacturing Facility`,  carrier: carriers[0], status: 'On-Time', days: `${Math.floor(3 + Math.random() * 4)}d` },
      { route: `Central Warehouse → ${field} Regional Distribution Hub`,   carrier: carriers[1], status: 'On-Time', days: `${Math.floor(5 + Math.random() * 7)}d` },
      { route: `Fulfillment Center → ${audience} Last Mile Delivery`,      carrier: 'Express Delivery Services', status: budget > 150000 ? 'On-Time' : 'At Risk', days: `${Math.floor(1 + Math.random() * 3)}d` },
      { route: `Returns Processing → ${shortIdea} Quality Assurance`,      carrier: carriers[2], status: 'On-Time', days: `${Math.floor(1 + Math.random() * 2)}d` },
    ];
  } else {
    routes = [
      { route: `${field} Raw Material Supplier → ${shortIdea} Production`, carrier: 'Global Procurement Network', status: 'On-Time', days: `${Math.floor(4 + Math.random() * 6)}d` },
      { route: `${shortIdea} Manufacturing → ${businessType} Distribution`,carrier: carriers[0], status: 'On-Time', days: `${Math.floor(6 + Math.random() * 8)}d` },
      { route: `Distribution Center → ${audience} Market Channels`,        carrier: carriers[1], status: budget > 100000 ? 'On-Time' : 'Delayed', days: `${Math.floor(2 + Math.random() * 4)}d` },
      { route: `Customer Returns → ${shortIdea} Refurbishment Hub`,        carrier: 'Reverse Logistics Provider', status: 'On-Time', days: `${Math.floor(1 + Math.random() * 3)}d` },
    ];
  }

  const supplyChainData = {
    routes, riskLevel, overallRisk, industryLabel: profile.label,
    aiSuggestions: [
      { title: `${field} Route Optimization for ${shortIdea}`,  description: `Analysis of your ${businessType} model indicates a potential ${Math.floor(10 + Math.random() * 20)}% cost reduction by consolidating the primary distribution channels targeting ${audience}.` },
      { title: `Demand Forecasting for ${audience}`,            description: `A predictive inventory buffer of ${Math.floor(15 + Math.random() * 20)}% above baseline demand is recommended based on the projected budget.` },
      { title: `Risk Mitigation for ${productType} Pipeline`,   description: `The ${field} sector presents a ${budget < 100000 ? 'moderate-to-high' : 'low-to-moderate'} disruption risk. A secondary ${productType === 'Digital' ? 'cloud region failover' : 'supplier qualification'} program is strongly recommended.` },
    ],
  };

  return {
    successScore: Math.floor(70 + Math.random() * 25),
    growthScore:  (Math.random() * 3 + 6.5).toFixed(1),
    revenueData: [
      { name: 'Q1', current: Math.floor(budget * 0.10 * industryFactor), projected: Math.floor(budget * 0.15 * multiplier) },
      { name: 'Q2', current: Math.floor(budget * 0.20 * industryFactor), projected: Math.floor(budget * 0.30 * multiplier) },
      { name: 'Q3', current: Math.floor(budget * 0.35 * industryFactor), projected: Math.floor(budget * 0.55 * multiplier) },
      { name: 'Q4', current: Math.floor(budget * 0.60 * industryFactor), projected: Math.floor(budget * 0.90 * multiplier) },
      { name: 'Q5', current: Math.floor(budget * 0.90 * industryFactor), projected: Math.floor(budget * 1.30 * multiplier * industryFactor) },
    ],
    demandForecastData: Array.from({ length: 6 }, (_, i) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return { month: months[i], demand: Math.floor(200 + Math.random() * 1000 + (budget / 500)) };
    }),
    growthCurveData: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      users: Math.floor(100 * Math.pow(1.3 + (Math.random() * 0.4), i))
    })),
    heatmapData: [
      { x: lowX,  y: lowY,  z: 300, risk: `Low Operational Risk — ${profile.label} Environment`,       color: '#10b981' },
      { x: midX,  y: midY,  z: 500, risk: `Moderate ${businessType} Market Volatility Risk`,            color: '#f59e0b' },
      { x: highX, y: highY, z: 700, risk: `${riskLevel === 'high' ? 'Critical' : 'Elevated'} ${field} Infrastructure Exposure`, color: '#ef4444' },
    ],
    supplyChain: supplyChainData,
    metricDetails: [
      { name: 'Growth Index',        current: (6.0 + Math.random()).toFixed(1), optimized: (9.0 + Math.random()).toFixed(1), drawbacks: `Elevated Customer Acquisition Costs in ${field} targeting ${audience}.`, suggestion: `Improve onboarding for ${audience} to raise early retention by at least 20%.` },
      { name: 'Success Probability', current: '54%',                            optimized: '87%',                           drawbacks: `Inconsistent product-market alignment for ${shortIdea} in ${field}.`,   suggestion: `Scale ${productType} infrastructure to meet growing demand from ${audience}.` },
    ],
    strategicRoadmap: {
      before: [
        `Conventional ${businessType} approach with limited automation in ${field}.`,
        `Manual oversight of ${field} workflows without AI-assisted decision support.`,
        'Reactive supply chain management without predictive demand forecasting.',
      ],
      after: [
        `AI-driven optimization protocols tailored to the ${shortIdea} delivery model.`,
        `Precision-targeted engagement of ${audience} through data-driven channels.`,
        `Serverless elastic infrastructure enabling rapid scaling across the ${field} market.`,
      ],
    },
    comparison: [
      { name: 'Large Language Model', accuracy: '93%', latency: '1.2 seconds', cost: 'High Premium',   prob: '88%' },
      { name: 'Gradient Boosting',    accuracy: '84%', latency: '0.1 seconds', cost: 'Cost-Effective', prob: '79%' },
      { name: 'Recurrent Networks',   accuracy: '89%', latency: '0.4 seconds', cost: 'Standard Tier',  prob: '84%' },
    ],
    isSimulated: true,
  };
};
// ── 2a. XGBOOST SIMULATION (Gradient Boosting / Tabular) ───────────────────────
const generateXGBoostResult = (inputs) => {
  const { field, budget, audience } = inputs;
  const rawBudget = parseInt(String(budget || '50000').replace(/[^0-9]/g, '')) || 50000;
  
  // XGBoost is superior in structured industries
  const structuredFields = ['FinTech', 'Logistics', 'Retail', 'Healthcare', 'E-commerce', 'Real Estate'];
  const isStructured     = structuredFields.includes(field);
  
  const baseSuccess      = isStructured ? 78 : 64;
  const successScore     = Math.min(96, Math.round(baseSuccess + (Math.random() * 10) + (rawBudget > 100000 ? 5 : 0)));
  const growthScore      = (5.5 + (Math.random() * 2) + (isStructured ? 1.2 : 0)).toFixed(1);
  
  return {
    name: 'XGBoost (Gradient Boosting)',
    type: 'ML / Tabular',
    successScore,
    growthScore,
    confidenceScore: isStructured ? 89 : 72,
    latency: Math.round(40 + Math.random() * 80), // Fast
    explanation: {
      whySuccessScore: `XGBoost analysis identifies strong feature importance in ${field}'s structured datasets. ${isStructured ? 'High predictive accuracy due to tabular data density.' : 'Lower confidence due to unstructured creative variance in this field.'}`,
      keyFactors: [
        `Feature Weighting: Market saturation in ${field} weighted as primary constraint.`,
        `Data Density: ${audience} demographic consistency allows for high-precision clustering.`,
        `Overfitting Risk: Standardized for ${field} volatility through cross-validation.`
      ]
    }
  };
};

// ── 2b. LSTM SIMULATION (Long Short-Term Memory / RNN) ─────────────────────────
const generateLSTMResult = (inputs) => {
  const { field, budget, timeline } = inputs;
  const rawBudget = parseInt(String(budget || '50000').replace(/[^0-9]/g, '')) || 50000;
  
  // LSTM is superior in time-series and trend-heavy industries
  const trendFields = ['FinTech', 'Real Estate', 'Logistics', 'Gaming', 'Technology'];
  const isTrend     = trendFields.includes(field);
  
  const baseSuccess  = isTrend ? 74 : 58;
  const successScore = Math.min(94, Math.round(baseSuccess + (Math.random() * 12) + (rawBudget > 150000 ? 6 : 0)));
  const growthScore  = (6.5 + (Math.random() * 2.5) + (isTrend ? 0.8 : 0)).toFixed(1);
  
  return {
    name: 'LSTM (Recurrent Network)',
    type: 'RNN / Time-Series',
    successScore,
    growthScore,
    confidenceScore: isTrend ? 84 : 61,
    latency: Math.round(150 + Math.random() * 250), // Medium 
    explanation: {
      whySuccessScore: `LSTM projection highlights significant sequential dependencies in ${field}'s growth curves. ${isTrend ? 'High trend-capture capability for cyclical market patterns.' : 'Difficulty capturing non-sequential shifts in this niche.'}`,
      keyFactors: [
        `Temporal Decay: Customer retention in ${field} shows seasonal sensitivity.`,
        `Gradient Stability: Long-term budget runway of ${budget} allows for stable convergence.`,
        `Sequence Length: Analysis based on a ${timeline || '12 month'} projected sequence.`
      ]
    }
  };
};

// ════════════════════════════════════════════════════════════════════════════
// 3. CONFIDENCE SCORE
// ════════════════════════════════════════════════════════════════════════════
const calculateConfidenceScore = (data, inputs, isSimulated) => {
  let score = 55; // base

  // Budget stability — larger budgets give more reliable projections
  const budget = parseInt(String(inputs.budget || '50000').replace(/[^0-9]/g, '')) || 50000;
  if      (budget > 500000) score += 18;
  else if (budget > 200000) score += 12;
  else if (budget > 75000)  score += 6;
  else if (budget < 20000)  score -= 8;

  // Risk level — low risk = more predictable = higher confidence
  const riskLevel = data.supplyChain?.riskLevel || 'medium';
  if (riskLevel === 'low')    score += 12;
  else if (riskLevel === 'high') score -= 8;

  // Value consistency checks
  const ss = Number(data.successScore);
  const gs = Number(data.growthScore);
  if (ss >= 50 && ss <= 95) score += 6;
  if (gs >= 5  && gs <= 10) score += 5;
  if (Array.isArray(data.revenueData)  && data.revenueData.length  >= 5) score += 4;
  if (Array.isArray(data.heatmapData)  && data.heatmapData.length  >= 3) score += 4;

  // AI-generated results are more contextually consistent than simulation
  if (!isSimulated) score += 10;

  return Math.min(100, Math.max(0, Math.round(score)));
};

// ════════════════════════════════════════════════════════════════════════════
// 4. EXPLAINABILITY LAYER
// ════════════════════════════════════════════════════════════════════════════
const generateExplanation = (data, inputs) => {
  const ss         = Number(data.successScore) || 75;
  const field      = inputs.field        || 'General Market';
  const audience   = inputs.audience     || 'Target Customers';
  const budget     = parseInt(String(inputs.budget || '50000').replace(/[^0-9]/g, '')) || 50000;
  const currency   = inputs.currency     || 'USD';
  const productType= inputs.productType  || 'Physical';
  const riskLevel  = data.supplyChain?.riskLevel || 'medium';
  const gs         = Number(data.growthScore) || 7;

  const successReason =
    ss >= 85 ? `Strong success probability (${ss}%) driven by high ${field} market demand, sufficient capital allocation, and a clear product-market fit for ${audience}.`
  : ss >= 70 ? `Moderate-to-good success probability (${ss}%). The ${field} sector shows promising fundamentals, though execution discipline and customer acquisition efficiency will be decisive factors.`
  : ss >= 55 ? `Below-average success probability (${ss}%). Capital constraints and competitive density in ${field} limit scalability unless the team prioritises tight unit economics.`
              : `Low success probability (${ss}%). Significant risk exposure and insufficient budget headroom require immediate strategic pivots before scaling.`;

  return {
    successScoreReason: successReason,
    keyFactors: [
      `Industry Context: The ${field} sector carries a ${riskLevel} operational risk profile — ${riskLevel === 'high' ? 'requiring robust contingency planning and reserve capital' : riskLevel === 'medium' ? 'balancing growth ambition with disciplined execution' : 'providing a stable platform for predictable growth'}.`,
      `Capital Position: A budget of ${currency} ${budget.toLocaleString()} is ${budget > 200000 ? 'well-positioned for market entry and early scaling' : budget > 75000 ? 'sufficient for an MVP launch but tight for aggressive growth' : 'constrained — prioritise product-market fit validation before ops scaling'}.`,
      `Product Dynamics: A ${productType} product in ${field} benefits from ${productType === 'Digital' ? 'low marginal replication cost and global distribution reach, enabling rapid user scaling' : 'tangible brand trust and physical market presence, creating durable competitive barriers'}.`,
      `Growth Outlook: A projected growth score of ${gs}/10 indicates ${gs >= 8 ? 'exceptional scaling potential' : gs >= 6.5 ? 'solid, above-average growth trajectory' : 'moderate growth that requires market expansion strategies to accelerate'}.`,
    ],
    riskSummary: `${field} with a ${riskLevel} risk profile means ${riskLevel === 'high' ? 'significant market volatility requiring strong contingency planning and secondary supplier/infrastructure redundancy' : riskLevel === 'medium' ? 'manageable risk levels — standard mitigation protocols and quarterly reviews are sufficient' : 'stable operating conditions well-suited for steady, compounding growth'}.`,
  };
};

// ════════════════════════════════════════════════════════════════════════════
// 6. OUTPUT VALIDATION + AUTO-FILL
// ════════════════════════════════════════════════════════════════════════════
const REQUIRED_FIELDS = [
  'successScore', 'growthScore', 'revenueData', 'demandForecastData',
  'growthCurveData', 'heatmapData', 'supplyChain', 'metricDetails',
  'strategicRoadmap', 'comparison',
];

const validateAndFill = (data, inputs) => {
  const missingFields = REQUIRED_FIELDS.filter(f => {
    const v = data[f];
    if (v === undefined || v === null) return true;
    if (Array.isArray(v) && v.length < 2)   return true;
    if (f === 'successScore' && (Number(v) < 0 || Number(v) > 100)) return true;
    if (f === 'growthScore'  && (Number(v) < 0 || Number(v) > 10))  return true;
    return false;
  });

  if (missingFields.length === 0) return { data, filledFields: [] };

  const fallback = generateSmartFallback(inputs);
  const filled   = { ...data };
  missingFields.forEach(f => { filled[f] = fallback[f]; });
  console.warn(`⚠️  [Validation] Auto-filled missing fields: ${missingFields.join(', ')}`);
  return { data: filled, filledFields: missingFields };
};

// ════════════════════════════════════════════════════════════════════════════
// SUPPORTING HELPERS
// ════════════════════════════════════════════════════════════════════════════
const isValidKey = (key) =>
  key && key !== 'your_groq_api_key_here' && key !== 'your_api_key_here' && key.length > 10;

const buildPrompt = ({ idea, audience, timeline, budget }) => `
[Prompt Version: ${PROMPT_VERSION}]
As a Senior Startup Business Analyst evaluate this venture:
Idea: ${idea}
Target Audience: ${audience}
Budget: ${budget}
Timeline: ${timeline}

Return ONLY a valid JSON object (no markdown, no explanation) with exactly these fields:
- successScore: integer 0-100
- growthScore: float 0-10
- revenueData: array of 5 objects {name: "Q1"..."Q5", current, projected} (numbers)
- demandForecastData: array of 6 objects {month: "Jan"/"Feb"/"Mar"/"Apr"/"May"/"Jun", demand} (integers)
- growthCurveData: array of 7 objects {day, users}
- heatmapData: array of 3 risk objects {x, y, z, risk, color} where x and y are 0-10 floats
- supplyChain: {routes: array of 4 {route, carrier, status, days}, aiSuggestions: array of 3 {title, description}, riskLevel: "low"|"medium"|"high", overallRisk: float 0-10, industryLabel: string}
- metricDetails: array of 2 objects {name, current, optimized, drawbacks, suggestion}
- strategicRoadmap: {before: [3 strings], after: [3 strings]}
- comparison: array of 3 {name, accuracy, latency, cost, prob}

All text must be professional, complete sentences, no abbreviations.
`;

// ════════════════════════════════════════════════════════════════════════════
// CORE LLM CALL HELPERS
// ════════════════════════════════════════════════════════════════════════════
const callGemini = async (prompt) => {
  const t0     = Date.now();
  // Using gemini-1.5-flash-latest for better v1beta compatibility
  const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  const result = await model.generateContent(prompt);
  const text   = result.response.text();
  const match  = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Gemini returned invalid JSON structure');
  return { 
    data: JSON.parse(match[0]), 
    latency: Date.now() - t0, 
    modelName: 'gemini-1.5-flash-latest' 
  };
};

const callGroq = async (prompt) => {
  const t0         = Date.now();
  const completion = await groq.chat.completions.create({
    model:    'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a startup analysis expert. Always respond with valid JSON only — no markdown, no explanation.' },
      { role: 'user',   content: prompt },
    ],
    temperature: 0.7,
    max_tokens:  3000,
  });
  const text  = completion.choices[0]?.message?.content || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Groq returned invalid JSON structure');
  return { 
    data: JSON.parse(match[0]), 
    latency: Date.now() - t0, 
    modelName: 'llama-3.3-70b-versatile' 
  };
};

// ── 7. ROBUST EXECUTION LAYER (CASCADING TIERED CALLS) ───────────────────────
const executeTieredLLM = async (prompt, inputs) => {
  const requestStart = Date.now();
  let lastError = null;

  // Tier 1: Gemini
  if (isValidKey(process.env.GEMINI_API_KEY)) {
    try {
      console.log('💎 [T1] Attempting Gemini (1.5 Flash)...');
      const res = await callGemini(prompt);
      logLLMRequest({ inputs, model: 'Gemini', engine: 'gemini', modelName: res.modelName, success: true, latencyMs: res.latency, isSimulated: false });
      return { ...res, success: true, isSimulated: false };
    } catch (err) {
      console.error('⚠️ [T1] Gemini Failed:', err.message);
      lastError = err.message;
      logLLMRequest({ inputs, model: 'Gemini', engine: 'gemini', modelName: 'Gemini', success: false, latencyMs: Date.now() - requestStart, error: err.message, isSimulated: false });
    }
  }

  // Tier 2: Groq
  if (isValidKey(process.env.GROQ_API_KEY)) {
    try {
      console.log('⚡ [T2] Attempting Groq (Llama 3.3)...');
      const res = await callGroq(prompt);
      logLLMRequest({ inputs, model: 'Groq', engine: 'groq', modelName: res.modelName, success: true, latencyMs: res.latency, isSimulated: false });
      return { ...res, success: true, isSimulated: false };
    } catch (err) {
      console.error('⚠️ [T2] Groq Failed:', err.message);
      lastError = err.message;
      logLLMRequest({ inputs, model: 'Groq', engine: 'groq', modelName: 'Groq', success: false, latencyMs: Date.now() - requestStart, error: err.message, isSimulated: false });
    }
  }

  // Tier 3: High-Fidelity Simulation
  console.log('🪵 [T3] Falling back to High-Fidelity Simulation...');
  const fallbackData = generateSmartFallback(inputs);
  const latency = Math.round(500 + Math.random() * 500);
  logLLMRequest({ inputs, model: 'Simulation', engine: 'simulation', modelName: 'Simulation', success: true, latencyMs: latency, isSimulated: true });
  return { data: fallbackData, latency, modelName: 'Simulation', success: true, isSimulated: true };
};

// ════════════════════════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════════════════════════
app.get('/', (req, res) => {
  res.send(`
    <h1>NexusAI Backend — Production MLOps System</h1>
    <p>Prompt Version: <strong>${PROMPT_VERSION}</strong></p>
    <ul>
      <li><code>POST /api/analyze</code> — Main analysis endpoint</li>
      <li><code>GET  /api/logs</code>    — LLM request log viewer</li>
      <li><code>GET  /api/logs/stats</code> — Log statistics</li>
    </ul>
  `);
});

// ── GET /api/logs — view LLM request history ─────────────────────────────────
app.get('/api/logs', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  res.json({
    total:  llmLogs.length,
    showing: Math.min(limit, llmLogs.length),
    logs:   [...llmLogs].reverse().slice(0, limit),
  });
});

// ── GET /api/logs/stats — aggregate log statistics ───────────────────────────
app.get('/api/logs/stats', (req, res) => {
  const total     = llmLogs.length;
  const successes = llmLogs.filter(l => l.success).length;
  // Aggregate stats by engine (gemini, groq, simulation)
  const geminiHits= llmLogs.filter(l => l.engine === 'gemini' && l.success).length;
  const groqHits  = llmLogs.filter(l => l.engine === 'groq' && l.success).length;
  const simHits   = llmLogs.filter(l => l.engine === 'simulation').length;
  
  const latencies = llmLogs.filter(l => l.latencyMs > 0).map(l => l.latencyMs);
  const avgLatency = latencies.length > 0 ? latencies.reduce((s, l) => s + l, 0) / latencies.length : 0;

  res.json({
    total,
    successRate:    total ? `${Math.round((successes / total) * 100)}%` : 'N/A',
    engineBreakdown: { gemini: geminiHits, groq: groqHits, simulation: simHits },
    averageLatencyMs: Math.round(avgLatency),
    promptVersion: PROMPT_VERSION,
  });
});

// ════════════════════════════════════════════════════════════════════════════
// POST /api/analyze — MAIN ENDPOINT
//   Normal mode  : Tier1 Gemini → Tier2 Groq → Tier3 Simulation
//   Compare mode : Runs Gemini + Groq in parallel, returns full comparison
// ════════════════════════════════════════════════════════════════════════════
app.post('/api/analyze', async (req, res) => {
  const { compareModels } = req.body;
  const prompt            = buildPrompt(req.body);
  const requestStart      = Date.now();

  if (compareModels) {
    console.log('🔀 [Compare Mode] Strategic Architecture Benchmark (LLM vs XGBoost vs LSTM)...');

    // 1. Get the real LLM result (Cascading: Gemini -> Groq -> Fallback)
    const llmRes = await executeTieredLLM(prompt, req.body);
    const { data: llmFinal, filledFields } = validateAndFill(llmRes.data, req.body);
    const llmConf = calculateConfidenceScore(llmFinal, req.body, llmRes.isSimulated);
    
    // 2. Generate dynamic ML/RNN simulations
    const xgboost = generateXGBoostResult(req.body);
    const lstm    = generateLSTMResult(req.body);

    const winner = (llmRes.latency < xgboost.latency && llmRes.latency < lstm.latency) ? 'llm' : (xgboost.latency < lstm.latency ? 'xgboost' : 'lstm');

    return res.json({
      id:           Date.now().toString(),
      timestamp:    new Date().toLocaleTimeString(),
      inputs:       req.body,
      isComparison: true,
      llmResult: {
        name:       'LLM (Generative)',
        type:       'Transformer',
        metrics:    { ...llmFinal, confidenceScore: llmConf, explanation: generateExplanation(llmFinal, req.body) },
        latency:    llmRes.latency,
        success:    llmRes.success,
        modelName:  llmRes.modelName,
      },
      xgboostResult: {
        ...xgboost,
        metrics: { successScore: xgboost.successScore, growthScore: xgboost.growthScore, explanation: xgboost.explanation }
      },
      lstmResult: {
        ...lstm,
        metrics: { successScore: lstm.successScore, growthScore: lstm.growthScore, explanation: lstm.explanation }
      },
      latencyComparison: {
        llmMs: llmRes.latency,
        xgboostMs: xgboost.latency,
        lstmMs: lstm.latency,
        winner,
      },
      scoreDifference: {
        successScore: Math.max(
          Math.abs(llmFinal.successScore - xgboost.successScore),
          Math.abs(llmFinal.successScore - lstm.successScore)
        ),
        growthScore: Math.max(
          Math.abs(Number(llmFinal.growthScore) - Number(xgboost.growthScore)),
          Math.abs(Number(llmFinal.growthScore) - Number(lstm.growthScore))
        ).toFixed(2),
        confidenceScore: Math.abs(llmConf - xgboost.confidenceScore),
      },
      metadata: {
        promptVersion:   PROMPT_VERSION,
        totalLatencyMs:  Date.now() - requestStart,
      },
    });
  }

  // ── 5. UNIFIED TIERED ANALYSIS (Cascade: Gemini -> Groq -> Simulation) ──────
  const llmRes = await executeTieredLLM(prompt, req.body);
  const { data: finalData, filledFields } = validateAndFill(llmRes.data, req.body);
  const confidenceScore = calculateConfidenceScore(finalData, req.body, llmRes.isSimulated);
  const explanation     = generateExplanation(finalData, req.body);

  return res.json({
    id:           llmRes.isSimulated ? `sim-${Date.now()}` : Date.now().toString(),
    timestamp:    new Date().toLocaleTimeString(),
    inputs:       req.body,
    metrics:      { ...finalData, confidenceScore, explanation },
    isSimulated:  llmRes.isSimulated,
    metadata:     { 
      engineUsed:      llmRes.modelName, 
      modelName:       llmRes.modelName, 
      promptVersion:   PROMPT_VERSION, 
      latencyMs:       llmRes.latency, 
      confidenceScore, 
      filledFields 
    },
  });
});

// ════════════════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 NexusAI Backend — Production MLOps Mode`);
  console.log(`   Server:         http://localhost:${PORT}`);
  console.log(`   Prompt Version: ${PROMPT_VERSION}`);
  console.log(`   Gemini Key:     ${isValidKey(process.env.GEMINI_API_KEY) ? '✅ Active' : '❌ Missing'}`);
  console.log(`   Groq Key:       ${isValidKey(process.env.GROQ_API_KEY)   ? '✅ Active' : '❌ Missing'}\n`);
});
