import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

// Generate a per-user storage key so histories never cross between accounts
const historyKey = (email) => `nexus_history_${email}`;

export const AppProvider = ({ children }) => {
  const [user, setUser]                         = useState(null);
  const [history, setHistory]                   = useState([]);
  const [currentAnalysis, setCurrentAnalysis]   = useState(null);
  const [globalDemandMultiplier, setGlobalDemandMultiplier] = useState(1);
  const [multiAgentResult, setMultiAgentResult] = useState(() => {
    const saved = localStorage.getItem('nexus_multiagent');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist multiAgentResult to localStorage whenever it changes
  useEffect(() => {
    if (multiAgentResult) {
      localStorage.setItem('nexus_multiagent', JSON.stringify(multiAgentResult));
    } else {
      localStorage.removeItem('nexus_multiagent');
    }
  }, [multiAgentResult]);

  // ── On first mount: restore the logged-in user (not their history yet) ──
  useEffect(() => {
    const storedUser = localStorage.getItem('nexus_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      // Load that user's history immediately
      const stored = localStorage.getItem(historyKey(parsed.email));
      if (stored) setHistory(JSON.parse(stored));
    }
  }, []);

  // ── Login: restore THIS user's history, clear previous user's state ─────
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('nexus_user', JSON.stringify(userData));

    // Load history scoped to this specific user's email
    const stored = localStorage.getItem(historyKey(userData.email));
    setHistory(stored ? JSON.parse(stored) : []);
    setCurrentAnalysis(null);
  };

  // ── Logout: wipe in-memory state but keep histories on disk ─────────────
  const logout = () => {
    setUser(null);
    setHistory([]);
    setCurrentAnalysis(null);
    setGlobalDemandMultiplier(1);
    setMultiAgentResult(null);
    localStorage.removeItem('nexus_user');
    // Do NOT remove the history key — user's data stays for next login
  };

  // ── Add an analysis to this user's history ───────────────────────────────
  const addAnalysisToHistory = (analysis) => {
    if (!user) return; // must be logged in
    const updated = [analysis, ...history];
    setHistory(updated);
    localStorage.setItem(historyKey(user.email), JSON.stringify(updated));
  };

  // ── Delete a single chat/analysis entry ──────────────────────────────────
  const deleteAnalysis = (id) => {
    if (!user) return;
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem(historyKey(user.email), JSON.stringify(updated));
    // If the deleted entry was the active one, clear it
    if (currentAnalysis?.id === id) setCurrentAnalysis(null);
  };

  // ── Clear ALL history for the logged-in user ─────────────────────────────
  const clearAllHistory = () => {
    if (!user) return;
    setHistory([]);
    localStorage.removeItem(historyKey(user.email));
    setCurrentAnalysis(null);
  };

  // ── Load a specific analysis from history into view ──────────────────────
  const loadAnalysis = (id) => {
    const found = history.find(h => h.id === id);
    if (found) setCurrentAnalysis(found);
  };

  return (
    <AppContext.Provider value={{
      user,
      login,
      logout,
      history,
      addAnalysisToHistory,
      deleteAnalysis,
      clearAllHistory,
      currentAnalysis,
      setCurrentAnalysis,
      loadAnalysis,
      globalDemandMultiplier,
      setGlobalDemandMultiplier,
      multiAgentResult,
      setMultiAgentResult,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
