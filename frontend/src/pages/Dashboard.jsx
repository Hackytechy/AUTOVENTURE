import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { ShieldAlert, TrendingUp, Zap, ArrowRight, Lightbulb, Activity, AlertTriangle, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Dashboard = () => {
  const { currentAnalysis, globalDemandMultiplier } = useAppContext();
  // Ensure we fall back to defaults if no analysis run yet
  const analysisInputs = currentAnalysis?.inputs || {};
  const metrics = currentAnalysis?.metrics || {};

  // Mock Data fallback
  const revenueData = metrics.revenueData || [
    { name: 'Q1', projected: 4400 },
    { name: 'Q2', projected: 5200 },
    { name: 'Q3', projected: 6800 },
    { name: 'Q4', projected: 8900 },
    { name: 'Q5', projected: 11200 },
  ];

  const costProjection = metrics.costProjection || [
    { name: 'Q1', current: 2000 },
    { name: 'Q2', current: 3500 },
    { name: 'Q3', current: 5000 },
    { name: 'Q4', current: 7500 },
    { name: 'Q5', current: 10000 },
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
    { day: 2, users: 220 },
    { day: 3, users: 460 },
    { day: 4, users: 620 },
    { day: 5, users: 810 },
    { day: 6, users: 1050 },
    { day: 7, users: 1380 },
  ];

  const heatmapData = metrics.heatmapData || [
    { x: 10, y: 30, z: 200, risk: 'Low' },
    { x: 40, y: 70, z: 200, risk: 'Mid' },
    { x: 70, y: 20, z: 200, risk: 'High' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      let value = payload[0].value;
      if (['current', 'projected'].includes(payload[0].dataKey)) {
         const prefix = analysisInputs.currency ? analysisInputs.currency + ' ' : '';
         value = `${prefix}${value.toLocaleString()}`;
      }
      return (
        <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{`${payload[0].name || payload[0].dataKey}: ${value}`}</p>
        </div>
      );
    }
    return null;
  };

  const getRiskColor = (risk) => {
    const r = String(risk || '').toLowerCase();
    if (r.includes('low')) return '#10b981';
    if (r.includes('medium') || r.includes('mid')) return '#f59e0b';
    if (r.includes('critical')) return '#991b1b';
    if (r.includes('high')) return '#ef4444';
    return '#8884d8';
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {analysisInputs.idea ? `Analysis: ${analysisInputs.idea.substring(0, 30)}${analysisInputs.idea.length > 30 ? '...' : ''}` : 'Analysis Dashboard'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Hybrid Intelligence: Local ML + Specialized LLM Reasoning
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
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                  <AlertTriangle color="var(--accent-danger)" />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Risk Score</p>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-danger)' }}>{metrics.riskScore || 24}%</h3>
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

      {currentAnalysis?.isComparison && (
        <div className="glass-panel animate-fade-in" style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Activity color="var(--accent-primary)" />
             <h3 style={{ margin: 0 }}>Hybrid Engine Benchmarks (Local vs API)</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Engine Component</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Accuracy</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Latency</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Compute Cost</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Conf. Index</th>
                </tr>
              </thead>
              <tbody>
                {currentAnalysis.comparison.map((comp, i) => (
                  <tr key={i}>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>{comp.name}</td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--accent-success)' }}>{comp.accuracy}</td>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--accent-primary)' }}>{comp.latency}</td>
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
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} color="var(--accent-warning)" />
            Risk Heatmap (LLM Derived)
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" dataKey="x" name="Market Volatility" stroke="var(--text-secondary)" domain={[0, 10]} tickCount={6} />
                <YAxis type="number" dataKey="y" name="Operational Risk" stroke="var(--text-secondary)" domain={[0, 10]} tickCount={6} />
                <ZAxis type="number" dataKey="z" range={[500, 1000]} name="Impact" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter data={heatmapData}>
                  {heatmapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Growth Curve trajectory (Hybrid Prediction)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <AreaChart data={growthCurveData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--text-secondary)" label={{ value: 'Days Since Launch', position: 'insideBottom', offset: -15, fill: 'var(--text-secondary)' }} />
                <YAxis stroke="var(--text-secondary)" width={50} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} label={{ value: 'Active Users', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }} />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Revenue Projection (LSTM)</h3>
          <div style={{ height: '200px', width: '100%' }}>
             <ResponsiveContainer>
               <LineChart data={revenueData} margin={{ left: 20 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                 <XAxis dataKey="name" stroke="var(--text-secondary)" />
                 <YAxis stroke="var(--text-secondary)" width={90} tickFormatter={(val) => {
                   const prefix = analysisInputs.currency ? analysisInputs.currency + ' ' : '';
                   return `${prefix}${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`;
                 }} />
                 <Tooltip content={<CustomTooltip />} />
                 <Line type="monotone" dataKey="projected" stroke="var(--accent-success)" strokeWidth={3} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Demand Forecast (LSTM)</h3>
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

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Resource Burn / Cost (XGBoost)</h3>
          <div style={{ height: '200px', width: '100%' }}>
             <ResponsiveContainer>
               <AreaChart data={costProjection} margin={{ left: 20 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                 <XAxis dataKey="name" stroke="var(--text-secondary)" />
                 <YAxis stroke="var(--text-secondary)" width={90} tickFormatter={(val) => {
                   const prefix = analysisInputs.currency ? analysisInputs.currency + ' ' : '';
                   return `${prefix}${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`;
                 }} />
                 <Tooltip content={<CustomTooltip />} />
                 <Area type="step" dataKey="current" stroke="var(--accent-warning)" fill="rgba(245, 158, 11, 0.2)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.8rem', marginTop: '3rem', marginBottom: '1.5rem' }}>Strategic Reasoning (LLM Insights)</h2>

      {/* Model-Specific Analysis Section */}
      {metrics.explanation?.modelPersonaOutput && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              {currentAnalysis.inputs?.model || 'ANALYSIS'} MODE
            </div>
            <h3 style={{ margin: 0 }}>Specialized Model Findings</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: Array.isArray(metrics.explanation?.modelPersonaOutput?.featureImportance) && metrics.explanation?.modelPersonaOutput?.timeSeriesPattern ? '1fr 1fr' : '1fr', gap: '2rem' }}>
            
            {/* XGBoost / Hybrid Feature Importance */}
            {Array.isArray(metrics.explanation?.modelPersonaOutput?.featureImportance) && (
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <Zap size={16} /> Feature Importance (Numerical Reasoning)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {metrics.explanation.modelPersonaOutput.featureImportance.map((f, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        <span>{f.feature}</span>
                        <span style={{ fontWeight: 600 }}>{(f.score * 100).toFixed(0)}%</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${f.score * 100}%`, 
                          background: 'linear-gradient(90deg, var(--accent-primary), #a78bfa)', 
                          borderRadius: '4px',
                          boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LSTM / Hybrid Time Series Pattern */}
            {metrics.explanation?.modelPersonaOutput?.timeSeriesPattern && (
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <TrendingUp size={16} /> Temporal Pattern Analysis (Sequential)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-secondary)' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Past Trend</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem' }}>{metrics.explanation.modelPersonaOutput.timeSeriesPattern.past}</p>
                  </div>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-warning)' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Pattern Recognition</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem' }}>{metrics.explanation.modelPersonaOutput.timeSeriesPattern.pattern}</p>
                  </div>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-success)' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Future Forecast</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem' }}>{metrics.explanation.modelPersonaOutput.timeSeriesPattern.future}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hybrid Specific Insight */}
          {metrics.explanation.modelPersonaOutput.hybridInsight && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
               <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Sparkles size={16} /> Hybrid Intelligence Synthesis
               </h4>
               <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, fontStyle: 'italic', color: 'var(--text-primary)' }}>
                 "{metrics.explanation.modelPersonaOutput.hybridInsight}"
               </p>
            </div>
          )}
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '4rem' }}>
        {/* Drawbacks & Risks */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldAlert size={24} />
            Structural Risks & Drawbacks
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(metrics.drawbacks && metrics.drawbacks.length > 0 ? metrics.drawbacks : ["Identifying market entry barriers...", "Analyzing capital efficiency risks...", "Evaluating competitive threats..."]).map((drawback, i) => (
              <div key={i} className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                  {typeof drawback === 'string' ? drawback : (drawback.description || drawback.title || JSON.stringify(drawback))}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Lightbulb size={24} />
            Strategic Growth Suggestions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(metrics.suggestions && metrics.suggestions.length > 0 ? metrics.suggestions : ["Generating strategic pivots...", "Optimizing resource allocation...", "Discovering niche opportunities..."]).map((suggestion, i) => (
              <div key={i} className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-success)', background: 'rgba(16, 185, 129, 0.05)' }}>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                  {typeof suggestion === 'string' ? suggestion : (suggestion.description || suggestion.title || JSON.stringify(suggestion))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
             <h3 style={{ margin: 0 }}>XGBoost Metric Optimization Report</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Metric</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Current</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Optimized</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Identified Drawbacks</th>
                  <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>AI Suggestion</th>
                </tr>
              </thead>
              <tbody>
                {(metrics.metricDetails || []).map((detail, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>{detail.name}</td>
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
             <h3 style={{ margin: 0 }}>Strategic Roadmap (LLM Optimized)</h3>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'stretch' }}>
              <div style={{ flex: 1, padding: '1.5rem', border: '1px dashed var(--accent-danger)', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.05)' }}>
                <h4 style={{ color: 'var(--accent-danger)', marginBottom: '1rem' }}>Before (Structural Flaws)</h4>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {(metrics.strategicRoadmap?.before || ["Analyzing roadmap..."]).map((point, i) => <li key={i}>{point}</li>)}
                </ul>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={32} color="var(--text-tertiary)" />
              </div>
              <div style={{ flex: 1, padding: '1.5rem', border: '1px solid var(--accent-success)', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.05)' }}>
                <h4 style={{ color: 'var(--accent-success)', marginBottom: '1rem' }}>After (Strategic Solutions)</h4>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {(metrics.strategicRoadmap?.after || ["Optimizing strategy..."]).map((point, i) => <li key={i}>{point}</li>)}
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
