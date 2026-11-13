import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { returnService, orderService } from '../services/api';
import Sidebar from '../components/Sidebar';
import RiskBadge from '../components/RiskBadge';
import { 
  RotateCcw, 
  Plus, 
  Search, 
  X, 
  Check, 
  AlertCircle, 
  Eye, 
  Upload, 
  FileText, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Returns() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [orderRef, setOrderRef] = useState('');
  const [returnReason, setReturnReason] = useState('Wrong product / swapped item');
  const [customerRemarks, setCustomerRemarks] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, oRes] = await Promise.all([
        returnService.list(),
        orderService.list()
      ]);
      setReturns(rRes.data.returns || []);
      setOrders(oRes.data.orders || []);
      if (oRes.data.orders?.length > 0 && !orderRef) {
        setOrderRef(oRes.data.orders[0].order_ref);
      }
    } catch (err) {
      console.error("Error loading returns data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!orderRef) {
      setError('Please select an order reference.');
      return;
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('order_ref', orderRef);
      fd.append('return_reason', returnReason);
      fd.append('customer_remarks', customerRemarks);
      files.forEach((file) => {
        fd.append('images', file);
      });

      await returnService.create(fd);
      setSuccess('Return request registered and preliminary risk score generated!');
      setCustomerRemarks('');
      setFiles([]);
      await loadData();
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to register return request.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReturns = returns.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.return_ref?.toLowerCase().includes(q) ||
      r.order_ref?.toLowerCase().includes(q) ||
      r.product_name?.toLowerCase().includes(q) ||
      r.return_reason?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={logout} />

      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-greeting">Return Requests Log</h1>
            <p className="dashboard-subtitle">
              Monitor incoming parcel returns, track inspection readiness, and initiate fraud checks.
            </p>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={16} />
              <span>Log Return Intake</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Quick Metrics Bar */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <span className="stat-card-title">Total Returns</span>
              <span className="stat-card-value">{returns.length}</span>
              <span className="stat-card-subtitle">Parcels received back</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-title">Pending Inspection</span>
              <span className="stat-card-value" style={{ color: 'var(--warning)' }}>
                {returns.filter((r) => !r.is_inspected).length}
              </span>
              <span className="stat-card-subtitle">Awaiting physical audit</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-title">Inspected & Verified</span>
              <span className="stat-card-value" style={{ color: 'var(--success)' }}>
                {returns.filter((r) => r.is_inspected).length}
              </span>
              <span className="stat-card-subtitle">Completed evidence match</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-title">High Risk Flagged</span>
              <span className="stat-card-value" style={{ color: 'var(--danger)' }}>
                {returns.filter((r) => r.risk_level === 'HIGH').length}
              </span>
              <span className="stat-card-subtitle">Likely fraudulent return</span>
            </div>
          </div>

          {/* Search & Actions Bar */}
          <div className="filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="search-input-wrapper" style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by Return Ref, Order ID, Product name, or Reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Returns Table */}
          <div className="table-container">
            {loading ? (
              <div className="empty-state">
                <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
                <p>Loading return records...</p>
              </div>
            ) : filteredReturns.length === 0 ? (
              <div className="empty-state">
                <RotateCcw size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No Return Requests Found</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0.5rem auto 1.5rem auto' }}>
                  {search ? 'No return records match your search criteria.' : 'When customers or courier logistics initiate parcel returns, log them here to begin evidence inspection.'}
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                  <Plus size={16} /> Log First Return Intake
                </button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Return Ref</th>
                    <th>Order Ref</th>
                    <th>Product</th>
                    <th>Claimed Reason</th>
                    <th>Risk Score</th>
                    <th>Status</th>
                    <th>Date Received</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturns.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>
                          {r.return_ref}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                          {r.order_ref}
                        </span>
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.product_name}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '0.8rem' }}>
                          {r.return_reason}
                        </span>
                      </td>
                      <td>
                        <RiskBadge level={r.risk_level || 'LOW'} score={r.risk_score} />
                      </td>
                      <td>
                        <span className={`badge ${r.is_inspected ? 'badge-success' : 'badge-warning'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {r.return_date || 'N/A'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link 
                            to={`/inspection?id=${r.id}`} 
                            className="btn btn-secondary btn-sm" 
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                            title="Side-by-side inspection"
                          >
                            <Eye size={14} />
                            <span>{r.is_inspected ? 'View Audit' : 'Inspect'}</span>
                          </Link>
                          {r.is_inspected && (
                            <Link 
                              to={`/claims?return_id=${r.id}`} 
                              className="btn btn-outline btn-sm" 
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                              title="Create Dossier"
                            >
                              <FileText size={14} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal: Log Return Intake */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '580px' }}>
              <div className="modal-header">
                <h3 className="modal-title">Log Incoming Return Intake</h3>
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
                  <Check size={18} />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Associated Marketplace Order *</label>
                  <select
                    className="form-input"
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                    required
                  >
                    <option value="">-- Select Order --</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.order_ref}>
                        {o.order_ref} — {o.product?.name || 'Product'} (₹{o.order_amount}) [{o.customer_name}]
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Select the order that this returned parcel is claimed against.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Customer / Marketplace Return Reason *</label>
                  <select
                    className="form-input"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    required
                  >
                    <option value="Wrong product / swapped item">Wrong product / swapped item</option>
                    <option value="Product damaged / broken">Product damaged / broken</option>
                    <option value="Missing accessories / empty box">Missing accessories / empty box</option>
                    <option value="Used / worn item returned">Used / worn item returned</option>
                    <option value="Defective / does not turn on">Defective / does not turn on</option>
                    <option value="Size / fit issue">Size / fit issue</option>
                    <option value="Customer changed mind / not needed">Customer changed mind / not needed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Customer / Courier Remarks</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    placeholder="e.g. Customer claimed package was opened upon receipt, or item stopped working..."
                    value={customerRemarks}
                    onChange={(e) => setCustomerRemarks(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Received Parcel / Product Photos</label>
                  <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '1.25rem', textAlign: 'center', background: 'var(--bg-input)' }}>
                    <Upload size={24} style={{ color: 'var(--primary-light)', margin: '0 auto 0.5rem auto' }} />
                    <input
                      type="file"
                      id="return-images-input"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="return-images-input" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-block' }}>
                      Choose Return Photos
                    </label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      {files.length > 0 ? `${files.length} photo(s) selected` : 'Upload unpackaging or parcel condition photos for side-by-side comparison.'}
                    </p>
                  </div>
                </div>

                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Registering Return...' : 'Register Return'}
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
