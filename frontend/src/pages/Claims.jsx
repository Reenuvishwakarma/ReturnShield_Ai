import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { claimService, returnService } from '../services/api';
import Sidebar from '../components/Sidebar';
import { 
  FileText, 
  Download, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Search, 
  X, 
  ShieldCheck,
  IndianRupee,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import './Dashboard.css';

export default function Claims() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryReturnId = searchParams.get('return_id');

  const [claims, setClaims] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedReturnId, setSelectedReturnId] = useState(queryReturnId || '');
  const [claimType, setClaimType] = useState('Swapped / Damaged Returned Goods');
  const [lossAmount, setLossAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, rRes] = await Promise.all([
        claimService.list(),
        returnService.list()
      ]);
      setClaims(cRes.data.claims || []);
      const retList = rRes.data.returns || [];
      setReturns(retList);

      if (queryReturnId) {
        setSelectedReturnId(queryReturnId);
        const match = retList.find(r => String(r.id) === String(queryReturnId));
        if (match) {
          setLossAmount(match.order_amount || '');
        }
        setShowModal(true);
      } else if (retList.length > 0 && !selectedReturnId) {
        setSelectedReturnId(retList[0].id);
        setLossAmount(retList[0].order_amount || '');
      }
    } catch (err) {
      console.error("Failed to load claims:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryReturnId]);

  const handleReturnSelect = (retId) => {
    setSelectedReturnId(retId);
    const match = returns.find(r => String(r.id) === String(retId));
    if (match) {
      setLossAmount(match.order_amount || '');
    }
  };

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    if (!selectedReturnId) {
      setError('Please select a return parcel record.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const res = await claimService.create({
        return_request_id: Number(selectedReturnId),
        claim_type: claimType,
        loss_amount: lossAmount ? parseFloat(lossAmount) : null
      });

      setSuccess('Tamper-evident dispute dossier PDF generated successfully!');
      await loadData();
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        if (queryReturnId) {
          setSearchParams({});
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to compile dispute dossier.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClaims = claims.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.claim_ref?.toLowerCase().includes(q) ||
      c.order_ref?.toLowerCase().includes(q) ||
      c.product_name?.toLowerCase().includes(q) ||
      c.customer_name?.toLowerCase().includes(q)
    );
  });

  const totalLossClaimed = claims.reduce((acc, c) => acc + (parseFloat(c.loss_amount) || 0), 0);

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={logout} />

      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-greeting">Dispute Claims & PDF Dossiers</h1>
            <p className="dashboard-subtitle">
              Export cryptographic dispute dossiers compiled with dispatch photos, inspection findings, and risk telemetry.
            </p>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={16} />
              <span>Compile Dispute Dossier</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Quick Metrics */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card" style={{ borderTop: '3px solid #7957F5' }}>
              <span className="stat-card-title">Dossiers Generated</span>
              <span className="stat-card-value">{claims.length}</span>
              <span className="stat-card-subtitle">Formal dispute packages compiled</span>
            </div>
            <div className="stat-card" style={{ borderTop: '3px solid #EF4444' }}>
              <span className="stat-card-title">Total Loss Claimed</span>
              <span className="stat-card-value" style={{ color: '#DC2626' }}>
                ₹{totalLossClaimed.toLocaleString()}
              </span>
              <span className="stat-card-subtitle">Pending merchant reimbursement</span>
            </div>
            <div className="stat-card" style={{ borderTop: '3px solid #10B981' }}>
              <span className="stat-card-title">Platform Submission Ready</span>
              <span className="stat-card-value" style={{ color: '#059669' }}>
                {claims.filter(c => c.status === 'Ready for Platform Submission').length}
              </span>
              <span className="stat-card-subtitle">Equipped with PDF evidence reports</span>
            </div>
          </div>

          {/* Marketplace Guide Banner */}
          <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <ShieldCheck size={22} style={{ color: 'var(--primary-light)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  How to use ReturnShield AI PDF Dossiers for 100% Platform Payouts
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                  Each downloaded PDF dossier includes cryptographic dispatch tokens, side-by-side photo comparison stamps, timestamped physical audit notes, and SSIM vision disparity metrics. Upload the generated PDF directly as attachment evidence in <strong>Meesho Seller Support Ticket</strong>, <strong>Amazon Safe-T Claim</strong>, or <strong>Flipkart SPF Claim</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="search-input-wrapper" style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search dossiers by Claim ID, Order Reference, Product, Customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Claims Table */}
          <div className="table-container">
            {loading ? (
              <div className="empty-state">
                <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
                <p>Retrieving dispute dossiers and claim records...</p>
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <h3>No Dispute Dossiers Generated Yet</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0.5rem auto 1.5rem auto' }}>
                  {search ? 'No claims match your search term.' : 'After inspecting a fraudulent, damaged, or swapped return, compile a dispute dossier here to claim reimbursement.'}
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                  <Plus size={16} /> Compile First Claim Dossier
                </button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Claim Reference</th>
                    <th>Order Reference</th>
                    <th>Product / Customer</th>
                    <th>Dispute Category</th>
                    <th>Claimed Loss</th>
                    <th>Status</th>
                    <th>Compiled At</th>
                    <th>Dossier PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--primary-light)', fontFamily: 'monospace' }}>
                          {c.claim_ref}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                          {c.order_ref}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{c.product_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer: {c.customer_name}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '0.8rem' }}>
                          {c.claim_type}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--danger)' }}>
                          ₹{c.loss_amount?.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success">
                          {c.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {c.created_at}
                      </td>
                      <td>
                        {c.pdf_report_path ? (
                          <a
                            href={`http://localhost:5000${c.pdf_report_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                          >
                            <Download size={14} />
                            <span>Download PDF</span>
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generating...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal: Compile Dispute Dossier */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '560px' }}>
              <div className="modal-header">
                <h3 className="modal-title">Compile Tamper-Evident Dispute Dossier</h3>
                <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="auth-alert error" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="auth-alert success" style={{ marginBottom: '1rem' }}>
                  <CheckCircle2 size={18} />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleCreateClaim}>
                <div className="form-group">
                  <label className="form-label">Select Inspected Return Parcel *</label>
                  <select
                    className="form-input"
                    value={selectedReturnId}
                    onChange={(e) => handleReturnSelect(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Return Request --</option>
                    {returns.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.return_ref} — {r.order_ref} ({r.product_name}) [{r.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Marketplace Claim Type *</label>
                  <select
                    className="form-input"
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    required
                  >
                    <option value="Swapped / Damaged Returned Goods">Swapped / Damaged Returned Goods</option>
                    <option value="Wrong Product Dispatched Back by Customer">Wrong Product Dispatched Back by Customer</option>
                    <option value="Missing Accessories / Empty Box Received">Missing Accessories / Empty Box Received</option>
                    <option value="Used & Worn Garment / Electronic">Used & Worn Garment / Electronic</option>
                    <option value="In-Transit Courier Pilferage / Tampered Seal">In-Transit Courier Pilferage / Tampered Seal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Claim Loss Amount (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter financial damage amount"
                    value={lossAmount}
                    onChange={(e) => setLossAmount(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Total product invoice price plus reverse shipping fees to be claimed from marketplace seller protection.
                  </span>
                </div>

                <div style={{ background: 'var(--bg-input)', padding: '0.85rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  <strong>What this will do:</strong> ReportLab will compile an immutable PDF dossier embedding the pre-dispatch evidence photos, return parcel photos, OpenCV histogram disparity score, physical checklist tags, and seller declaration ready for platform submission.
                </div>

                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Generating PDF Dossier...' : 'Generate Dispute Dossier PDF'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
