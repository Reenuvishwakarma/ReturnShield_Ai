import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dispatchService, orderService } from '../services/api';
import Sidebar from '../components/Sidebar';
import { Camera, QrCode, Upload, Check, AlertCircle, CheckCircle2, FileText, Image as ImageIcon } from 'lucide-react';
import './Dashboard.css';

export default function DispatchVerification() {
  const { user, logout } = useAuth();
  const [evidenceList, setEvidenceList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [conditionNotes, setConditionNotes] = useState('Product inspected in brand new condition. Security tag attached and polybag sealed.');
  const [sealIntact, setSealIntact] = useState(true);
  const [tagAttached, setTagAttached] = useState(true);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [latestToken, setLatestToken] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eRes, oRes] = await Promise.all([
        dispatchService.list(),
        orderService.list()
      ]);
      setEvidenceList(eRes.data.dispatch_records);
      const unprotected = oRes.data.orders.filter(o => !o.has_dispatch_evidence);
      setOrders(unprotected);
      if (unprotected.length > 0 && !selectedOrderId) {
        setSelectedOrderId(unprotected[0].id);
      }
    } catch (err) {
      console.error(err);
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
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('order_id', selectedOrderId);
      fd.append('condition_notes', conditionNotes);
      fd.append('packaging_seal_intact', sealIntact);
      fd.append('tag_attached', tagAttached);
      files.forEach((f) => fd.append('images', f));

      const res = await dispatchService.create(fd);
      setSuccess('Dispatch evidence token and verification QR code generated!');
      setLatestToken(res.data.evidence);
      setFiles([]);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording dispatch evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={logout} />

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-greeting">Dispatch Verification Studio</h1>
            <p className="dashboard-subtitle">Generate tamper-evident tokens, QR codes, and multi-photo packing proofs</p>
          </div>
        </header>

        <div className="dashboard-content">
          {success && (
            <div className="auth-alert" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
              <Check size={18} /> <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="auth-alert error">
              <AlertCircle size={18} /> <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
            {/* Record New Evidence Form */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <Camera size={20} className="text-accent" />
                <h3 className="heading-card">Capture Parcel Dispatch Proof</h3>
              </div>

              {orders.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                  <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 0.5rem auto' }} />
                  <p>All currently registered orders have dispatch evidence recorded!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Select Order to Protect</label>
                    <select
                      className="form-input"
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      required
                    >
                      {orders.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.order_ref} — {o.customer_name} ({o.product_name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Packing Condition Observations</label>
                    <textarea
                      rows={3}
                      className="form-input"
                      value={conditionNotes}
                      onChange={(e) => setConditionNotes(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={sealIntact} 
                        onChange={(e) => setSealIntact(e.target.checked)} 
                      />
                      <span>Packaging Seal Intact</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={tagAttached} 
                        onChange={(e) => setTagAttached(e.target.checked)} 
                      />
                      <span>Brand Security Tag Attached</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Packing Photographs (Product, Tag & Shipping Label)</label>
                    <div style={{
                      border: '2px dashed var(--border-strong)',
                      padding: '1.5rem',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                      background: '#f8fafc'
                    }}>
                      <Upload size={28} style={{ color: 'var(--color-accent-500)', margin: '0 auto 0.5rem auto' }} />
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        id="evidence-file-input"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="evidence-file-input" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                        Browse Images
                      </label>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        {files.length > 0 ? `${files.length} photo(s) selected` : 'PNG, JPG or WEBP (Max 16MB)'}
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
                    {submitting ? 'Generating Verification...' : 'Generate Dispatch Evidence & QR'}
                  </button>
                </form>
              )}
            </div>

            {/* Generated QR Verification Card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <QrCode size={20} className="text-accent" />
                <h3 className="heading-card">Verification Token & QR</h3>
              </div>

              {latestToken ? (
                <div style={{ textAlign: 'center', display: 'flex', flex_direction: 'column', alignItems: 'center', gap: '1rem' }}>
                  <img 
                    src={`http://127.0.0.1:5000${latestToken.qr_code_url}`} 
                    alt="Evidence QR Code" 
                    style={{ width: '170px', height: '170px', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '6px' }}
                  />
                  <div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                      {latestToken.evidence_token}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Timestamp: {new Date(latestToken.captured_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '3rem 1rem' }}>
                  <QrCode size={40} className="empty-state-icon" />
                  <p>Submit dispatch proof to generate a tamper-evident QR verification record.</p>
                </div>
              )}
            </div>
          </div>

          {/* Saved Dispatch Evidence Records */}
          <div className="table-container" style={{ marginTop: '2rem' }}>
            <div className="table-header">
              <h3 className="heading-card">Recorded Dispatch Proofs ({evidenceList.length})</h3>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
                <p>Loading dispatch evidence archives...</p>
              </div>
            ) : evidenceList.length === 0 ? (
              <div className="empty-state">
                <p>No dispatch evidence records saved yet.</p>
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Evidence Token</th>
                    <th>Order Ref</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Integrity Checks</th>
                    <th>QR Code</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {evidenceList.map((e) => (
                    <tr key={e.id}>
                      <td><span className="badge badge-neutral">{e.evidence_token}</span></td>
                      <td><strong>{e.order_ref}</strong></td>
                      <td>{e.customer_name}</td>
                      <td>{e.product_name}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span className={`badge ${e.packaging_seal_intact ? 'badge-risk-low' : 'badge-risk-high'}`}>
                            Seal {e.packaging_seal_intact ? 'Intact' : 'Broken'}
                          </span>
                          <span className={`badge ${e.tag_attached ? 'badge-risk-low' : 'badge-risk-high'}`}>
                            Tag {e.tag_attached ? 'Attached' : 'Missing'}
                          </span>
                        </div>
                      </td>
                      <td>
                        {e.qr_code_url && (
                          <a href={`http://127.0.0.1:5000${e.qr_code_url}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                            View QR
                          </a>
                        )}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(e.captured_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
