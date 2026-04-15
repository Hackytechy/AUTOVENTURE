import { useState, useEffect } from 'react';
import {
   GitBranch, Server, Settings, CheckCircle, Clock,
   AlertTriangle, RefreshCw, Layers, Shield, Cpu, ExternalLink
} from 'lucide-react';


const API_BASE =
   process.env.NODE_ENV === "production"
      ? "https://autoventure.onrender.com"
      : "http://localhost:5001";


const CICD = () => {
   const [pipelines, setPipelines] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [lastUpdated, setLastUpdated] = useState('');

   const fetchPipelines = async () => {
      try {
         const res = await fetch(`${API_BASE}/api/github-actions`);
         if (!res.ok) throw new Error('API request failed');
         const data = await res.json();
         setPipelines(data.runs || []);
         setError(null);
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
         setLastUpdated(new Date().toLocaleTimeString());
      }
   };

   useEffect(() => {
      fetchPipelines();
      const interval = setInterval(fetchPipelines, 10000);
      return () => clearInterval(interval);
   }, []);

   const totalRuns = pipelines.length;
   const successRuns = pipelines.filter(p => p.conclusion === 'success').length;
   const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) + '%' : 'N/A';
   const lastDeployment = totalRuns > 0 ? new Date(pipelines[0].created_at).toLocaleString() : 'N/A';

   return (
      <div className="cicd-page animate-fade-in" style={{ padding: '2rem' }}>

         {/* Header */}
         <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
               <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0, fontSize: '2.2rem' }}>
                  <GitBranch color="var(--accent-primary)" size={34} /> CI/CD Pipeline
               </h1>
               <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                  Automated DevOps & Model Orchestration Dashboard
               </p>
            </div>

            <button
               onClick={fetchPipelines}
               disabled={loading}
               className="btn btn-primary"
               style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem', opacity: loading ? 0.7 : 1 }}
            >
               {loading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
               {loading ? 'Syncing...' : 'Force Sync'}
            </button>
         </header>

         {/* Top row: Metrics */}
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
               <Layers color="var(--accent-primary)" size={40} />
               <div>
                  <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Total Runs</p>
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{loading && totalRuns === 0 ? '-' : totalRuns}</h3>
               </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
               <CheckCircle color="#50fa7b" size={40} />
               <div>
                  <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Success Rate</p>
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{loading && totalRuns === 0 ? '-' : successRate}</h3>
               </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
               <Clock color="#bd93f9" size={40} />
               <div>
                  <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Last Deployment</p>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{loading && totalRuns === 0 ? '-' : lastDeployment}</h3>
               </div>
            </div>
         </div>

         {/* Main Table */}
         <section style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h2 style={{ fontSize: '1.1rem', margin: 0 }}>GitHub Actions Workflows</h2>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                  {loading ? <RefreshCw size={14} className="animate-spin" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> : null}
                  Last updated: {lastUpdated} (Auto-refresh 10s)
               </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
               {error ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--accent-danger)' }}>
                     <AlertTriangle size={32} style={{ margin: '0 auto 1rem' }} />
                     <p>Failed to load true GitHub Actions data: {error}</p>
                  </div>
               ) : pipelines.length === 0 && loading ? (
                  <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                     <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-primary)' }} />
                     <p>Fetching active deployment pipelines...</p>
                  </div>
               ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                     <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                           <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Workflow Name</th>
                           <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Pipeline Status</th>
                           <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Latest Build Time</th>
                           <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Deployment Duration</th>
                        </tr>
                     </thead>
                     <tbody style={{ fontSize: '0.9rem' }}>
                        {pipelines.map((p, idx) => {
                           const isSuccess = p.conclusion === 'success';
                           const isFailure = p.conclusion === 'failure';
                           const isRunning = p.status === 'in_progress' || p.status === 'queued';

                           const bgColor = isSuccess ? 'rgba(80,250,123,0.1)' : isFailure ? 'rgba(255,85,85,0.1)' : 'rgba(255,184,108,0.1)';
                           const fgColor = isSuccess ? '#50fa7b' : isFailure ? '#ff5555' : '#ffb86c';
                           const bdColor = isSuccess ? 'rgba(80,250,123,0.3)' : isFailure ? 'rgba(255,85,85,0.3)' : 'rgba(255,184,108,0.3)';
                           const Icon = isSuccess ? CheckCircle : isFailure ? AlertTriangle : RefreshCw;

                           return (
                              <tr key={idx} className="hover-row" style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                 <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500 }}>{p.name}</td>
                                 <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span style={{
                                       display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.6rem',
                                       borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600,
                                       background: bgColor, color: fgColor, border: `1px solid ${bdColor}`
                                    }}>
                                       <Icon size={12} className={isRunning ? "animate-spin" : ""} />
                                       {isRunning ? "Running" : isSuccess ? "Success" : "Failed"}
                                    </span>
                                 </td>
                                 <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                    {new Date(p.created_at).toLocaleString()}
                                 </td>
                                 <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-primary)' }}>{p.duration}</td>
                              </tr>
                           )
                        })}
                     </tbody>
                  </table>
               )}
            </div>
         </section>
      </div>
   );
};

export default CICD;
