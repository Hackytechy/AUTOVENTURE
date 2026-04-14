import { useState, useEffect, useCallback } from 'react';
import {
  Brain, Cpu, Activity, CheckCircle, XCircle, Clock,
  Zap, Database, AlertTriangle, RefreshCw, Info,
  TrendingUp, Server, Wifi, BarChart3
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://auto-venture-website.onrender.com"
    : "http://localhost:5001";

// ── Tooltip component ────────────────────────────────────────────────────────
const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
          transform: 'translateX(-50%)', background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)', borderRadius: '8px',
          padding: '0.5rem 0.85rem', fontSize: '0.75rem', color: 'var(--text-secondary)',
          whiteSpace: 'nowrap', zIndex: 100, boxShadow: 'var(--shadow-md)',
          animation: 'aicp-fadeIn 0.15s ease',
        }}>
          {text}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0, borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent', borderTop: '5px solid var(--border-color)',
          }} />
        </div>
      )}
    </div>
  );
};

// ── Animated health dot ──────────────────────────────────────────────────────
const HealthDot = ({ status }) => {
  const colors = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444', grey: '#6b7280' };
  const color = colors[status] || colors.grey;
  return (
    <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
      {status !== 'grey' && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4,
          animation: 'pulse 2s infinite',
        }} />
      )}
    </div>
  );
};

// ── Confidence bar ──────────────────────────────────────────────────────────
const ConfidenceBar = ({ value }) => {
  const color = value >= 75 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
  const status = value >= 75 ? 'green' : value >= 50 ? 'yellow' : 'red';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Confidence</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <HealthDot status={status} />
          <span style={{ fontWeight: 700, color, fontSize: '1rem' }}>{value}/100</span>
        </div>
      </div>
      <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value}%`, background: color,
          borderRadius: '99px', transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
};

// ── Metric card ─────────────────────────────────────────────────────────────
const MetricCard = ({ icon, label, value, sub, health, tooltip, accent }) => (
  <div style={{
    background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
    padding: '1.1rem 1.25rem', border: '1px solid var(--border-color)',
    display: 'flex', flexDirection: 'column', gap: '0.4rem',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
        {icon}
        <span>{label}</span>
        {tooltip && (
          <Tooltip text={tooltip}>
            <Info size={11} color="var(--text-tertiary)" style={{ cursor: 'help' }} />
          </Tooltip>
        )}
      </div>
      {health && <HealthDot status={health} />}
    </div>
    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: accent || 'var(--text-primary)', lineHeight: 1.2 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{sub}</div>}
  </div>
);

// ── Latency badge color ──────────────────────────────────────────────────────
const latencyHealth = (ms) => {
  if (!ms) return 'grey';
  if (ms < 1200) return 'green';
  if (ms < 3000) return 'yellow';
  return 'red';
};
const latencyColor = (ms) => {
  if (!ms) return 'var(--text-tertiary)';
  if (ms < 1200) return '#10b981';
  if (ms < 3000) return '#f59e0b';
  return '#ef4444';
};

// ════════════════════════════════════════════════════════════════════════════
const AIControlPanel = () => {
  const { currentAnalysis } = useAppContext();

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [apiOnline, setApiOnline] = useState(null);  // null=checking, true/false
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  // ── Pull logs + stats from backend ──────────────────────────────────────
  const fetchMLOpsData = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, healthRes] = await Promise.all([
        fetch(`${API_BASE}/api/logs`),
        fetch(`${API_BASE}/health`),
      ]);
      const logsJson = await logsRes.json();
      const healthJson = await healthRes.json();
      const llmOnly = (logsJson.logs || []).filter(l => l.source === 'AI_ENGINE');
      setLogs(llmOnly);
      setApiOnline(healthJson.status === 'OK');
    } catch {
      setApiOnline(false);
    } finally {
      setLoading(false);
      setLastFetch(new Date().toLocaleTimeString());
    }
  }, []);

  // Fetch on mount and whenever a new analysis is run, plus auto refresh every 5s
  useEffect(() => {
    fetchMLOpsData();
    const interval = setInterval(fetchMLOpsData, 5000);
    return () => clearInterval(interval);
  }, [fetchMLOpsData, currentAnalysis]);

  // ── Derive MLOps values from currentAnalysis ─────────────────────────────
  const meta = currentAnalysis?.metadata || {};
  const metrics = currentAnalysis?.metrics || {};
  const engineUsed = meta.engineUsed || '—';
  const modelName = meta.modelName || '—';
  const promptVer = meta.promptVersion || '—';
  const latencyMs = meta.latencyMs || null;
  const confidence = metrics.confidenceScore ?? null;
  const filledFields = meta.filledFields || [];
  const isSimulated = currentAnalysis?.isSimulated ?? null;
  const timestamp = currentAnalysis?.timestamp || '—';

  const validationStatus = filledFields.length === 0
    ? 'All fields valid'
    : `Auto-filled: ${filledFields.join(', ')}`;
  const validationHealth = filledFields.length === 0 ? 'green' : filledFields.length <= 2 ? 'yellow' : 'red';

  const engineHealth = !currentAnalysis ? 'grey'
    : isSimulated ? 'yellow' : 'green';

  // ── DevOps stats ─────────────────────────────────────────────────────────
  const totalReqs = logs.length;
  const avgLatencyRaw = totalReqs > 0 ? logs.reduce((sum, log) => sum + (log.latencyMs || 0), 0) / logs.length : 0;
  const avgLatency = totalReqs > 0 ? Math.round(avgLatencyRaw) : null;
  const errorCount = logs.filter(log => log.success === false).length;
  const errorRate = totalReqs > 0 ? `${((errorCount / totalReqs) * 100).toFixed(1)}%` : '0%';
  const successRate = totalReqs > 0 ? `${(100 - (errorCount / totalReqs) * 100).toFixed(1)}%` : '100%';
  const breakdown = {
    gemini: logs.filter(l => (l.model || '').toLowerCase().includes('gemini') || (l.model || '').toLowerCase().includes('gpt')).length,
    groq: logs.filter(l => (l.model || '').toLowerCase().includes('llama')).length,
    simulation: logs.filter(l => (l.model || '').toLowerCase().includes('sim')).length
  };

  return (
    <div style={{ width: '100%', minWidth: 0 }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.4rem 0', fontSize: '1.9rem', fontWeight: 800 }}>
            AI System Control Panel
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time MLOps monitoring, LLM telemetry, and DevOps health — updated after every analysis.
          </p>
        </div>
        <button
          onClick={fetchMLOpsData}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
            color: 'var(--text-primary)', borderRadius: 'var(--radius-md)',
            padding: '0.6rem 1rem', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Refreshing…' : 'Refresh'}
          {lastFetch && <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>· {lastFetch}</span>}
        </button>
      </div>

      {/* ── API offline banner ── */}
      {apiOnline === false && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', color: 'var(--accent-danger)', fontSize: '0.87rem' }}>
          <XCircle size={16} />
          Backend API is unreachable at {API_BASE}. Make sure the server is running.
        </div>
      )}

      {/* ── No analysis banner ── */}
      {!currentAnalysis && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', color: 'var(--accent-warning)', fontSize: '0.87rem' }}>
          <AlertTriangle size={16} />
          Run an analysis first (Input Analysis page) to populate MLOps data with live results.
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          SECTION 1 — MLOps Panel
      ════════════════════════════════════════════════════════════ */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <Brain size={20} color="var(--accent-primary)" />
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>MLOps Panel</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-tertiary)', background: 'var(--bg-primary)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            Prompt {promptVer}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          <MetricCard
            icon={<Cpu size={13} />}
            label="Model Used"
            value={engineUsed === '—' ? 'No analysis yet' : engineUsed.split('(')[0].trim()}
            sub={modelName !== '—' ? modelName : undefined}
            health={engineHealth}
            tooltip="The AI engine that generated your last analysis result"
            accent={isSimulated === false ? '#10b981' : isSimulated === true ? '#f59e0b' : undefined}
          />
          <MetricCard
            icon={<Zap size={13} />}
            label="Prompt Version"
            value={promptVer}
            sub="Active schema version"
            health={promptVer !== '—' ? 'green' : 'grey'}
            tooltip="Version of the prompt template sent to the LLM — controls output structure"
          />
          <MetricCard
            icon={<Clock size={13} />}
            label="Last Run"
            value={timestamp}
            sub="Analysis timestamp"
            health={currentAnalysis ? 'green' : 'grey'}
            tooltip="Time of the most recent analysis request"
          />
          <MetricCard
            icon={<Activity size={13} />}
            label="Response Latency"
            value={latencyMs ? `${latencyMs}ms` : '—'}
            sub={latencyMs ? (latencyMs < 1200 ? 'Fast response' : latencyMs < 3000 ? 'Moderate' : 'Slow — check API') : 'No data yet'}
            health={latencyMs ? latencyHealth(latencyMs) : 'grey'}
            tooltip="Time taken by the AI engine to return a complete response"
            accent={latencyMs ? latencyColor(latencyMs) : undefined}
          />
          <MetricCard
            icon={<CheckCircle size={13} />}
            label="Validation Status"
            value={currentAnalysis ? (filledFields.length === 0 ? 'All valid ✓' : `${filledFields.length} auto-filled`) : '—'}
            sub={filledFields.length > 0 ? filledFields.join(', ') : 'No missing fields detected'}
            health={currentAnalysis ? validationHealth : 'grey'}
            tooltip="Output validation result — auto-fills any missing fields from the AI response using Smart Simulation"
          />
          <MetricCard
            icon={<Server size={13} />}
            label="Engine Type"
            value={isSimulated === false ? 'Live AI' : isSimulated === true ? 'Simulation' : '—'}
            sub={isSimulated === false ? 'Real LLM output' : isSimulated === true ? 'Rule-based fallback' : 'Run analysis first'}
            health={isSimulated === false ? 'green' : isSimulated === true ? 'yellow' : 'grey'}
            tooltip="Whether the result came from a live AI model (Gemini/Groq) or the smart simulation fallback"
            accent={isSimulated === false ? '#10b981' : isSimulated === true ? '#f59e0b' : undefined}
          />
        </div>

        {/* Confidence bar */}
        {confidence !== null ? (
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CONFIDENCE SCORE</span>
              <Tooltip text="Measures reliability of AI output — based on budget stability, risk level, and value consistency">
                <Info size={11} color="var(--text-tertiary)" style={{ cursor: 'help' }} />
              </Tooltip>
            </div>
            <ConfidenceBar value={confidence} />
            <p style={{ margin: '0.6rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              {confidence >= 75 ? '✅ High confidence — output is consistent and reliable for decision-making.'
                : confidence >= 50 ? '⚠️ Moderate confidence — values are plausible but verify key projections.'
                  : '🔴 Low confidence — consider running with a larger budget input or a different industry.'}
            </p>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', border: '1px dashed var(--border-color)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>
            Confidence score will appear here after your first analysis
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — LLM Logs Viewer
      ════════════════════════════════════════════════════════════ */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <Database size={20} color="var(--accent-secondary)" />
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>LLM Request Logs</h2>
          <Tooltip text="Live log of every AI analysis request — fetched from /api/logs">
            <Info size={13} color="var(--text-tertiary)" style={{ cursor: 'help', marginLeft: '0.3rem' }} />
          </Tooltip>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HealthDot status={apiOnline ? 'green' : apiOnline === false ? 'red' : 'grey'} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              {apiOnline ? 'API connected' : apiOnline === false ? 'API offline' : 'Checking…'}
            </span>
          </div>
        </div>

        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            {apiOnline === false ? '⚠️ Cannot connect to backend API' : 'No requests logged yet — run an analysis to start logging'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Status', 'Model', 'Latency', 'Time'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.7rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <HealthDot status={log.success ? 'green' : 'red'} />
                        <span style={{ color: log.success ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                          {log.success ? 'OK' : 'FAIL'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.7rem 0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {log.model || '—'}
                    </td>
                    <td style={{ padding: '0.7rem 0.75rem' }}>
                      <span style={{ color: latencyColor(log.latencyMs), fontWeight: 600 }}>
                        {log.latencyMs ? `${log.latencyMs}ms` : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '0.7rem 0.75rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 - DevOps Monitoring Panel
      ════════════════════════════════════════════════════════════ */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <BarChart3 size={20} color="var(--accent-success)" />
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>DevOps Monitoring</h2>
          <Tooltip text="Aggregate statistics across all AI engine calls since server started">
            <Info size={13} color="var(--text-tertiary)" style={{ cursor: 'help', marginLeft: '0.3rem' }} />
          </Tooltip>
        </div>

        {/* Top metrics row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <MetricCard
            icon={<Wifi size={13} />}
            label="API Status"
            value={apiOnline === null ? 'Checking…' : apiOnline ? 'Active' : 'Offline'}
            sub={apiOnline ? `${API_BASE}` : 'Server not reachable'}
            health={apiOnline === null ? 'grey' : apiOnline ? 'green' : 'red'}
            tooltip="Connection status of the NexusAI backend server"
            accent={apiOnline ? '#10b981' : '#ef4444'}
          />
          <MetricCard
            icon={<TrendingUp size={13} />}
            label="Total Requests"
            value={totalReqs || '0'}
            sub="Since server start"
            health={totalReqs > 0 ? 'green' : 'grey'}
            tooltip="Total number of analysis requests received by the backend since last restart"
          />
          <MetricCard
            icon={<Clock size={13} />}
            label="Avg Latency"
            value={avgLatency ? `${avgLatency}ms` : '—'}
            sub={avgLatency ? (avgLatency < 1200 ? 'Excellent' : avgLatency < 2500 ? 'Good' : 'Needs attention') : 'No data yet'}
            health={avgLatency ? latencyHealth(avgLatency) : 'grey'}
            tooltip="Average response time across all AI engine calls — includes Gemini, Groq, and simulation"
            accent={avgLatency ? latencyColor(avgLatency) : undefined}
          />
          <MetricCard
            icon={<AlertTriangle size={13} />}
            label="Error Rate"
            value={errorRate}
            sub={`${successRate} success rate`}
            health={parseFloat(errorRate) < 5 ? 'green' : parseFloat(errorRate) < 20 ? 'yellow' : 'red'}
            tooltip="Percentage of analysis requests that failed (API errors, invalid JSON, quota exceeded)"
            accent={parseFloat(errorRate) < 5 ? '#10b981' : parseFloat(errorRate) < 20 ? '#f59e0b' : '#ef4444'}
          />
        </div>

        {/* Engine breakdown */}
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Engine Breakdown</span>
            <Tooltip text="How many requests were handled by each AI engine tier">
              <Info size={11} color="var(--text-tertiary)" style={{ cursor: 'help' }} />
            </Tooltip>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { label: 'Gemini AI', count: breakdown.gemini, color: '#6366f1', icon: '🔵', tooltip: 'Primary AI — Google Gemini 2.0 Flash Lite' },
              { label: 'Groq (Llama 3)', count: breakdown.groq, color: '#f59e0b', icon: '🟡', tooltip: 'Fallback AI — Llama 3 70B via Groq API' },
              { label: 'Smart Simulation', count: breakdown.simulation, color: '#10b981', icon: '🟠', tooltip: 'Rule-based fallback when both AI keys are unavailable/quota exceeded' },
            ].map(e => {
              const pct = totalReqs > 0 ? Math.round((e.count / totalReqs) * 100) : 0;
              return (
                <div key={e.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>{e.icon}</span>
                      <Tooltip text={e.tooltip}><span style={{ cursor: 'help' }}>{e.label}</span></Tooltip>
                    </div>
                    <span style={{ fontWeight: 700, color: e.color, fontSize: '0.88rem' }}>{e.count} <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: '5px', background: 'var(--bg-primary)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: e.color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes aicp-pulse { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(2.2);opacity:0} }
        @keyframes aicp-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes aicp-fadeIn{ from{opacity:0;transform:translateX(-50%) translateY(4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      `}</style>
    </div>
  );
};

export default AIControlPanel;
