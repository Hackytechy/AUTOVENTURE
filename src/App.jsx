import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import InputAnalysis from './pages/InputAnalysis';
import Dashboard from './pages/Dashboard';
import OmniGuard from './pages/OmniGuard';
import SupplyChain from './pages/SupplyChain';
import MultiAgents from './pages/MultiAgents';
import Auth from './pages/Auth';
import Pricing from './pages/Pricing';
import AIControlPanel from './pages/AIControlPanel';
import ModelComparison from './pages/ModelComparison';
import { AppProvider } from './context/AppContext';

import './index.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-layout animate-fade-in">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analysis" element={<InputAnalysis />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/omniguard" element={<OmniGuard />} />
            <Route path="/supply-chain" element={<SupplyChain />} />
            <Route path="/agents" element={<MultiAgents />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/ai-control" element={<AIControlPanel />} />
            <Route path="/model-comparison" element={<ModelComparison />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      </Router>
    </AppProvider>
  );
}

export default App;
