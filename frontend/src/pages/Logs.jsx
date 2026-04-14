import { useState, useEffect, useRef } from 'react';
import { Terminal, Search, Trash2, StopCircle, PlayCircle, Download, Filter } from 'lucide-react';

const API_BASE = process.env.NODE_ENV === "production" ? "https://auto-venture-website.onrender.com" : "http://localhost:5001";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const fetchLogs = async () => {
    if (isPaused) return;
    try {
      const res = await fetch(`${API_BASE}/api/logs`);
      const data = await res.json();
      if (data.success && data.logs) {
         setLogs(data.logs);
      }
    } catch(err) {
      console.error('Log fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000); // 2 second auto-refresh
    return () => clearInterval(interval);
  }, [isPaused]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter(l => {
    const textMatch = (l.message || l.msg || '').toLowerCase().includes(filterText.toLowerCase()) || 
                      (l.type || '').toLowerCase().includes(filterText.toLowerCase()) ||
                      (l.source || l.service || '').toLowerCase().includes(filterText.toLowerCase());
    const statusMatch = statusFilter === 'ALL' ? true : 
                        statusFilter === 'SUCCESS' ? l.type === 'INFO' : 
                        l.type === 'ERROR';
    return textMatch && statusMatch;
  });

  return (
    <div className="logs-page animate-fade-in" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1rem' }}>
      
      {/* Header section */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
            <Terminal color="var(--accent-primary)" /> System Logs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
            Live diagnostic stream from NexusAI infrastructure
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setIsPaused(!isPaused)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {isPaused ? <PlayCircle size={16} /> : <StopCircle size={16} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button onClick={() => setLogs([])} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-danger)' }}>
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
         <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Filter logs by message, service or level..." 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <Filter size={14} color="var(--text-tertiary)" />
            <select 
               value={statusFilter} 
               onChange={(e) => setStatusFilter(e.target.value)}
               style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
            >
               <option value="ALL">All Logs</option>
               <option value="SUCCESS">Success Only</option>
               <option value="ERROR">Errors Only</option>
            </select>
         </div>
         <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', background: 'var(--bg-primary)', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            {filteredLogs.length} Entries Shown
         </div>
      </div>

      {/* Terminal Display */}
      <section 
        ref={scrollRef}
        style={{ 
          flex: 1, 
          background: '#0a0a0a', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-color)', 
          padding: '1.25rem', 
          overflowY: 'auto',
          fontFamily: "'Fira Code', monospace",
          fontSize: '0.85rem',
          lineHeight: 1.6
        }}
      >
        {loading && logs.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            Loading logs from backend stream...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            No logs yet. Try running an AI analysis to see requests flow in.
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={`${log.timestamp}-${idx}`} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #222', padding: '0.4rem 0' }}>
              <span style={{ color: '#666', flexShrink: 0 }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span style={{ 
                color: log.type === 'ERROR' ? '#ff5555' : 
                       log.type === 'WARN' ? '#ffb86c' : 
                       log.type === 'MLOPS' ? '#8be9fd' : '#50fa7b',
                fontWeight: 600,
                width: '60px',
                flexShrink: 0
              }}>
                {log.type}
              </span>
              <span style={{ color: '#ff79c6', fontWeight: 500, flexShrink: 0 }}>[{log.source || log.service}]</span>
              <span style={{ color: '#f8f8f2' }}>{log.message || log.msg}</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default Logs;
