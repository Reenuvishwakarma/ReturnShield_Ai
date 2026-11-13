import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { riskService } from '../services/api';
import Sidebar from '../components/Sidebar';
import RiskBadge from '../components/RiskBadge';
import { 
  BrainCircuit, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Eye, 
  FileText, 
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function RiskAnalysis() {
  const { user, logout } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [search, setSearch] = useState('');

  const loadRiskData = async () => {
    try {
      setLoading(true);
      const res = await riskService.list();
      setEvaluations(res.data.risk_evaluations || []);
    } catch (err) {
      console.error("Failed to load risk evaluations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiskData();
  }, []);

  const totalAssessed = evaluations.length;
  const highRiskCount = evaluations.filter(e => e.assessment.risk_level === 'HIGH').length;
  const medRiskCount = evaluations.filter(e => e.assessment.risk_level === 'MEDIUM').length;
  const lowRiskCount = evaluations.filter(e => e.assessment.risk_level === 'LOW').length;

  const filtered = evaluations.filter(e => {
    const matchesLevel = filterLevel === 'ALL' || e.assessment.risk_level === filterLevel;
    const q = search.toLowerCase();
    const matchesSearch = 
      e.return_ref?.toLowerCase().includes(q) ||
      e.order_ref?.toLowerCase().includes(q) ||
      e.customer_name?.toLowerCase().includes(q) ||
      e.product_name?.toLowerCase().includes(q);
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={logout} />

      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-greeting">Explainable AI Risk Engine</h1>
            <p className="dashboard-subtitle">
              Heuristic and vision-backed risk models evaluate return probability, serial returners, and parcel tampering.
            </p>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={loadRiskData}>
              <Cpu size={16} />
              <span>Refresh Models</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Metrics Grid */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <span className="stat-card-title">Assessed Returns</span>
              <span className="stat-card-value">{totalAssessed}</span>
              <span className="stat-card-subtitle">AI risk profiles evaluated</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid var(--danger)' }}>
              <span className="stat-card-title">High Risk Flags</span>
              <span className="stat-card-value" style={{ color: 'var(--danger)' }}>{highRiskCount}</span>
              <span className="stat-card-subtitle">Suspected return fraud / swap</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
              <span className="stat-card-title">Medium Suspicion</span>
              <span className="stat-card-value" style={{ color: 'var(--warning)' }}>{medRiskCount}</span>
              <span className="stat-card-subtitle">Secondary inspection advised</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
              <span className="stat-card-title">Low Risk Verified</span>
              <span className="stat-card-value" style={{ color: 'var(--success)' }}>{lowRiskCount}</span>
              <span className="stat-card-subtitle">Safe for auto-refund</span>
            </div>
          </div>

          {/* Model Transparency Explainer Box */}
          <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.8))' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <BrainCircuit size={18} style={{ color: 'var(--primary-light)' }} />
              How the Explainable Risk Engine Scores Parcels (0 - 100)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>1. Buyer Frequency (30%)</span>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                  Tracks repeated returns from the same customer name or shipping address across your store.
                </p>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>2. Category & Value (25%)</span>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                  Higher weight assigned to high-ticket electronics, jewelry, and high-fraud categories.
                </p>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>3. Visual Disparity (25%)</span>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                  OpenCV histogram and structural similarity comparing dispatch photo vs return photo.
                </p>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>4. Physical Audit (20%)</span>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                  Missing security tags, tampered seals, or swapped merchandise recorded during inspection.
                </p>
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', width: '360px', maxWidth: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search evaluations by order, return ref, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                <button
                  key={lvl}
                  className={`btn btn-sm ${filterLevel === lvl ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterLevel(lvl)}
                >
                  {lvl === 'ALL' ? 'All Risk Levels' : `${lvl} Risk`}
                </button>
              ))}
            </div>
          </div>

          {/* Evaluations List */}
          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
              <p>Analyzing risk assessment models...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <ShieldAlert size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>No Risk Assessments Found</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                {search || filterLevel !== 'ALL' ? 'No evaluations match your filters.' : 'Returns logged will automatically be analyzed by the explainable risk engine.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map((item) => {
                const a = item.assessment;
                return (
                  <div key={a.id} className="card" style={{ borderLeft: `5px solid ${a.risk_level === 'HIGH' ? 'var(--danger)' : a.risk_level === 'MEDIUM' ? 'var(--warning)' : 'var(--success)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary-light)' }}>
                            {item.return_ref}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Order: <strong>{item.order_ref}</strong>
                          </span>
                          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                            {item.return_reason}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Customer: <strong>{item.customer_name}</strong> | Item: <strong>{item.product_name}</strong> (₹{item.order_amount})
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <RiskBadge level={a.risk_level} score={a.risk_score} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/inspection?id=${a.return_request_id}`} className="btn btn-secondary btn-sm" title="Side-by-side inspection">
                            <Eye size={14} />
                            <span>Audit</span>
                          </Link>
                          {a.risk_level === 'HIGH' && (
                            <Link to={`/claims?return_id=${a.return_request_id}`} className="btn btn-primary btn-sm" title="Raise platform claim">
                              <FileText size={14} />
                              <span>Raise Claim</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contributing Rule Reasons */}
                    <div style={{ background: 'var(--bg-input)', padding: '0.85rem 1rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Triggered Heuristic Flags:
                      </span>
                      <ul style={{ marginTop: '0.35rem', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {a.reasons && a.reasons.map((r, idx) => (
                          <li key={idx} style={{ marginBottom: '0.2rem' }}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        <strong>Action Recommendation:</strong> {a.recommended_action}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.return_date ? `Logged: ${item.return_date}` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
