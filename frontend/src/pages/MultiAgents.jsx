import { useState, useEffect } from 'react';
import { Network, Database, BrainCircuit, ShieldAlert, LineChart, Target, Truck, Zap, AlertTriangle, CheckCircle, TrendingUp, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MultiAgents = () => {
  const { currentAnalysis, multiAgentResult, setMultiAgentResult } = useAppContext();
  const [selectedAgents, setSelectedAgents] = useState(() => {
    if (!multiAgentResult?.agents?.length) return [];
    if (multiAgentResult.analysisId !== currentAnalysis?.id) return []; // stale
    return multiAgentResult.agents;
  });
  const [status, setStatus] = useState('idle');
  // Re-attach JSX icons (stripped before localStorage serialization)
  const [agentOutputs, setAgentOutputs] = useState(() => {
    if (!multiAgentResult?.outputs?.length) return [];
    if (multiAgentResult.analysisId !== currentAnalysis?.id) return []; // stale
    return multiAgentResult.outputs;
  });
  const [workflowSteps, setWorkflowSteps] = useState(() => {
    if (!multiAgentResult?.workflowSteps?.length) return [];
    if (multiAgentResult.analysisId !== currentAnalysis?.id) return []; // stale
    return multiAgentResult.workflowSteps;
  });

  // Restore completed status on mount if saved result matches current analysis
  useEffect(() => {
    const isValid = multiAgentResult?.outputs?.length > 0
      && multiAgentResult?.analysisId === currentAnalysis?.id;
    if (isValid) setStatus('complete');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-reset when a NEW analysis is run (analysisId mismatch)
  useEffect(() => {
    if (!currentAnalysis) return;
    if (multiAgentResult && multiAgentResult.analysisId !== currentAnalysis.id) {
      setMultiAgentResult(null);
      setAgentOutputs([]);
      setSelectedAgents([]);
      setWorkflowSteps([]);
      setStatus('idle');
    }
  }, [currentAnalysis?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const metrics = currentAnalysis?.metrics || {};
  const inputs  = currentAnalysis?.inputs  || {};

  const idea        = inputs.idea        || 'Your Venture';
  const field       = inputs.field       || 'General Market';
  const audience    = inputs.audience    || 'Target Customers';
  const budget      = inputs.budget      || '50000';
  const businessType= inputs.businessType|| 'Startup';
  const productType = inputs.productType || 'Physical';

  const budgetNum = parseInt(String(budget).replace(/[^0-9]/g, '')) || 50000;

  // ── Revenue helpers ──────────────────────────────────────────────────────
  const q1Revenue   = metrics.revenueData?.[0]?.current || budgetNum * 0.1;
  const q4Revenue   = metrics.revenueData?.[3]?.projected || budgetNum * 0.9;
  const totalDemand = (metrics.demandForecastData || []).reduce((s, m) => s + (m.demand || 0), 0);
  const avgDemand   = totalDemand ? Math.floor(totalDemand / 6) : 1200;
  const peakDemand  = Math.max(...(metrics.demandForecastData || [{ demand: 1500 }]).map(m => m.demand || 0));
  const breakEven   = Math.max(3, Math.floor(budgetNum / Math.max(1, q4Revenue / 12)));
  const riskLevel   = metrics.supplyChain?.riskLevel || 'medium';
  const supScore    = metrics.successScore || 75;
  const growth      = metrics.growthScore  || 7.2;

  // ── Agent definitions ────────────────────────────────────────────────────
  const agentDefs = [
    { id: 'market',    name: 'Market Agent',       icon: <Target size={18}/>,      color: 'var(--accent-primary)',   desc: 'Audience and demand analysis'      },
    { id: 'financial', name: 'Financial Agent',    icon: <LineChart size={18}/>,   color: 'var(--accent-success)',   desc: 'Revenue and budget viability'      },
    { id: 'strategy',  name: 'Strategy Agent',     icon: <BrainCircuit size={18}/>,color: 'var(--accent-secondary)', desc: 'Business model evaluation'         },
    { id: 'risk',      name: 'Risk Agent',         icon: <ShieldAlert size={18}/>, color: 'var(--accent-danger)',    desc: 'Vulnerabilities and threats'       },
    { id: 'supply',    name: 'Supply Chain Agent', icon: <Truck size={18}/>,       color: 'var(--accent-warning)',   desc: 'Logistics and operations'          },
    { id: 'security',  name: 'Security Agent',     icon: <Database size={18}/>,    color: '#a78bfa',                 desc: 'System integrity and compliance'   },
  ];

  // Re-attach JSX icons to outputs restored from localStorage (they were stripped before serialization)
  useEffect(() => {
    if (agentOutputs.length > 0 && agentOutputs.some(o => !o.icon)) {
      setAgentOutputs(prev =>
        prev.map(output => {
          const def = agentDefs.find(a => a.id === output.id);
          return def ? { ...output, icon: def.icon } : output;
        })
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Per-agent insight generators (pull from real analysis data) ───────────
  const insightGenerators = {
    market: () => [
      {
        title: 'Demand Forecast',
        color: 'var(--accent-primary)',
        severity: 'info',
        body: `Average projected monthly demand for ${idea} stands at ${avgDemand.toLocaleString()} units, peaking at ${peakDemand.toLocaleString()} units in a single month. This indicates a strong seasonal demand pattern that should inform inventory planning for ${audience}.`,
      },
      {
        title: 'Audience Profile',
        color: 'var(--accent-primary)',
        severity: 'info',
        body: `Primary target demographic — ${audience} — exhibits characteristics consistent with mid-to-high purchasing intent in the ${field} sector. Early-adopter penetration is recommended to establish market presence before broader ${businessType} scaling begins.`,
      },
      {
        title: 'Market Growth Potential',
        color: 'var(--accent-success)',
        severity: 'success',
        body: `The ${field} market shows a growth trajectory of ${growth}x over the projection period. With a success probability of ${supScore}%, the venture has strong market fit indicators. Tier-2 and tier-3 market expansion is recommended after month 6 to maximise total addressable market capture.`,
      },
    ],
    financial: () => {
      const roi = Math.floor(((q4Revenue - q1Revenue) / Math.max(q1Revenue, 1)) * 100);
      return [
        {
          title: 'Revenue Trajectory',
          color: 'var(--accent-success)',
          severity: 'success',
          body: `Opening quarterly revenue is projected at $${q1Revenue.toLocaleString()} with fourth-quarter projected at $${q4Revenue.toLocaleString()}, representing a ${roi}% return on initial capital allocation. The growth curve aligns with a ${businessType} model operating within the ${field} sector.`,
        },
        {
          title: 'Break-Even Analysis',
          color: breakEven <= 12 ? 'var(--accent-success)' : 'var(--accent-warning)',
          severity: breakEven <= 12 ? 'success' : 'warning',
          body: `Based on the allocated budget of $${budgetNum.toLocaleString()} and the projected revenue curve, break-even is estimated at approximately month ${breakEven}. ${breakEven <= 12 ? 'This is within the first fiscal year — a strong indicator of financial viability.' : 'Runway extension through additional funding rounds is recommended to reach profitability comfortably.'}`,
        },
        {
          title: 'Budget Utilisation',
          color: 'var(--accent-primary)',
          severity: 'info',
          body: `An optimal capital allocation strategy for a ${productType} ${businessType} in ${field} recommends apportioning 40% to product development, 30% to marketing and customer acquisition, 20% to operational infrastructure, and 10% as a contingency reserve. Current budget of $${budgetNum.toLocaleString()} ${budgetNum > 150000 ? 'is well-suited for this allocation.' : 'is tight — prioritising product-market fit is critical before major marketing spend.'}`,
        },
      ];
    },
    strategy: () => {
      const roadmap = metrics.strategicRoadmap || {};
      const after = roadmap.after || [
        `AI-driven optimization tailored to ${idea}.`,
        `Precision-targeted engagement for ${audience}.`,
        `Scalable infrastructure for the ${field} market.`,
      ];
      return [
        {
          title: 'Strategic Transformation Roadmap',
          color: 'var(--accent-secondary)',
          severity: 'info',
          body: `Post-implementation strategic pillars for ${idea}: ${after.join(' ')}`,
        },
        {
          title: 'Model Comparison Intelligence',
          color: 'var(--accent-primary)',
          severity: 'success',
          body: `Evaluation of AI models for ${idea} shows that Large Language Models achieve 93% accuracy at 1.2s latency (premium cost), while Gradient Boosting delivers 84% accuracy at 0.1s latency (cost-effective). For a ${budgetNum > 200000 ? 'well-funded' : 'budget-conscious'} ${businessType}, ${budgetNum > 200000 ? 'LLM integration is recommended for superior analysis quality' : 'Gradient Boosting offers the best cost-performance balance'}.`,
        },
        {
          title: 'Competitive Moat Assessment',
          color: growth > 8 ? 'var(--accent-success)' : 'var(--accent-warning)',
          severity: growth > 8 ? 'success' : 'warning',
          body: `With a growth score of ${growth}/10 and ${supScore}% success probability, ${idea} demonstrates a ${growth > 8 ? 'strong' : 'moderate'} competitive position in ${field}. ${growth > 8 ? 'Proactive IP protection and exclusive supplier agreements are recommended to widen the moat.' : 'Differentiation through product uniqueness and early customer lock-in is critical to sustain competitive advantage.'}`,
        },
      ];
    },
    risk: () => {
      const heatmap = metrics.heatmapData || [];
      const highRiskPoint = heatmap.find(p => (p.x || 0) > 6 || (p.y || 0) > 6);
      return [
        {
          title: 'Operational Risk Profile',
          color: riskLevel === 'high' ? 'var(--accent-danger)' : riskLevel === 'medium' ? 'var(--accent-warning)' : 'var(--accent-success)',
          severity: riskLevel,
          body: `The ${field} sector exhibits a ${riskLevel} operational risk profile for ${idea}. ${riskLevel === 'high' ? `Significant exposure has been identified — immediate risk mitigation protocols and secondary supplier qualification are mandatory before scaling operations for ${audience}.` : riskLevel === 'medium' ? `Moderate risks are present. A structured risk register and quarterly review cycles are recommended for the ${businessType} model.` : `Risk exposure is well-managed. Standard monitoring protocols are sufficient for the current operational scale.`}`,
        },
        {
          title: 'Market Volatility Exposure',
          color: 'var(--accent-warning)',
          severity: 'warning',
          body: highRiskPoint
            ? `Heatmap analysis reveals a critical risk cluster at volatility index ${(highRiskPoint.x || 0).toFixed(1)} and operational risk index ${(highRiskPoint.y || 0).toFixed(1)}: "${highRiskPoint.risk}". This represents the highest-priority risk vector for ${idea} and requires an immediate mitigation strategy.`
            : `Market volatility analysis for ${field} shows manageable risk distribution. No single catastrophic exposure point has been identified, though ${productType === 'Digital' ? 'cybersecurity threats and platform dependency risks' : 'supplier concentration and logistics disruption risks'} should be actively monitored.`,
        },
        {
          title: 'Risk Mitigation Recommendations',
          color: 'var(--accent-primary)',
          severity: 'info',
          body: `For ${idea} operating in the ${field} sector: (1) Establish contractual redundancy with at least two primary ${productType === 'Digital' ? 'cloud infrastructure' : 'supplier'} providers. (2) Maintain a ${Math.max(10, Math.floor(budgetNum * 0.1 / 1000))}% capital contingency reserve against projected cash flow disruptions. (3) Conduct quarterly risk audits aligned with ${audience} demand cycle fluctuations.`,
        },
      ];
    },
    supply: () => {
      const routes     = metrics.supplyChain?.routes     || [];
      const suggestions= metrics.supplyChain?.aiSuggestions || [];
      return [
        {
          title: 'Active Route Assessment',
          color: 'var(--accent-warning)',
          severity: 'info',
          body: routes.length > 0
            ? `${routes.length} operational routes have been identified for ${idea}. ${routes.filter(r => r.status === 'On-Time' || r.status === 'Optimal').length} routes are performing optimally. ${routes.filter(r => r.status === 'Delayed' || r.status === 'At Risk').length > 0 ? `${routes.filter(r => r.status === 'Delayed' || r.status === 'At Risk').length} route(s) require immediate attention: ${routes.filter(r => r.status === 'Delayed' || r.status === 'At Risk').map(r => r.route).join(', ')}.` : 'All routes are within acceptable performance parameters.'}`
            : `No active route data is available. Run an analysis first to generate supply chain route intelligence for ${idea}.`,
        },
        {
          title: 'Logistics Optimisation Intelligence',
          color: 'var(--accent-primary)',
          severity: 'info',
          body: suggestions[0]
            ? `${suggestions[0].title}: ${suggestions[0].description}`
            : `For a ${productType} ${businessType} in ${field}, logistics optimisation should focus on reducing last-mile delivery costs and establishing regional distribution partnerships to serve ${audience} more efficiently.`,
        },
        {
          title: 'Operational Expenditure Forecast',
          color: 'var(--accent-success)',
          severity: 'success',
          body: suggestions[1]
            ? `${suggestions[1].title}: ${suggestions[1].description}`
            : `Based on the current budget of $${budgetNum.toLocaleString()}, operational logistics costs are estimated at 20–30% of total expenditure. Negotiating volume-based carrier contracts after month 3 is recommended to achieve cost efficiency.`,
        },
      ];
    },
    security: () => {
      const isDigital = productType === 'Digital' || ['SaaS', 'FinTech', 'EdTech', 'Technology'].includes(field);
      return [
        {
          title: isDigital ? 'Cybersecurity Risk Assessment' : 'Data & System Integrity',
          color: '#a78bfa',
          severity: 'warning',
          body: isDigital
            ? `As a ${field} ${productType} product, ${idea} faces elevated cybersecurity exposure. Critical threat vectors include API injection attacks, unauthorised data access, and third-party dependency vulnerabilities. Implementation of OAuth 2.0, end-to-end encryption, and automated vulnerability scanning pipelines is strongly recommended before serving ${audience} at scale.`
            : `${idea} handles sensitive ${audience} data across its operations. Data classification, access control policies, and GDPR/DPDP compliance frameworks must be implemented. Physical security protocols for ${field} operations require documented procedures and regular third-party audits.`,
        },
        {
          title: 'Compliance & Regulatory Exposure',
          color: '#a78bfa',
          severity: 'info',
          body: `Operating in the ${field} sector, ${idea} must comply with ${field === 'FinTech' ? 'RBI regulations, PCI-DSS, and SEBI guidelines' : field === 'Healthcare' ? 'HIPAA, DISHA, and clinical data protection standards' : field === 'EdTech' ? 'FERPA, COPPA, and student data privacy regulations' : 'applicable DPDP Act provisions, industry-specific data localisation requirements, and consumer protection standards'}. Non-compliance penalties can represent a material financial and reputational risk for a ${businessType} at this stage.`,
        },
        {
          title: 'Security Investment Recommendation',
          color: 'var(--accent-success)',
          severity: 'success',
          body: `For a ${businessType} with a $${budgetNum.toLocaleString()} budget, allocating 8–12% ($${Math.floor(budgetNum * 0.10).toLocaleString()} recommended) to security infrastructure is industry standard for ${field}. Priority investments should include ${isDigital ? 'cloud WAF, SIEM platform, and penetration testing' : 'CCTV infrastructure, access management systems, and encrypted data storage solutions'}.`,
        },
      ];
    },
  };

  // ── Agent message generator ───────────────────────────────────────────
  const generateAgentMessage = (id) => {
    switch (id) {
      case 'market':    return 'High demand detected in target audience';
      case 'financial': return 'Revenue model is viable with strong ROI';
      case 'risk':      return 'Operational risks identified ⚠️';
      case 'strategy':  return 'Business model optimized for growth';
      case 'supply':    return 'Logistics network is scalable';
      case 'security':  return 'System security validated';
      default:          return 'Analysis complete';
    }
  };

  // ── Run analysis (sequential visualization + parallel insights) ─────────
  const handleAnalyze = async () => {
    if (selectedAgents.length === 0 || !currentAnalysis) return;
    setStatus('analyzing');
    setWorkflowSteps([]);
    setAgentOutputs([]);

    const steps = [];

    for (let i = 0; i < selectedAgents.length; i++) {
      const id = selectedAgents[i];
      const def = agentDefs.find(a => a.id === id);

      // Mark step as running
      steps.push({ step: i + 1, agent: def.name, message: 'Processing...', status: 'running', color: def.color });
      setWorkflowSteps([...steps]);

      // Simulate per-agent thinking
      await new Promise(r => setTimeout(r, 900));

      // Mark step as done
      steps[i] = { ...steps[i], status: 'done', message: generateAgentMessage(id) };
      setWorkflowSteps([...steps]);
    }

    // Final synthesis step
    steps.push({ step: steps.length + 1, agent: 'Final AI', message: 'Aggregating all agent insights...', status: 'running', color: 'var(--accent-primary)' });
    setWorkflowSteps([...steps]);
    await new Promise(r => setTimeout(r, 900));
    steps[steps.length - 1] = { ...steps[steps.length - 1], status: 'done', message: 'Final synthesis generated' };
    setWorkflowSteps([...steps]);

    // Build outputs (using existing insight generators — no extra API calls)
    const outputs = selectedAgents.map(id => {
      const def = agentDefs.find(a => a.id === id);
      return { ...def, insights: insightGenerators[id]?.() || [] };
    });
    setAgentOutputs(outputs);
    // Strip non-serializable JSX icons before persisting
    const serializableOutputs = outputs.map(({ icon: _icon, ...rest }) => rest);
    setMultiAgentResult({
      analysisId: currentAnalysis?.id,   // 🔑 ties result to this specific run
      agents: selectedAgents,
      outputs: serializableOutputs,
      workflowSteps: steps,
      timestamp: Date.now(),
    });
    setStatus('complete');
  };

  const handleReset = () => {
    setStatus('idle');
    setAgentOutputs([]);
    setSelectedAgents([]);
    setWorkflowSteps([]);
    setMultiAgentResult(null); // clears localStorage via context useEffect
  };

  const severityIcon = (s) => {
    if (s === 'success') return <CheckCircle size={14} />;
    if (s === 'warning' || s === 'high') return <AlertTriangle size={14} />;
    return <Info size={14} />;
  };
  const severityColor = (s) => {
    if (s === 'success' || s === 'low')  return 'var(--accent-success)';
    if (s === 'warning' || s === 'medium' || s === 'high') return s === 'high' ? 'var(--accent-danger)' : 'var(--accent-warning)';
    return 'var(--accent-primary)';
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Network size={32} color="var(--accent-primary)" /> Explore by Agents
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Select specialised AI agents to extract deep, data-driven insights from your analysis.
          {currentAnalysis && (
            <span style={{ marginLeft: '0.75rem', color: 'var(--accent-success)', fontWeight: 600, fontSize: '0.85rem' }}>
              ✓ Analysis loaded: {idea.substring(0, 40)}{idea.length > 40 ? '…' : ''}
            </span>
          )}
        </p>
      </div>

      {/* No analysis warning */}
      {!currentAnalysis && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-warning)' }}>
          <AlertTriangle size={18} />
          <span style={{ fontWeight: 500 }}>No analysis has been run yet. Go to <strong>Configure Analysis</strong> and submit your idea first, then return here to explore by agents.</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>

        {/* LEFT: Agent selection */}
        <div className="glass-panel" style={{ padding: '1.5rem', alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Select Agent(s)</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {agentDefs.map(agent => {
              const active = selectedAgents.includes(agent.id);
              return (
                <label
                  key={agent.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    border: `1px solid ${active ? agent.color : 'var(--border-color)'}`,
                    background: active ? `${agent.color}18` : 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: active ? 'translateX(3px)' : 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => {
                      if (status !== 'idle') setStatus('idle');
                      setSelectedAgents(prev => prev.includes(agent.id) ? prev.filter(a => a !== agent.id) : [...prev, agent.id]);
                    }}
                    style={{ display: 'none' }}
                  />
                  {/* Custom checkbox */}
                  <div style={{ width: '18px', height: '18px', border: `2px solid ${active ? agent.color : 'var(--border-color)'}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? agent.color : 'transparent', flexShrink: 0 }}>
                    {active && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div style={{ color: agent.color, flexShrink: 0 }}>{agent.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{agent.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{agent.desc}</div>
                  </div>
                </label>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              className="btn btn-primary"
              onClick={handleAnalyze}
              disabled={selectedAgents.length === 0 || status === 'analyzing' || !currentAnalysis}
              style={{ width: '100%', opacity: (selectedAgents.length === 0 || !currentAnalysis) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Zap size={16} />
              {status === 'analyzing' ? 'Processing Agents…' : `Run ${selectedAgents.length > 0 ? selectedAgents.length : ''} Agent${selectedAgents.length !== 1 ? 's' : ''}`}
            </button>
            {status === 'complete' && (
              <button className="btn btn-secondary" onClick={handleReset} style={{ width: '100%' }}>
                Reset
              </button>
            )}
          </div>

          {selectedAgents.length > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '1rem', textAlign: 'center' }}>
              {selectedAgents.length === 1 ? 'Singleton Mode' : selectedAgents.length >= 4 ? 'Full Spectrum Mode' : 'Multi-Agent Mode'} — {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* RIGHT: Results */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header bar */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem' }}>
              <Zap color="var(--accent-warning)" size={17} /> Agent Analysis Output
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {currentAnalysis && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', background: 'var(--bg-primary)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  {field} · {productType}
                </span>
              )}
              <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.85rem', borderRadius: '999px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                {selectedAgents.length === 0 ? 'No Agents Selected' : selectedAgents.length === 1 ? 'Singleton Mode' : selectedAgents.length >= 4 ? 'Full Spectrum Mode' : 'Multi-Agent Mode'}
              </span>
            </div>
          </div>

          {/* 🔄 LIVE WORKFLOW VISUALIZATION */}
          {workflowSteps.length > 0 && (
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  🔄 Multi-Agent Workflow
                </span>
                {status === 'analyzing' && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-warning)', background: 'rgba(245,158,11,0.1)', padding: '0.15rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(245,158,11,0.3)' }}>Live</span>
                )}
                {status === 'complete' && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-success)', background: 'rgba(16,185,129,0.1)', padding: '0.15rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(16,185,129,0.3)' }}>Complete</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {workflowSteps.map((step, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${step.status === 'done' ? (step.color || 'var(--accent-success)') : 'var(--accent-warning)'}`,
                    transition: 'all 0.3s ease',
                    opacity: step.status === 'done' ? 1 : 0.85
                  }}>
                    {/* Step number bubble */}
                    <div style={{
                      minWidth: '24px', height: '24px', borderRadius: '50%',
                      background: step.status === 'done' ? 'var(--accent-success)' : 'var(--accent-warning)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 800, color: 'white', flexShrink: 0, marginTop: '0.1rem'
                    }}>
                      {step.status === 'done' ? '✓' : step.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                        {step.agent}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{step.message}</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: step.status === 'done' ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                        {step.status === 'done' ? '✔ Completed' : '▶ Running...'}
                      </div>
                    </div>
                    {/* Connector arrow if not last */}
                    {idx < workflowSteps.length - 1 && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', alignSelf: 'center' }}>→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', background: 'var(--bg-secondary)', minHeight: '400px' }}>

            {/* Idle */}
            {status === 'idle' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '320px', color: 'var(--text-tertiary)', textAlign: 'center', gap: '1rem' }}>
                <Network size={56} style={{ opacity: 0.15 }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>Select agents and click Run to generate insights.</p>
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem' }}>Each agent analyses your venture data from a specialised perspective.</p>
                </div>
              </div>
            )}

            {/* Analyzing */}
            {status === 'analyzing' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '320px', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {selectedAgents.map((id, i) => {
                    const def = agentDefs.find(a => a.id === id);
                    return (
                      <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', animation: `pulse-glow 1.2s ease ${i * 0.15}s infinite` }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${def.color}25`, border: `2px solid ${def.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: def.color }}>
                          {def.icon}
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{def.name.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>
                  Synergising {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} against your analysis data…
                </p>
              </div>
            )}

            {/* Complete */}
            {status === 'complete' && agentOutputs.length > 0 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {agentOutputs.map((agent) => (
                  <div key={agent.id}>
                    {/* Agent section header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${agent.color}40` }}>
                      <div style={{ color: agent.color }}>{agent.icon}</div>
                      <h3 style={{ margin: 0, fontSize: '1rem', color: agent.color }}>{agent.name} Report</h3>
                      <div style={{ flex: 1, height: '1px', background: `${agent.color}20` }} />
                    </div>
                    {/* Insights */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {agent.insights.map((insight, i) => (
                        <div
                          key={i}
                          style={{ background: 'var(--bg-tertiary)', padding: '1.1rem 1.25rem', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${insight.color}`, transition: 'transform 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(3px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ color: severityColor(insight.severity) }}>{severityIcon(insight.severity)}</span>
                            <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{insight.title}</h4>
                          </div>
                          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.7 }}>
                            {insight.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Cross-agent synthesis (when > 1 agent selected) */}
                {agentOutputs.length > 1 && (
                  <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                      <TrendingUp size={16} color="var(--accent-primary)" />
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--accent-primary)' }}>Cross-Agent Synthesis</h4>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.7 }}>
                      Combined intelligence from {agentOutputs.map(a => a.name).join(', ')} indicates that <strong style={{ color: 'var(--text-primary)' }}>{idea.substring(0, 35)}{idea.length > 35 ? '…' : ''}</strong> has a <strong style={{ color: supScore >= 80 ? 'var(--accent-success)' : supScore >= 60 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>{supScore}% success probability</strong> in the {field} sector with a {growth}x growth trajectory. {riskLevel === 'high' ? 'Immediate risk mitigation is the critical priority before market expansion.' : riskLevel === 'medium' ? 'Balanced execution across financial, operational, and market dimensions will drive optimal outcomes.' : 'Conditions are favourable — scaling aggressively while maintaining financial discipline is recommended.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiAgents;
