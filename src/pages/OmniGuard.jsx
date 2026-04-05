import { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Cpu, HardDrive, Activity, Server, Clock, Zap, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const OmniGuard = () => {
  const { currentAnalysis, globalDemandMultiplier } = useAppContext();

  const metrics      = currentAnalysis?.metrics    || {};
  const inputs       = currentAnalysis?.inputs     || {};
  const supplyChain  = metrics.supplyChain         || {};
  const metadata     = currentAnalysis?.metadata   || {};

  const field        = inputs.field        || 'General Market';
  const audience     = inputs.audience     || 'Target Customers';
  const idea         = inputs.idea         || 'Your Venture';
  const productType  = inputs.productType  || 'Physical';
  const budgetNum    = parseInt(String(inputs.budget || '50000').replace(/[^0-9]/g, '')) || 50000;
  const riskLevel    = supplyChain.riskLevel    || 'medium';
  const overallRisk  = supplyChain.overallRisk  || 5.0;
  const confidence   = metrics.confidenceScore  || 72;
  const latencyMs    = metadata.latencyMs       || 120;
  const engineUsed   = metadata.engineUsed      || 'Smart Simulation Engine';
  const isDigital    = productType === 'Digital' || ['SaaS','FinTech','EdTech','Technology'].includes(field);

  // ── Derive system health metrics from analysis data ──────────────────────
  // CPU Load: scales with overall risk (0-10) + demand multiplier
  const cpuLoad = Math.min(98, Math.round(overallRisk * 7.2 + (globalDemandMultiplier - 1) * 18 + 20));

  // Memory: scales with budget size (bigger ops = more memory)
  const memoryGB = (budgetNum > 300000 ? 8.4 : budgetNum > 100000 ? 6.2 : budgetNum > 50000 ? 4.8 : 3.1)
                   * (globalDemandMultiplier * 0.6 + 0.4);
  const memoryDisplay = memoryGB.toFixed(1);

  // Response time: from real latency or estimated from risk
  const responseTimeMs = latencyMs > 0 ? latencyMs : Math.round(80 + overallRisk * 15 + (globalDemandMultiplier - 1) * 40);

  // Stability Score: derived from confidenceScore + inverse of risk
  const stabilityPct = Math.min(99.9, Math.max(85, confidence * 0.4 + (10 - overallRisk) * 3.5 + 40)).toFixed(1);

  // System Status: from riskLevel + demand
  const systemStatus     = globalDemandMultiplier > 2.0 || riskLevel === 'high'
    ? { label: 'Critical Alert',    color: 'var(--accent-danger)',   dot: 'danger'  }
    : globalDemandMultiplier > 1.3 || riskLevel === 'medium'
    ? { label: 'Elevated Warning',  color: 'var(--accent-warning)',  dot: 'warning' }
    : { label: 'All Systems Normal',color: 'var(--accent-success)',  dot: 'success' };

  const apiActivity      = globalDemandMultiplier > 2.0 ? 'Critical'
    : globalDemandMultiplier > 1.5 ? 'Very High'
    : globalDemandMultiplier > 1.2 ? 'High'
    : 'Normal';

  const systemLoadColor  = cpuLoad > 80 ? 'var(--accent-danger)' : cpuLoad > 60 ? 'var(--accent-warning)' : 'var(--accent-success)';

  // ── Dynamic alert pool based on industry + risk ──────────────────────────
  const alertPool = [
    { severity: 'danger',  msg: `Unusual ${field} API access pattern detected — ${Math.floor(overallRisk * 40 + 200)} req/min` },
    { severity: 'warning', msg: `Demand spike detected for ${idea.substring(0, 30)} — demand at ${globalDemandMultiplier.toFixed(1)}x` },
    { severity: 'danger',  msg: `${isDigital ? 'Cloud infrastructure' : 'Operational system'} load exceeds ${cpuLoad}% threshold` },
    { severity: 'warning', msg: `${riskLevel === 'high' ? 'High' : 'Moderate'} risk profile in ${field} triggers enhanced monitoring` },
    { severity: 'warning', msg: `${audience} traffic pattern anomaly — ${Math.floor(overallRisk * 12 + 30)} flagged sessions` },
  ];

  const [alerts, setAlerts] = useState(() =>
    alertPool.slice(0, riskLevel === 'high' ? 3 : 2).map((a, i) => ({ ...a, id: i + 1, time: i === 0 ? 'Just now' : `${i * 2}m ago` }))
  );

  // ── Dynamic healing log pool ─────────────────────────────────────────────
  const healingPool = [
    `${engineUsed} analysis completed in ${responseTimeMs}ms — no anomalies found`,
    `Auto-scaled ${isDigital ? 'cloud edge nodes' : 'processing capacity'} due to ${globalDemandMultiplier.toFixed(1)}x demand`,
    `${field} risk watchdog updated threat model — risk level: ${riskLevel}`,
    `Memory optimisation triggered — ${memoryDisplay} GB in use across ${isDigital ? 'cloud' : 'on-prem'} nodes`,
    `Suspicious pattern resolved — ${confidence}% confidence baseline restored`,
  ];

  const [logs, setLogs] = useState(() =>
    healingPool.slice(0, 2).map((text, i) => ({
      id: i + 1,
      text,
      time: new Date(Date.now() - i * 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }))
  );

  // ── Re-seed alerts and logs when analysis changes ────────────────────────
  useEffect(() => {
    setAlerts(
      alertPool.slice(0, riskLevel === 'high' ? 3 : 2).map((a, i) => ({ ...a, id: i + 1, time: i === 0 ? 'Just now' : `${i * 2}m ago` }))
    );
    setLogs(
      healingPool.slice(0, 2).map((text, i) => ({
        id: i + 1, text,
        time: new Date(Date.now() - i * 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAnalysis, globalDemandMultiplier]);

  // ── Simulated real-time ticks (new entries every 8s) ─────────────────────
  useEffect(() => {
    const liveAlerts = [
      { severity: 'warning', msg: `High traffic spike on ${field} ${isDigital ? 'API gateway' : 'order processing'} endpoints` },
      { severity: 'danger',  msg: `${cpuLoad}% CPU threshold crossed — auto-scaling triggered` },
      { severity: 'warning', msg: `Confidence index dropped to ${Math.max(50, confidence - 5)}% — revalidating model outputs` },
    ];
    const liveLogs = [
      `Adaptive throttling applied — ${audience} request queue stabilised`,
      `Self-healing routine completed — ${isDigital ? 'container' : 'service'} restarted, memory freed`,
      `${field} security policy refreshed — ${riskLevel} risk stance maintained`,
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        const pick = liveAlerts[Math.floor(Math.random() * liveAlerts.length)];
        setAlerts(prev => [{ ...pick, id: Date.now(), time: 'Just now' }, ...prev].slice(0, 6));
      } else {
        const pick = liveLogs[Math.floor(Math.random() * liveLogs.length)];
        setLogs(prev => [{
          id: Date.now(), text: pick,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }, ...prev].slice(0, 6));
      }
    }, 8000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAnalysis, globalDemandMultiplier]);

  // ── AI decision cards (industry-specific) ───────────────────────────────
  const decisions = [
    {
      tag: 'DECISION', tagColor: 'var(--accent-primary)',
      bg: 'rgba(99,102,241,0.05)', border: 'var(--accent-primary)',
      title: `Blocked anomalous request cluster on ${idea.substring(0, 28)} ${isDigital ? 'API' : 'operations'} layer`,
      body: `OmniGuard's multi-agent pipeline detected ${Math.floor(overallRisk * 50 + 200)} sequential requests from non-residential IPs targeting the ${field} ${isDigital ? 'authentication endpoints' : 'order management API'}. The AI automatically appended ${Math.floor(overallRisk * 8 + 12)} IPs to the WAF blocklist and triggered a 5-minute adaptive cooldown, protecting ${audience} session integrity.`,
    },
    {
      tag: 'ADAPTIVE', tagColor: 'var(--accent-success)',
      bg: 'rgba(16,185,129,0.05)', border: 'var(--accent-success)',
      title: `System risk downgraded after ${riskLevel === 'high' ? 'critical' : 'moderate'} threat mitigation`,
      body: `After successfully containing the suspected ${riskLevel === 'high' ? 'DDoS' : 'brute-force'} attempt on the ${field} infrastructure without dropping valid ${audience} traffic, the central intelligence agent downgraded the global threat level from ${riskLevel === 'high' ? 'red to orange' : 'orange to green'} and released ${Math.floor(budgetNum / 50000)} supplementary ${isDigital ? 'cloud compute' : 'processing'} nodes. Stability restored to ${stabilityPct}%.`,
    },
    {
      tag: 'INSIGHT', tagColor: 'var(--accent-warning)',
      bg: 'rgba(245,158,11,0.05)', border: 'var(--accent-warning)',
      title: `Confidence model recalibrated for ${field} risk environment`,
      body: `Based on the ${engineUsed} output (confidence: ${confidence}/100, latency: ${responseTimeMs}ms), OmniGuard updated its internal threat model for the ${field} sector. Current system stability score: ${stabilityPct}%. Recommendation: ${confidence > 75 ? 'maintain current monitoring cadence' : 'increase alert sensitivity and reduce auto-scale thresholds'} for the ${audience} traffic profile.`,
    },
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem' }}>

      {/* No-analysis warning */}
      {!currentAnalysis && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', color: 'var(--accent-warning)', fontSize: '0.87rem' }}>
          <Info size={16} />
          <span>No analysis loaded — showing default security posture. Run an analysis first to see venture-specific threat intelligence.</span>
        </div>
      )}

      {/* STATUS STRIP */}
      <div className="glass-panel" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 2rem', marginBottom: '2rem',
        borderLeft: `4px solid ${systemStatus.color}`,
        background: `linear-gradient(90deg, ${systemStatus.color}10 0%, var(--bg-tertiary) 100%)`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className={`status-dot ${systemStatus.dot}`} style={{ width: '12px', height: '12px' }} />
          <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            System Status: <span style={{ color: systemStatus.color }}>{systemStatus.label}</span>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Active Alerts</p>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.2rem' }}>{alerts.length}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>API Activity</p>
            <p style={{ margin: 0, fontWeight: 700, color: apiActivity === 'Critical' ? 'var(--accent-danger)' : 'var(--accent-success)', fontSize: '1.2rem' }}>{apiActivity}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>System Load</p>
            <p style={{ margin: 0, fontWeight: 700, color: systemLoadColor, fontSize: '1.2rem' }}>{cpuLoad}%</p>
          </div>
          {currentAnalysis && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Engine</p>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--accent-primary)', fontSize: '0.8rem', maxWidth: '100px', textAlign: 'center' }}>{engineUsed.split(' ')[0]}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>

        {/* SECURITY ALERTS */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle color="var(--accent-warning)" />
            <h3 style={{ margin: 0 }}>Live Security Alerts</h3>
            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-tertiary)', background: 'var(--bg-primary)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
              {field} · {riskLevel} risk
            </span>
          </div>
          <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', maxHeight: '350px' }}>
            {alerts.map(alert => (
              <div key={alert.id} className="animate-fade-in" style={{
                display: 'flex', gap: '1rem', padding: '1rem',
                background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                marginBottom: '0.85rem',
                borderLeft: `3px solid var(${alert.severity === 'danger' ? '--accent-danger' : '--accent-warning'})`,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{alert.time}</span>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: '0.88rem', lineHeight: 1.5 }}>{alert.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SYSTEM HEALTH */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
            <Activity color="var(--accent-primary)" />
            <h3 style={{ margin: 0 }}>System Health &amp; Performance</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <Cpu color={cpuLoad > 80 ? 'var(--accent-danger)' : 'var(--accent-warning)'} size={28} />
              <div>
                <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>CPU Load</p>
                <h2 style={{ margin: 0, color: systemLoadColor, fontSize: '1.6rem' }}>{cpuLoad}%</h2>
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <HardDrive color="var(--accent-primary)" size={28} />
              <div>
                <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Memory Usage</p>
                <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.6rem' }}>{memoryDisplay} GB</h2>
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <Clock color="var(--accent-success)" size={28} />
              <div>
                <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Response Time</p>
                <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.6rem' }}>{responseTimeMs}ms</h2>
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <Server color="var(--accent-success)" size={28} />
              <div>
                <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Stability Score</p>
                <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.6rem' }}>{stabilityPct}%</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: '2rem' }}>

        {/* SELF-HEALING LOGS */}
        <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap color="var(--accent-success)" />
            <h3 style={{ margin: 0 }}>Self-Healing Logs</h3>
          </div>
          <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
            <div style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '1.5rem', marginLeft: '0.5rem' }}>
              {logs.map(log => (
                <div key={log.id} className="animate-fade-in" style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div style={{
                    position: 'absolute', left: '-1.85rem', top: '0.25rem',
                    width: '12px', height: '12px',
                    background: 'var(--accent-success)', border: '2px solid var(--bg-tertiary)', borderRadius: '50%'
                  }} />
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{log.time}</span>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {log.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI DECISIONS */}
        <div className="glass-panel" style={{ padding: '0' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck color="var(--accent-primary)" />
            <h3 style={{ margin: 0 }}>AI System Reasoning &amp; Mitigation Strategy</h3>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {decisions.map((d, i) => (
              <div key={i} style={{ background: d.bg, border: `1px solid ${d.border}`, padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ background: d.tagColor, color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em' }}>{d.tag}</span>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>{d.title}</h4>
                </div>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem', lineHeight: 1.65 }}>{d.body}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OmniGuard;
