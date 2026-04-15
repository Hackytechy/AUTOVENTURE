import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { simulateAnalysis } from '../services/aiEngine';

const InputAnalysis = () => {
  const navigate = useNavigate();
  const { addAnalysisToHistory, setCurrentAnalysis } = useAppContext();
  const [formData, setFormData] = useState({
    idea: '',
    audience: '',
    timeline: '',
    budget: '',
    currency: 'USD',
    businessType: '',
    field: '',
    productType: '',
    model: 'HYBRID',      // Always Hybrid — hardcoded, not user-configurable
    compareModels: false  // Disabled; model comparison still works via Model Comparison page
  });

  const [fieldSearch, setFieldSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fields = ['Technology', 'FinTech', 'Retail', 'Healthcare', 'EdTech', 'E-commerce', 'SaaS', 'Real Estate', 'Logistics'];
  const filteredFields = fields.filter(f => f.toLowerCase().includes(fieldSearch.toLowerCase()));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const results = await simulateAnalysis({ ...formData, model: 'HYBRID' });
      setCurrentAnalysis(results);
      addAnalysisToHistory(results);
      navigate('/dashboard');
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Failed to connect to the AI engine. Ensure the server is running and your API key is valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Configure Analysis Request</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Our AI automatically uses a hybrid intelligence pipeline for best results.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          marginTop: '0.5rem',
          fontSize: '0.78rem', fontWeight: 600,
          color: 'var(--accent-primary)',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          padding: '0.3rem 0.75rem',
          borderRadius: '999px'
        }}>
          <Sparkles size={13} />
          ⚡ Hybrid AI Engine — LLM + XGBoost + LSTM
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        <div className="input-group">
          <label className="input-label">Idea Description</label>
          <textarea
            className="input-field"
            name="idea"
            rows="4"
            placeholder="Describe your startup idea, core problem, and proposed solution..."
            value={formData.idea}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">Target Audience</label>
          <textarea
            className="input-field"
            name="audience"
            rows="2"
            placeholder="Who are the primary users or customers?"
            value={formData.audience}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Timeline</label>
            <input
              type="text"
              className="input-field"
              name="timeline"
              placeholder="e.g. 18 months, 2.5 years"
              value={formData.timeline}
              onChange={handleChange}
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Initial Budget</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select className="input-field" name="currency" value={formData.currency} onChange={handleChange} style={{ width: '90px', padding: '0.75rem 0.5rem' }}>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
                <option value="INR">₹ INR</option>
              </select>
              <input
                type="text"
                className="input-field"
                name="budget"
                placeholder="e.g. 500k, 1M"
                value={formData.budget}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Type of Business</label>
            <select className="input-field" name="businessType" value={formData.businessType} onChange={handleChange}>
              <option value="">Select...</option>
              <option value="B2B">B2B</option>
              <option value="B2C">B2C</option>
              <option value="B2B2C">B2B2C</option>
              <option value="Marketplace">Marketplace</option>
              <option value="D2C">D2C</option>
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0, position: 'relative' }}>
            <label className="input-label">Field of Area</label>
            <input
              type="text"
              className="input-field"
              placeholder="Search field..."
              value={fieldSearch}
              onChange={(e) => {
                setFieldSearch(e.target.value);
                handleChange({ target: { name: 'field', value: e.target.value } });
              }}
            />
            {fieldSearch && filteredFields.length > 0 && formData.field !== filteredFields[0] && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                marginTop: '0.5rem', zIndex: 10,
                boxShadow: 'var(--shadow-lg)'
              }}>
                {filteredFields.map(f => (
                  <div
                    key={f}
                    style={{ padding: '0.75rem 1rem', cursor: 'pointer', transition: 'background 0.2s' }}
                    onClick={() => {
                      setFieldSearch(f);
                      handleChange({ target: { name: 'field', value: f } });
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    {f}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Product Type</label>
            <select className="input-field" name="productType" value={formData.productType} onChange={handleChange}>
              <option value="">Select...</option>
              <option value="Digital">Digital</option>
              <option value="Physical">Physical</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: '1.5rem', padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid var(--accent-danger)',
            color: 'var(--accent-danger)',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2.5rem' }} disabled={loading}>
            {loading ? (
              <>
                <div style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                AI Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Comprehensive Analysis
              </>
            )}
          </button>
        </div>
      </form>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default InputAnalysis;
