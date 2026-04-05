import { Check, X, Shield, Zap, Sparkles } from 'lucide-react';
import { useState } from 'react';

const Pricing = () => {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      desc: 'Perfect for early-stage founders validating a single idea.',
      price: annual ? 29 : 39,
      icon: <Sparkles color="var(--accent-primary)" size={24} />,
      color: 'var(--accent-primary)',
      features: [
        { name: '1 Startup Analysis per month', included: true },
        { name: 'Basic Market & Financial Agents', included: true },
        { name: 'Standard Risk Heatmap', included: true },
        { name: 'OmniGuard Monitoring', included: false },
        { name: 'Supply Chain Simulation', included: false },
        { name: 'Advanced Multi-Agent Mode', included: false },
      ]
    },
    {
      name: 'Pro',
      desc: 'For growing teams requiring continuous validation.',
      price: annual ? 79 : 99,
      isPopular: true,
      icon: <Zap color="var(--accent-success)" size={24} />,
      color: 'var(--accent-success)',
      features: [
        { name: '5 Startup Analyses per month', included: true },
        { name: 'All 6 AI Analysis Agents', included: true },
        { name: 'Detailed Risk & Growth metrics', included: true },
        { name: 'OmniGuard Monitoring (Standard)', included: true },
        { name: 'Supply Chain Simulation (Regional)', included: true },
        { name: 'Advanced Multi-Agent Mode', included: false },
      ]
    },
    {
      name: 'Enterprise',
      desc: 'Full-scale autonomous protection and deep logistics.',
      price: annual ? 249 : 299,
      icon: <Shield color="var(--accent-warning)" size={24} />,
      color: 'var(--accent-warning)',
      features: [
        { name: 'Unlimited Analyses', included: true },
        { name: 'Custom AI Agents Configuration', included: true },
        { name: 'Predictive Multi-Market testing', included: true },
        { name: 'OmniGuard Self-Healing Pipelines', included: true },
        { name: 'Global Supply Chain Simulation', included: true },
        { name: 'Advanced Multi-Agent API', included: true },
      ]
    }
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 2rem 4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '1rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Simple, transparent pricing</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Choose the plan that best fits your needs. Upgrade or downgrade at any time.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '0.3rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
          <button 
            className={`btn ${!annual ? 'btn-primary' : ''}`}
            style={{ padding: '0.5rem 1.5rem', background: !annual ? 'var(--bg-secondary)' : 'transparent', color: !annual ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: !annual ? 'var(--shadow-sm)' : 'none' }}
            onClick={() => setAnnual(false)}
          >
            Monthly
          </button>
          <button 
            className={`btn ${annual ? 'btn-primary' : ''}`}
            style={{ padding: '0.5rem 1.5rem', background: annual ? 'var(--bg-secondary)' : 'transparent', color: annual ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: annual ? 'var(--shadow-sm)' : 'none' }}
            onClick={() => setAnnual(true)}
          >
            Annually <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-success)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>Save 20%</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {plans.map((plan, i) => (
          <div key={i} className="glass-panel" style={{ 
            padding: '2.5rem 2rem', 
            position: 'relative',
            transform: plan.isPopular ? 'scale(1.05)' : 'scale(1)',
            border: plan.isPopular ? `2px solid ${plan.color}` : '1px solid var(--border-color)',
            boxShadow: plan.isPopular ? '0 10px 40px -10px rgba(16, 185, 129, 0.2)' : 'var(--shadow-lg)',
            zIndex: plan.isPopular ? 10 : 1
          }}>
            {plan.isPopular && (
               <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', background: plan.color, color: 'white', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                 MOST POPULAR
               </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', background: `${plan.color}22`, borderRadius: 'var(--radius-md)' }}>
                {plan.icon}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{plan.name}</h3>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', minHeight: '3rem', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {plan.desc}
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>${plan.price}</span>
              <span style={{ color: 'var(--text-secondary)' }}>/mo</span>
            </div>

            <button 
              className={`btn ${plan.isPopular ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ width: '100%', padding: '1rem', marginBottom: '2.5rem', background: plan.isPopular ? plan.color : 'var(--bg-tertiary)', border: plan.isPopular ? 'none' : '1px solid var(--border-color)' }}
            >
              Get Started
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {plan.features.map((feature, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: feature.included ? 1 : 0.5 }}>
                  {feature.included ? (
                    <Check size={18} color={plan.color} />
                  ) : (
                    <X size={18} color="var(--text-tertiary)" />
                  )}
                  <span style={{ fontSize: '0.9rem', color: feature.included ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
