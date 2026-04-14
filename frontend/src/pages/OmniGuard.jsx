import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, AlertTriangle, Cpu, HardDrive, Activity, Server, Clock, Zap, Info, Wifi } from 'lucide-react';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://auto-venture-website.onrender.com' 
  : 'http://localhost:5001';

const OmniGuard = () => {
  const [health, setHealth] = useState({ cpuUsage: '0.00', memoryUsage: '0.00', uptime: '0' });
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('Fetching...');
  const [avgLatency, setAvgLatency] = useState('—');

  const fetchAllData = useCallback(async () => {
    try {
      const [healthRes, alertsRes, logsRes, mlopsRes] = await Promise.all([
        fetch(`${API_BASE}/api/system-health`),
        fetch(`${API_BASE}/api/alerts`),
        fetch(`${API_BASE}/api/logs`),
        fetch(`${API_BASE}/api/mlops`) // Reuse mlops for avg latency
      ]);

      if (healthRes.ok) setHealth(await healthRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        // Filter for self-healing/retry/error keywords
        const filtered = (logsData.logs || []).filter(l => 
          l.message.toLowerCase().includes('retry') || 
          l.message.toLowerCase().includes('fallback') || 
          l.type === 'ERROR'
        ).slice(0, 5); // Max 5 logs
        setLogs(filtered);
      }

      if (mlopsRes.ok) {
        const mlopsData = await mlopsRes.json();
        setAvgLatency(mlopsData.avgLatency || '—');
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch OmniGuard APIs', err);
      setLastUpdated('Offline');
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Derive system status dot securely from alerts length
  const systemStatus = alerts.length > 5 
    ? { label: 'Critical Alert',    color: 'var(--accent-danger)',   dot: 'danger'  }
    : alerts.length > 0 
    ? { label: 'Elevated Warning',  color: 'var(--accent-warning)',  dot: 'warning' }
    : { label: 'All Systems Normal',color: 'var(--accent-success)',  dot: 'success' };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem' }}>
      
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
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
             <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Last Updated</p>
             <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{lastUpdated}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Active Alerts</p>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--accent-danger)', fontSize: '1.2rem' }}>{alerts.length}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '2rem', marginBottom: '2rem' }}>

        {/* SYSTEM HEALTH */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
            <Activity color="var(--accent-primary)" />
            <h3 style={{ margin: 0 }}>System Health & Performance</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', flex: 1 }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <Cpu color={parseFloat(health.cpuUsage) > 5 ? 'var(--accent-warning)' : 'var(--accent-success)'} size={28} />
              <div>
                <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>System CPU</p>
                <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.6rem' }}>{health.cpuUsage}%</h2>
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <HardDrive color="var(--accent-primary)" size={28} />
              <div>
                <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Heap Memory</p>
                <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.6rem' }}>{health.memoryUsage} MB</h2>
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <Clock color="var(--accent-success)" size={28} />
              <div>
                <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Process Uptime</p>
                <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.6rem' }}>{health.uptime}s</h2>
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <Wifi color="var(--accent-success)" size={28} />
              <div>
                <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Response Time</p>
                <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.6rem' }}>{avgLatency !== '—' ? `${avgLatency}ms` : '—'}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY ALERTS */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle color="var(--accent-warning)" />
            <h3 style={{ margin: 0 }}>Live Security Alerts</h3>
          </div>
          <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', maxHeight: '350px' }}>
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '2rem' }}>
                 No active alerts detected.
              </div>
            ) : (
              alerts.slice(0, 5).map((alert, idx) => (
                <div key={idx} className="animate-fade-in" style={{
                  display: 'flex', gap: '1rem', padding: '1rem',
                  background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                  marginBottom: '0.85rem',
                  borderLeft: `3px solid var(${alert.type === 'ERROR' ? '--accent-danger' : '--accent-warning'})`,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{alert.time}</span>
                    <p style={{ margin: 0, fontWeight: 500, fontSize: '0.88rem', lineHeight: 1.5 }}>{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '2rem' }}>
        {/* SELF-HEALING LOGS */}
        <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap color="var(--accent-success)" />
            <h3 style={{ margin: 0 }}>Self-Healing Logs</h3>
          </div>
          <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
            <div style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '1.5rem', marginLeft: '0.5rem' }}>
              {logs.length === 0 ? (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No intervention events recorded.</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="animate-fade-in" style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <div style={{
                      position: 'absolute', left: '-1.85rem', top: '0.25rem',
                      width: '12px', height: '12px',
                      background: log.type === 'ERROR' ? 'var(--accent-danger)' : 'var(--accent-success)', 
                      border: '2px solid var(--bg-tertiary)', borderRadius: '50%'
                    }} />
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', background: 'var(--bg-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      {log.type}
                    </span>
                    <p style={{ margin: '0.4rem 0 0 0', fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {log.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmniGuard;
