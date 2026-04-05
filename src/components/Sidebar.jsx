import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Lightbulb, BarChart2, ShieldCheck, Truck,
  Network, CreditCard, User, History, LogOut, Trash2, X, LayoutDashboard, Layers
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, history, loadAnalysis, deleteAnalysis, clearAllHistory, logout, currentAnalysis } = useAppContext();
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const navItems = [
    { name: 'Overview',          path: '/',            icon: <Home size={20} />             },
    { name: 'Input Analysis',    path: '/analysis',    icon: <Lightbulb size={20} />        },
    { name: 'Dashboard',         path: '/dashboard',   icon: <BarChart2 size={20} />        },
    { name: 'OmniGuard',         path: '/omniguard',   icon: <ShieldCheck size={20} />      },
    { name: 'Supply Chain',      path: '/supply-chain',icon: <Truck size={20} />            },
    { name: 'Multi-Agents',      path: '/agents',      icon: <Network size={20} />          },
    { name: 'Pricing',           path: '/pricing',     icon: <CreditCard size={20} />       },
    { name: 'AI Control Panel',  path: '/ai-control',  icon: <LayoutDashboard size={20} />  },
  ];

  if (currentAnalysis?.isComparison) {
    navItems.push({ name: 'Model Comparison', path: '/model-comparison', icon: <Layers size={20} /> });
  }

  const handleDelete = (e, id) => {
    e.stopPropagation(); // don't trigger loadAnalysis
    deleteAnalysis(id);
  };

  const handleClearAll = () => {
    if (confirmClearAll) {
      clearAllHistory();
      setConfirmClearAll(false);
    } else {
      setConfirmClearAll(true);
      setTimeout(() => setConfirmClearAll(false), 3000); // auto-cancel
    }
  };

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <Network color="var(--accent-primary)" size={28} />
        <span className="logo-text">NexusAI</span>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

        {/* ── Per-user history panel ── */}
        {user && history.length > 0 && (
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', marginBottom: '0.25rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.85rem', borderBottom: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <History size={12} /> Recent Analyses
              </p>
              <button
                onClick={handleClearAll}
                title={confirmClearAll ? 'Click again to confirm' : 'Clear all history'}
                style={{
                  background: confirmClearAll ? 'rgba(239,68,68,0.15)' : 'transparent',
                  border: confirmClearAll ? '1px solid rgba(239,68,68,0.4)' : '1px solid transparent',
                  color: confirmClearAll ? 'var(--accent-danger)' : 'var(--text-tertiary)',
                  borderRadius: '4px',
                  padding: '0.2rem 0.4rem',
                  cursor: 'pointer',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                {confirmClearAll ? <><X size={10}/> Confirm</> : <><Trash2 size={10}/> Clear All</>}
              </button>
            </div>

            {/* History items */}
            <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
              {history.slice(0, 8).map((h) => (
                <div
                  key={h.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Load button */}
                  <button
                    onClick={() => { loadAnalysis(h.id); navigate('/dashboard'); }}
                    style={{
                      flex: 1,
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      padding: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.4,
                    }}
                    title={h.inputs?.idea || `Analysis — ${h.timestamp}`}
                  >
                    {h.inputs?.idea
                      ? h.inputs.idea.length > 22 ? h.inputs.idea.substring(0, 22) + '…' : h.inputs.idea
                      : `Analysis — ${h.timestamp}`}
                  </button>

                  {/* Timestamp */}
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                    {h.timestamp}
                  </span>

                  {/* Delete single item */}
                  <button
                    onClick={(e) => handleDelete(e, h.id)}
                    title="Delete this analysis"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      padding: '0.15rem',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-danger)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── User profile / logout ── */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {/* Avatar */}
            <div style={{ width: '30px', height: '30px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            {/* Name + email */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
            {/* Logout button — ONLY this triggers logout */}
            <button
              onClick={() => { logout(); navigate('/auth'); }}
              title="Log out"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0.3rem', borderRadius: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.15s', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-danger)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <NavLink
            to="/auth"
            className={`nav-link ${location.pathname === '/auth' ? 'active' : ''}`}
          >
            <User size={20} />
            <span>Login / Account</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
