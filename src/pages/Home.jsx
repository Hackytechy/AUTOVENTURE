import { ArrowRight, Activity, Shield, TrendingUp, Cpu, Workflow, Zap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Hero3D from '../components/Hero3D';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container animate-fade-in" style={{ 
      paddingTop: '2rem', 
      position: 'relative', 
      minHeight: 'calc(100vh - 4rem)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* 3D Background Element */}
      <Hero3D />

      <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '4rem', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1.5rem',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-color)',
          color: 'var(--accent-primary)',
          fontWeight: '600',
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          <Sparkles size={16} /> AI-Powered Venture Intelligence
        </div>
        
        <h1 style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          Auto Venture <br />
          <span style={{ color: 'var(--accent-success)' }}>OmniGuard</span> <br />
          <span style={{ background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>SupplyChain AI-X</span>
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          Evaluate, predict, and protect your startup with the most advanced Multi-Agent AI platform.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/analysis')} style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
            Start Analysis
            <ArrowRight size={20} />
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/pricing')} style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
            View Plans
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Intelligence Redefined</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
          AI-X SupplyChain-X is a next-generation platform that doesn't just analyze—it thinks. By fusing three distinct AI architectures, we deliver insights no single model can achieve. From startup validation to global supply chain optimization, our multi-agent system covers every angle of your business.
        </p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Platform Features</h2>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '1.5rem', 
        width: '100%',
        maxWidth: '1100px',
        marginBottom: '6rem'
      }}>
        <FeatureCard 
          icon={<Cpu color="var(--accent-success)" />} 
          title="Multi-Model AI" 
          desc="LLM and XGBoost in harmony for unmatched accuracy."
        />
        <FeatureCard 
          icon={<Shield color="var(--accent-success)" />} 
          title="OmniGuard Security" 
          desc="Real-time monitoring and autonomous threat detection."
        />
        <FeatureCard 
          icon={<TrendingUp color="var(--accent-success)" />} 
          title="Supply Chain Intelligence" 
          desc="End-to-end forecasting and logistics optimization."
        />
        <FeatureCard 
          icon={<Workflow color="var(--accent-success)" />} 
          title="Multi-Agent Analysis" 
          desc="6 specialized agents analyzing every business dimension."
        />
        <FeatureCard 
          icon={<Zap color="var(--accent-success)" />} 
          title="Revenue Forecasting" 
          desc="LSTM-powered projections with 99% historical accuracy."
        />
        <FeatureCard 
          icon={<Activity color="var(--accent-success)" />} 
          title="Real-time Insights" 
          desc="Dynamic dashboards updating with every data point."
        />
      </div>

      {/* CTA Section */}
      <div className="glass-panel" style={{ 
        width: '100%', 
        maxWidth: '900px', 
        padding: '4rem', 
        textAlign: 'center', 
        marginBottom: '6rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
        border: '1px solid var(--border-hover)'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Ready to Transform Your Venture?</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
          Join hundreds of startups using AI-X for smarter decisions.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/analysis')} style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
          Launch Analysis <ArrowRight size={20} />
        </button>
      </div>

      <footer style={{ width: '100%', padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
        © 2024 Auto Venture OmniGuard SupplyChain AI-X. All rights reserved.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', transition: 'transform 0.3s ease' }}>
    <div style={{ 
      background: 'rgba(16, 185, 129, 0.1)', 
      width: '40px', height: '40px', 
      borderRadius: '8px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginBottom: '1.25rem' 
    }}>
      {icon}
    </div>
    <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.95rem' }}>{desc}</p>
  </div>
);

export default Home;
