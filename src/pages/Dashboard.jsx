import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { ShieldAlert, TrendingUp, Zap, ArrowRight, Lightbulb, Activity } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Dashboard = () => {
  const { currentAnalysis, globalDemandMultiplier } = useAppContext();
  // Ensure we fall back to defaults if no analysis run yet
  const analysisInputs = currentAnalysis?.inputs || {};
  const metrics = currentAnalysis?.metrics || {};

  // Mock Data fallback
  const revenueData = metrics.revenueData || [
    { name: 'Q1', current: 4000, projected: 4400 },
    { name: 'Q2', current: 3000, projected: 4200 },
    { name: 'Q3', current: 2000, projected: 5800 },
    { name: 'Q4', current: 2780, projected: 7900 },
    { name: 'Q5', current: 1890, projected: 9200 },
  ];

  const demandForecastData = (metrics.demandForecastData || [
    { month: 'Jan', demand: 65 },
    { month: 'Feb', demand: 59 },
    { month: 'Mar', demand: 80 },
    { month: 'Apr', demand: 81 },
    { month: 'May', demand: 110 },
    { month: 'Jun', demand: 140 },
  ]).map(item => ({ ...item, demand: Math.round(item.demand * globalDemandMultiplier) }));

  const growthCurveData = metrics.growthCurveData || [
    { day: 1, users: 100 },
    { day: 2, users: 120 },
    { day: 3, users: 160 },
    { day: 4, users: 220 },
    { day: 5, users: 310 },
    { day: 6, users: 450 },
    { day: 7, users: 680 },
  ];

  const heatmapData = metrics.heatmapData || [
    { x: 10, y: 30, z: 200, risk: 'Low', color: '#10b981' }, // Green
    { x: 40, y: 70, z: 200, risk: 'Mid', color: '#f59e0b' }, // Yellow
    { x: 70, y: 20, z: 200, risk: 'High', color: '#ef4444' }, // Red
    { x: 80, y: 80, z: 200, risk: 'Critical', color: '#991b1b' }, // Dark Red
    { x: 20, y: 60, z: 200, risk: 'Low', color: '#10b981' }, // Green
    { x: 50, y: 40, z: 200, risk: 'Mid', color: '#f59e0b' }, // Yellow
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{`${payload[0].name || payload[0].dataKey}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {analysisInputs.idea ? `Analysis: ${analysisInputs.idea.substring(0, 30)}${analysisInputs.idea.length > 30 ? '...' : ''}` : 'Analysis Dashboard'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            AI-driven forecasting for {analysisInputs.businessType || 'your startup'} in {analysisInputs.field || 'target industry'}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                <TrendingUp color="var(--accent-success)" />
              </div>
               <div>
                 <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Success Score</p>
                 <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-success)' }}>{metrics.successScore || 87}%</h3>
               </div>
            </div>
            <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                 <Zap color="var(--accent-primary)" />
               </div>
               <div>
                 <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Growth Score</p>
                 <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-primary)' }}>{metrics.growthScore || 9.2}/10</h3>
               </div>
            </div>
        </div>
      </div>

      {currentAnalysis?.comparison && (
        <div className="glass-panel animate-fade-in" style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Activity color="var(--accent-primary)" />
             <h3 style={{ margin: 0 }}>AI Models Comparison</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Model</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Accuracy</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Latency</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Processing Cost</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Success Prob.</th>
                </tr>
              </thead>
              <tbody>
                {currentAnalysis.comparison.map((comp, i) => (
                  <tr key={i} style={{ background: analysisInputs.model === comp.name ? 'rgba(99, 102, 241, 0.1)' : 'transparent' }}>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: analysisInputs.model === comp.name ? 'bold' : 'normal' }}>
                      {comp.name} {analysisInputs.model === comp.name && ' (Selected)'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--accent-success)' }}>{comp.accuracy}</td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{comp.latency}</td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{comp.cost}</td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{comp.prob}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
        {/* Heatmap Area */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} color="var(--accent-warning)" />
            Risk Heatmap Assessment
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" dataKey="x" name="Market Volatility" stroke="var(--text-secondary)" />
                <YAxis type="number" dataKey="y" name="Operational Risk" stroke="var(--text-secondary)" />
                <ZAxis type="number" dataKey="z" range={[500, 1000]} name="Impact" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter data={heatmapData} fill="#8884d8">
                  {heatmapData.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.8rem', display: 'flex', alignItems:'center', gap:'0.25rem' }}><div style={{width:'12px', height:'12px', background:'#10b981', borderRadius:'50%'}}/> Low Risk</span>
            <span style={{ fontSize: '0.8rem', display: 'flex', alignItems:'center', gap:'0.25rem' }}><div style={{width:'12px', height:'12px', background:'#f59e0b', borderRadius:'50%'}}/> Mid Risk</span>
            <span style={{ fontSize: '0.8rem', display: 'flex', alignItems:'center', gap:'0.25rem' }}><div style={{width:'12px', height:'12px', background:'#ef4444', borderRadius:'50%'}}/> High Risk</span>
          </div>
        </div>

        {/* Growth Curve */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Growth Curve trajectory</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <AreaChart data={growthCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--text-secondary)"/>
                <YAxis stroke="var(--text-secondary)"/>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
        {/* Revenue Forecast */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Revenue Forecast</h3>
          <div style={{ height: '200px', width: '100%' }}>
             <ResponsiveContainer>
               <LineChart data={revenueData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                 <XAxis dataKey="name" stroke="var(--text-secondary)" />
                 <YAxis stroke="var(--text-secondary)" />
                 <Tooltip content={<CustomTooltip />} />
                 <Line type="monotone" dataKey="projected" stroke="var(--accent-success)" strokeWidth={3} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Demand Forecast */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Demand Forecast</h3>
          <div style={{ height: '200px', width: '100%' }}>
             <ResponsiveContainer>
               <BarChart data={demandForecastData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                 <XAxis dataKey="month" stroke="var(--text-secondary)" />
                 <Tooltip content={<CustomTooltip />} />
                 <Bar dataKey="demand" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Project / Expenditures */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Cost Projection</h3>
          <div style={{ height: '200px', width: '100%' }}>
             <ResponsiveContainer>
               <AreaChart data={revenueData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                 <XAxis dataKey="name" stroke="var(--text-secondary)" />
                 <Tooltip content={<CustomTooltip />} />
                 <Area type="step" dataKey="current" stroke="var(--accent-warning)" fill="rgba(245, 158, 11, 0.2)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <h2 style={{ fontSize: '1.8rem', marginTop: '3rem', marginBottom: '1.5rem' }}>Strategic Insights & AI Suggestions</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
        
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
             <h3 style={{ margin: 0 }}>Metrics Optimization Report</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Metric</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Current</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Optimized</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Identified Drawbacks</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>AI Suggestion (How to reach)</th>
                </tr>
              </thead>
              <tbody>
                {(metrics.metricDetails || [
                  { name: "Growth Score", current: "6.5", optimized: "9.2", drawbacks: "High CAC, low organic retention", suggestion: "Shift 30% of ad-spend to community initiatives." },
                  { name: "Success Score", current: "54%", optimized: "87%", drawbacks: "Weak PMF indicator in EU region", suggestion: "Localize experience for European markets." }
                ]).map((detail, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>{detail.name}</td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--accent-warning)' }}>{detail.current}</td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--accent-success)', fontWeight: 'bold' }}>{detail.optimized}</td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{detail.drawbacks}</td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                        <Lightbulb size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{detail.suggestion}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
             <h3 style={{ margin: 0 }}>Business Strategy Comparison</h3>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'stretch' }}>
              <div style={{ flex: 1, padding: '1.5rem', border: '1px dashed var(--accent-danger)', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.05)' }}>
                <h4 style={{ color: 'var(--accent-danger)', marginBottom: '1rem' }}>Before (Current State)</h4>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {(metrics.strategicRoadmap?.before || [
                    "Relying strictly on B2C direct sales",
                    "Over-spending on generic search term campaigns",
                    "Monolithic tech stack increasing compute costs"
                  ]).map((point, i) => <li key={i}>{point}</li>)}
                </ul>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={32} color="var(--text-tertiary)" />
              </div>
              <div style={{ flex: 1, padding: '1.5rem', border: '1px solid var(--accent-success)', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.05)' }}>
                <h4 style={{ color: 'var(--accent-success)', marginBottom: '1rem' }}>After (Improvement Roadmap)</h4>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {(metrics.strategicRoadmap?.after || [
                    "Pivot to B2B2C whitelabel solutions",
                    "Targeted LLM-driven audience clustering",
                    "Migrate to serverless microservices"
                  ]).map((point, i) => <li key={i}>{point}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
