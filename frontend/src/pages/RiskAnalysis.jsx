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
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

/**
 * Circular Progress Gauge for Normalized AI Risk Score (0 - 100)
 */
function CircularScore({ score, level }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((score || 0) / 100) * circumference;
  const color = level === 'HIGH' ? '#EF4444' : level === 'MEDIUM' ? '#F59E0B' : '#10B981';

  return (
    <div style={{ position: 'relative', width: 84, height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={84} height={84} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={42} cy={42} r={radius} stroke="#E8E8F2" strokeWidth={6.5} fill="transparent" />
        <circle
          cx={42}
          cy={42}
          r={radius}
          stroke={color}
          strokeWidth={6.5}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
          {score || 0}
        </span>
        <div style={{ fontSize: '0.62rem', color: '#777A96', fontWeight: 600 }}>/ 100</div>
      </div>
    </div>
  );
}

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
          {/* Top KPI Cards */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card" style={{ borderTop: '3px solid #7957F5' }}>
              <span className="stat-card-title">Assessed Returns</span>
              <span className="stat-card-value">{totalAssessed}</span>
              <span className="stat-card-subtitle">AI risk profiles evaluated</span>
            </div>
            <div className="stat-card" style={{ borderTop: '3px solid #EF4444' }}>
              <span className="stat-card-title">High Risk Flags</span>
              <span className="stat-card-value" style={{ color: '#DC2626' }}>{highRiskCount}</span>
              <span className="stat-card-subtitle">Suspected return fraud / swap</span>
            </div>
            <div className="stat-card" style={{ borderTop: '3px solid #F59E0B' }}>
              <span className="stat-card-title">Medium Suspicion</span>
              <span className="stat-card-value" style={{ color: '#D97706' }}>{medRiskCount}</span>
              <span className="stat-card-subtitle">Secondary physical audit advised</span>
            </div>
            <div className="stat-card" style={{ borderTop: '3px solid #10B981' }}>
              <span className="stat-card-title">Low Risk Verified</span>
              <span className="stat-card-value" style={{ color: '#059669' }}>{lowRiskCount}</span>
              <span className="stat-card-subtitle">Safe for auto-approval</span>
            </div>
          </div>

          {/* Model Transparency Explainer Box */}
          <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #11142B 0%, #1E1B4B 100%)', color: '#FFFFFF', border: '1px solid rgba(121, 87, 245, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #7957F5, #42D9E8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BrainCircuit size={20} color="#FFFFFF" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                  How the Explainable Risk Engine Evaluates Every Parcel (0 – 100)
                </h3>
                <p style={{ fontSize: '0.825rem', color: '#D1D2E4' }}>
                  Transparent multi-variable scoring model with zero black-box obscurity.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.85rem 1rem', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontWeight: 700, color: '#42D9E8', fontSize: '0.85rem' }}>1. Customer Return Frequency (30%)</div>
                <p style={{ color: '#B4B6CD', marginTop: '0.25rem', fontSize: '0.78rem', lineHeight: '1.4' }}>
                  Cross-checks repeat return occurrences from the same buyer across all store shipments.
                </p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.85rem 1rem', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontWeight: 700, color: '#9B7DFF', fontSize: '0.85rem' }}>2. Category & Item Value (25%)</div>
                <p style={{ color: '#B4B6CD', marginTop: '0.25rem', fontSize: '0.78rem', lineHeight: '1.4' }}>
                  High-ticket apparel, consumer electronics, and jewelry carry higher risk weighting.
                </p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.85rem 1rem', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontWeight: 700, color: '#42D9E8', fontSize: '0.85rem' }}>3. OpenCV Visual Disparity (25%)</div>
                <p style={{ color: '#B4B6CD', marginTop: '0.25rem', fontSize: '0.78rem', lineHeight: '1.4' }}>
                  Histogram correlation & SSIM pixel comparison between dispatch photo vs return photo.
                </p>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.85rem 1rem', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontWeight: 700, color: '#9B7DFF', fontSize: '0.85rem' }}>4. Physical Inspection Audit (20%)</div>
                <p style={{ color: '#B4B6CD', marginTop: '0.25rem', fontSize: '0.78rem', lineHeight: '1.4' }}>
                  Missing barcode tags, tampered void tape, broken seals, or swapped garments detected.
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

          {/* Risk Evaluations List */}
          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
              <p>Analyzing risk assessment models...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <ShieldAlert size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>No Risk Assessments Found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {search || filterLevel !== 'ALL' ? 'No evaluations match your search filter.' : 'All incoming return requests will automatically be evaluated here.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filtered.map((item) => {
                const a = item.assessment;
                return (
                  <div 
                    key={a.id} 
                    className="card" 
                    style={{ 
                      borderLeft: `5px solid ${a.risk_level === 'HIGH' ? '#EF4444' : a.risk_level === 'MEDIUM' ? '#F59E0B' : '#10B981'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
                      {/* Left: Metadata */}
                      <div style={{ flex: 1, minWidth: '260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-violet)' }}>
                            {item.return_ref}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
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

                      {/* Right: Circular Gauge & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <CircularScore score={a.risk_score} level={a.risk_level} />
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Assessed Level</div>
                            <RiskBadge level={a.risk_level} />
                          </div>
                        </div>

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

                    {/* Contributing Rule Factors */}
                    <div style={{ background: 'var(--bg-surface-subtle)', padding: '0.95rem 1.15rem', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
                        Triggered Heuristic Flags & Disparity Breakdown:
                      </span>
                      <ul style={{ marginTop: '0.45rem', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {a.reasons && a.reasons.map((r, idx) => (
                          <li key={idx} style={{ marginBottom: '0.25rem' }}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Verification Action Banner */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid var(--border-card)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={18} color="var(--color-violet)" />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          <strong>Recommended Action:</strong> {a.recommended_action}
                        </span>
                      </div>
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
