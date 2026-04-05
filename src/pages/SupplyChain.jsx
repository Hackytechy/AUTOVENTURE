import { useState } from 'react';
import { MapPin, Truck, Globe, TrendingUp, AlertTriangle, Lightbulb, Activity } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAppContext } from '../context/AppContext';

const SupplyChain = () => {
  const { currentAnalysis, globalDemandMultiplier: demandMultiplier, setGlobalDemandMultiplier: setDemandMultiplier } = useAppContext();
  const [region, setRegion] = useState('india');

  const metrics       = currentAnalysis?.metrics    || {};
  const inputs        = currentAnalysis?.inputs     || {};
  const supplyChain   = metrics.supplyChain         || {};
  const rawRisk      = (supplyChain.riskLevel || 'medium').toLowerCase();
  const riskLevel     = rawRisk.includes('mod') ? 'medium' : rawRisk;
  const overallRisk   = supplyChain.overallRisk     || 5.0;
  const industryLabel = supplyChain.industryLabel   || 'General Market';

  // ── Currency symbol from user input ──────────────────────────────────────
  const currencySymbolMap = { USD: '$', INR: '₹', EUR: '€', GBP: '£' };
  const currencySymbol = currencySymbolMap[inputs.currency] || '$';

  // ── Determine base status from analysis risk + demand slider ─────────────
  // riskLevel drives the STARTING point; slider makes things worse
  const getRouteStatus = (baseGood, baseBad) => {
    if (demandMultiplier > 2.2) return 'Critical Delay';
    if (demandMultiplier > 1.6) return riskLevel === 'low' ? baseBad : 'Critical Delay';
    if (riskLevel === 'high')   return baseBad;
    if (riskLevel === 'medium') return baseGood;
    return baseGood; // low risk
  };

  const statusColor = (s) => {
    if (s === 'Critical Delay') return 'var(--accent-danger)';
    if (s === 'Delayed' || s === 'At Risk') return 'var(--accent-warning)';
    return 'var(--accent-success)';
  };

  const adjustDays = (baseDays) => {
    const n = parseFloat(baseDays);
    const unit = baseDays.replace(/[0-9.]/g, '');
    if (demandMultiplier > 2.2) return `${(n * 1.6).toFixed(1)}${unit}`;
    if (demandMultiplier > 1.6) return `${(n * 1.25).toFixed(1)}${unit}`;
    if (riskLevel === 'high')   return `${(n * 1.1).toFixed(1)}${unit}`;
    return baseDays;
  };

  // ── India routes — statuses driven by riskLevel + slider ─────────────────
  const indiaBase = [
    { route: 'Mumbai → Delhi',      carrier: 'BlueDart Express', baseDays: '2d', good: 'On-Time', bad: 'Delayed'  },
    { route: 'Chennai → Bangalore', carrier: 'Delhivery',        baseDays: '1d', good: 'On-Time', bad: 'Delayed'  },
    { route: 'Delhi → Kolkata',     carrier: 'FedEx India',      baseDays: '3d', good: 'Delayed', bad: 'At Risk'  },
    { route: 'Pune → Hyderabad',    carrier: 'DTDC',             baseDays: '2d', good: 'On-Time', bad: 'Delayed'  },
    { route: 'Ahmedabad → Surat',   carrier: 'Ecom Express',     baseDays: '1d', good: 'On-Time', bad: 'On-Time'  },
  ].map(r => {
    const status = getRouteStatus(r.good, r.bad);
    return { route: r.route, carrier: r.carrier, days: adjustDays(r.baseDays), status, statusColor: statusColor(status) };
  });

  // ── Global routes — statuses driven by riskLevel + slider ────────────────
  const globalBase = [
    { route: 'Shanghai → Los Angeles', carrier: 'Maersk Line',  baseDays: '22d', good: 'Delayed',  bad: 'At Risk'  },
    { route: 'Rotterdam → New York',   carrier: 'MSC',          baseDays: '14d', good: 'On-Time',  bad: 'Delayed'  },
    { route: 'Singapore → Tokyo',      carrier: 'Evergreen',    baseDays: '9d',  good: 'On-Time',  bad: 'Delayed'  },
    { route: 'Dubai → London',         carrier: 'Hapag-Lloyd',  baseDays: '18d', good: 'On-Time',  bad: 'At Risk'  },
    { route: 'Mumbai → Hamburg',       carrier: 'CMA CGM',      baseDays: '20d', good: 'On-Time',  bad: 'Delayed'  },
  ].map(r => {
    const status = getRouteStatus(r.good, r.bad);
    return { route: r.route, carrier: r.carrier, days: adjustDays(r.baseDays), status, statusColor: statusColor(status) };
  });

  const activeRoutes = region === 'india' ? indiaBase : globalBase;

  // ── Heatmap — auto-normalise old 0-100 scale data to 0-10 ─────────────────
  const heatmapOffset = (demandMultiplier - 1) * 0.6;

  const rawHeatmap = metrics.heatmapData || [
    { x: 1.5, y: 1.5, z: 300, risk: 'Low Operational Risk — General Environment', color: '#10b981' },
    { x: 4.5, y: 4.5, z: 500, risk: 'Moderate Market Volatility Risk',            color: '#f59e0b' },
    { x: 7.5, y: 7.5, z: 700, risk: 'Elevated Infrastructure Exposure',           color: '#ef4444' },
  ];

  // Detect if incoming data is on the old 0-100 scale (any value > 10)
  const needsNorm = rawHeatmap.some(pt => (pt.x || 0) > 10 || (pt.y || 0) > 10);
  const scale = needsNorm ? 10 : 1; // divide by 10 to bring into 0-10 range

  const getColor = (x, y) => {
    if (x > 6.5 || y > 6.5) return '#ef4444';
    if (x > 3.5 || y > 3.5) return '#f59e0b';
    return '#10b981';
  };

  const heatmapData = rawHeatmap.map(pt => {
    const rawX = (pt.x || 0) / scale;
    const rawY = (pt.y || 0) / scale;
    const nx = Math.min(9.8, Math.max(0.2, rawX + heatmapOffset));
    const ny = Math.min(9.8, Math.max(0.2, rawY + heatmapOffset));
    return { x: nx, y: ny, z: pt.z || 400, risk: pt.risk, color: getColor(nx, ny) };
  });

  // ── Cost estimation — driven by user's actual budget + industry + risk ──────
  //   1. Parse the raw budget string from inputs ("500000", "5L", "1M", etc.)
  //   2. Apply a logistics/operational % based on product type & industry
  //   3. Scale by risk level and demand multiplier
  const rawBudgetStr  = String(inputs.budget || '50000').replace(/[^0-9.]/g, '');
  const budgetNum     = parseFloat(rawBudgetStr) || 50000;
  const field         = inputs.field       || '';
  const productType   = inputs.productType || 'Physical';
  const isDigital     = productType === 'Digital' || ['SaaS','FinTech','EdTech','Technology'].includes(field);

  // Logistics/operational cost as % of total budget (industry-realistic benchmarks)
  //   Digital products: lower physical cost (cloud infra, CDN, API costs ≈ 7–12%)
  //   Physical products: higher logistics cost (warehousing, shipping, handling ≈ 15–25%)
  const industryLogisticsPct = {
    'FinTech':    0.07, 'SaaS': 0.08,  'EdTech':      0.07, 'Technology':  0.09,
    'E-commerce': 0.22, 'Retail': 0.20, 'Logistics':   0.25, 'Healthcare':  0.18,
    'Real Estate': 0.12,
  };
  const basePct   = industryLogisticsPct[field] ?? (isDigital ? 0.08 : 0.20);

  // Risk level increases operational overhead
  const riskAdj   = riskLevel === 'high' ? 1.35 : riskLevel === 'medium' ? 1.12 : 1.0;

  // Region surcharge: global routes cost ~30% more
  const regionAdj = region === 'global' ? 1.30 : 1.0;

  const costEstimation = Math.floor(budgetNum * basePct * riskAdj * regionAdj * demandMultiplier);


  // ── AI suggestions ────────────────────────────────────────────────────────
  const defaultSuggestions = [
    { title: 'Strategic Logistics Redundancy', description: 'Implement alternative distribution channels to safeguard against manufacturing interruptions and minimize single points of failure in the supply network.' },
    { title: 'Predictive Inventory Allocation', description: 'Use historical demand data to optimize inventory positioning across regional fulfillment centers, reducing lead times by up to 30%.' },
    { title: 'Carrier Performance Benchmarking', description: 'Establish real-time SLA monitoring to ensure consistent delivery performance and proactively identify underperforming routes before they impact operations.' },
  ];
  const aiSuggestions = supplyChain.aiSuggestions || defaultSuggestions;
  const accentColors  = ['var(--accent-primary)', 'var(--accent-warning)', 'var(--accent-success)'];

  // Risk badge config
  const riskBadge = {
    low:    { label: 'Low Risk',    bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
    medium: { label: 'Medium Risk', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
    high:   { label: 'High Risk',   bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
  }[riskLevel?.toLowerCase()] || { label: 'Risk Info', bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: 'var(--border-color)' };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="glass-panel" style={{ padding: '0.6rem 1rem', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.82rem' }}>{payload[0]?.payload?.risk}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem' }}>

      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Supply Chain Simulation</h1>
          <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            Predictive logistics, cost estimation and bottleneck identification.
            {currentAnalysis && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: riskBadge.bg, color: riskBadge.color, border: `1px solid ${riskBadge.border}`, padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600 }}>
                <Activity size={12} /> {industryLabel} — {riskBadge.label}
              </span>
            )}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${region === 'india' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setRegion('india')}
          >
            <MapPin size={15} /> India Region
          </button>
          <button
            className={`btn ${region === 'global' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setRegion('global')}
          >
            <Globe size={15} /> Global Routes
          </button>
        </div>
      </div>

      {/* TOP GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>

        {/* Delivery Table */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-tertiary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Truck color="var(--accent-primary)" size={18} />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Delivery Estimation — {region === 'india' ? 'India' : 'Worldwide'}</h3>
            </div>
            {currentAnalysis && (
              <span style={{ fontSize: '0.75rem', color: riskBadge.color, background: riskBadge.bg, border: `1px solid ${riskBadge.border}`, padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 600 }}>
                {riskBadge.label} Profile
              </span>
            )}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.76rem', letterSpacing: '0.07em', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>ROUTE</th>
                <th style={{ padding: '0.85rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.76rem', letterSpacing: '0.07em', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>CARRIER</th>
                <th style={{ padding: '0.85rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.76rem', letterSpacing: '0.07em', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>DAYS</th>
                <th style={{ padding: '0.85rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.76rem', letterSpacing: '0.07em', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {activeRoutes.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: i !== activeRoutes.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '1.1rem 1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(99,102,241,0.12)', padding: '0.35rem', borderRadius: '6px', flexShrink: 0 }}>
                      <Truck size={13} color="var(--accent-primary)" />
                    </div>
                    {row.route}
                  </td>
                  <td style={{ padding: '1.1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{row.carrier}</td>
                  <td style={{ padding: '1.1rem 1.5rem', fontWeight: 700 }}>{row.days}</td>
                  <td style={{ padding: '1.1rem 1.5rem' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      background: `${row.statusColor}18`, color: row.statusColor,
                      padding: '0.3rem 0.85rem', borderRadius: '999px',
                      fontSize: '0.78rem', fontWeight: 600,
                      border: `1px solid ${row.statusColor}30`,
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: row.statusColor, flexShrink: 0 }} />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost + Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              <TrendingUp size={15} /> Cost Estimation
            </h3>
            <p style={{ fontSize: '2.6rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {currencySymbol}{costEstimation.toLocaleString()}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
              Estimated operational cost based on selected routes and current demand level.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: 500 }}>
              Demand / Supplier Multiplier
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="range" min="0.5" max="3" step="0.1"
                value={demandMultiplier}
                onChange={e => setDemandMultiplier(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 700, fontSize: '1.2rem', minWidth: '42px', color: 'var(--accent-primary)' }}>
                {demandMultiplier}x
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', marginTop: '1rem', lineHeight: 1.6, marginBottom: 0 }}>
              Increasing the multiplier stresses the supply chain — delivery statuses and costs update in real time.
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '2rem' }}>

        {/* Heatmap */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem' }}>
              <AlertTriangle color="var(--accent-danger)" size={17} /> Supply Chain Risk Heatmap
            </h3>
            {currentAnalysis && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                Risk Score: {overallRisk.toFixed(1)} / 10
              </span>
            )}
          </div>
          <div style={{ height: '270px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis
                  type="number" dataKey="x" name="Market Volatility"
                  domain={[0, 10]} tickCount={6} stroke="var(--text-secondary)" fontSize={11}
                  label={{ value: 'Market Volatility →', position: 'insideBottom', offset: -12, fontSize: 10, fill: 'var(--text-secondary)' }}
                />
                <YAxis
                  type="number" dataKey="y" name="Operational Risk"
                  domain={[0, 10]} tickCount={6} stroke="var(--text-secondary)" fontSize={11}
                  label={{ value: 'Operational Risk →', angle: -90, position: 'insideLeft', offset: 12, fontSize: 10, fill: 'var(--text-secondary)' }}
                />
                <ZAxis type="number" dataKey="z" range={[80, 700]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={heatmapData} isAnimationActive>
                  {heatmapData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.75rem' }}>
            {[['#10b981','Low Risk'],['#f59e0b','Moderate Risk'],['#ef4444','High Risk']].map(([c,l]) => (
              <span key={l} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: '9px', height: '9px', background: c, borderRadius: '50%' }} /> {l}
              </span>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem' }}>
            <Lightbulb color="var(--accent-primary)" size={17} /> AI Optimization Suggestions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            {aiSuggestions.map((s, i) => (
              <div
                key={i}
                style={{ background: 'var(--bg-tertiary)', padding: '1.1rem 1.25rem', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${accentColors[i % accentColors.length]}`, transition: 'transform 0.18s ease', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.92rem', color: 'var(--text-primary)' }}>{s.title}</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.81rem', lineHeight: 1.65 }}>{s.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupplyChain;
