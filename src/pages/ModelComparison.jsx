import { useState } from 'react';
import { 
  Zap, Brain, Clock, BarChart3, TrendingUp, 
  ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2,
  Cpu, MousePointer2, Info, Activity, Layers
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const ModelComparison = () => {
  const { currentAnalysis, setCurrentAnalysis, addAnalysisToHistory } = useAppContext();
  const navigate = useNavigate();

  // If no comparison data, redirect or show empty state
  if (!currentAnalysis || !currentAnalysis.isComparison) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <Brain size={48} color="var(--text-tertiary)" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ marginBottom: '1rem' }}>No Comparison Data Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Run an analysis with "Compare Model Usage" enabled to see architecture-level benchmarks.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/analysis')}>
           Go to Analysis
        </button>
      </div>
    );
  }

  const { llmResult, xgboostResult, lstmResult, latencyComparison, scoreDifference, inputs } = currentAnalysis;

  // Comparison Data for Charts
  const performanceData = [
    { name: 'LLM (GenAI)', latency: llmResult.latency, color: '#10b981' },
    { name: 'XGBoost (ML)',  latency: xgboostResult.latency, color: '#f59e0b' },
    { name: 'LSTM (RNN)',    latency: lstmResult.latency, color: '#6366f1' },
  ];

  const scoreData = [
    { 
      metric: 'Success Score', 
      llm: llmResult.metrics.successScore, 
      xgboost: xgboostResult.metrics.successScore,
      lstm: lstmResult.metrics.successScore
    },
    { 
      metric: 'Growth Score', 
      llm: (parseFloat(llmResult.metrics.growthScore) * 10).toFixed(0), 
      xgboost: (parseFloat(xgboostResult.metrics.growthScore) * 10).toFixed(0),
      lstm: (parseFloat(lstmResult.metrics.growthScore) * 10).toFixed(0)
    },
  ];

  const handleSelectModel = (model) => {
    let selected;
    if (model === 'llm') selected = llmResult;
    else if (model === 'xgboost') selected = xgboostResult;
    else selected = lstmResult;

    // Create a new regular analysis object from the selected model
    const unifiedAnalysis = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      inputs: currentAnalysis.inputs,
      metrics: selected.metrics,
      isSimulated: model !== 'llm',
      metadata: {
        engineUsed: selected.name,
        modelName: selected.type,
        promptVersion: currentAnalysis.metadata.promptVersion,
        latencyMs: selected.latency,
        confidenceScore: selected.confidenceScore || selected.metrics.confidenceScore
      }
    };
    
    setCurrentAnalysis(unifiedAnalysis);
    addAnalysisToHistory(unifiedAnalysis);
    navigate('/dashboard');
  };

  const getWinnerLabel = (winner) => {
    if (winner === 'llm') return 'LLM (Generative)';
    if (winner === 'xgboost') return 'XGBoost (ML)';
    return 'LSTM (RNN)';
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
            <Layers size={18} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Architectural Comparison Mode</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>AI Strategy Benchmark</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Comparing Generative LLMs vs. Gradient Boosting vs. Recurrent Networks for your venture.</p>
        </div>
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
           <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Processing Efficiency</p>
           <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{currentAnalysis.metadata.totalLatencyMs}ms Total</h3>
        </div>
      </div>

      {/* BENCHMARK OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Latency Chart */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--accent-primary)" />
              Inference Speed (ms)
            </h3>
            <div style={{ background: 'var(--accent-success)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
              Fastest: {getWinnerLabel(latencyComparison.winner)}
            </div>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} layout="vertical" margin={{ left: 40, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={12} width={120} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }}
                />
                <Bar dataKey="latency" radius={[0, 4, 4, 0]} barSize={40}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Comparison */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <BarChart3 size={20} color="var(--accent-secondary)" />
            Variance Analysis
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Max Success Delta</span>
                 <span style={{ fontWeight: 700, color: 'var(--accent-warning)' }}>±{scoreDifference.successScore}%</span>
               </div>
               <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                 <div style={{ width: `${Math.min(100, (scoreDifference.successScore * 2))}%`, background: 'var(--accent-warning)', height: '100%' }} />
               </div>
             </div>
             <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Growth Index Drift</span>
                 <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>±{scoreDifference.growthScore}</span>
               </div>
               <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                 <div style={{ width: `${Math.min(100, (scoreDifference.growthScore * 10))}%`, background: 'var(--accent-primary)', height: '100%' }} />
               </div>
             </div>
          </div>
          <div style={{ marginTop: '2.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
             <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Activity size={14} color="var(--accent-success)" />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Architecture Insight:</span>
             </div>
             LLMs capture semantic nuance while XGBoost focuses on tabular feature weighting. LSTM identifies sequential dependencies in your market field.
          </div>
        </div>

      </div>

      {/* 3-WAY CARD VIEW */}
      <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem' }}>Deep Architecture Breakdown</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        
        {/* LLM CARD */}
        <div className="glass-panel" style={{ 
          padding: '2rem', 
          border: '1px solid var(--border-color)',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>
              <Brain color="#10b981" size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>LLM</h3>
              <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Transformer Architecture</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
             <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Success</span>
                <h4 style={{ margin: '0.1rem 0 0 0', color: 'var(--accent-success)', fontSize: '1.4rem' }}>{llmResult.metrics.successScore}%</h4>
             </div>
             <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Confidence</span>
                <h4 style={{ margin: '0.1rem 0 0 0', color: 'var(--accent-primary)', fontSize: '1.4rem' }}>{llmResult.metrics.confidenceScore}%</h4>
             </div>
          </div>

          <div style={{ flex: 1, marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Strategic View</h4>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-secondary)', minHeight: '140px' }}>
              <p style={{ margin: 0 }}>{llmResult.metrics.explanation?.successScoreReason || llmResult.metrics.explanation?.whySuccessScore}</p>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}
            onClick={() => handleSelectModel('llm')}
          >
            <CheckCircle2 size={16} />
            Use Generative View
          </button>
        </div>

        {/* XGBOOST CARD */}
        <div className="glass-panel" style={{ 
          padding: '2rem', 
          border: '1px solid var(--border-color)',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>
              <Zap color="#f59e0b" size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>XGBoost</h3>
              <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Gradient Boosting (ML)</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
             <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Success</span>
                <h4 style={{ margin: '0.1rem 0 0 0', color: 'var(--accent-success)', fontSize: '1.4rem' }}>{xgboostResult.metrics.successScore}%</h4>
             </div>
             <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Confidence</span>
                <h4 style={{ margin: '0.1rem 0 0 0', color: 'var(--accent-primary)', fontSize: '1.4rem' }}>{xgboostResult.confidenceScore}%</h4>
             </div>
          </div>

          <div style={{ flex: 1, marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Tabular Insight</h4>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-secondary)', minHeight: '140px' }}>
              <p style={{ margin: 0 }}>{xgboostResult.metrics.explanation?.whySuccessScore}</p>
            </div>
          </div>

          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', border: '1px solid var(--accent-warning)', background: 'transparent', color: 'var(--accent-warning)' }}
            onClick={() => handleSelectModel('xgboost')}
          >
            <CheckCircle2 size={16} />
            Use Tabular Mode
          </button>
        </div>

        {/* LSTM CARD */}
        <div className="glass-panel" style={{ 
          padding: '2rem', 
          border: '1px solid var(--border-color)',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>
              <TrendingUp color="#6366f1" size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>LSTM</h3>
              <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Recurrent Neural Network</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
             <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Success</span>
                <h4 style={{ margin: '0.1rem 0 0 0', color: 'var(--accent-success)', fontSize: '1.4rem' }}>{lstmResult.metrics.successScore}%</h4>
             </div>
             <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Confidence</span>
                <h4 style={{ margin: '0.1rem 0 0 0', color: 'var(--accent-primary)', fontSize: '1.4rem' }}>{lstmResult.confidenceScore}%</h4>
             </div>
          </div>

          <div style={{ flex: 1, marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Trend Logic</h4>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-secondary)', minHeight: '140px' }}>
              <p style={{ margin: 0 }}>{lstmResult.metrics.explanation?.whySuccessScore}</p>
            </div>
          </div>

          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', border: '1px solid var(--accent-primary)', background: 'transparent', color: 'var(--accent-primary)' }}
            onClick={() => handleSelectModel('lstm')}
          >
            <CheckCircle2 size={16} />
            Use Time-Series
          </button>
        </div>

      </div>

    </div>
  );
};

export default ModelComparison;
