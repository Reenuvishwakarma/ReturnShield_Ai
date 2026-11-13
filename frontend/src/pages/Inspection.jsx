import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { returnService, inspectionService } from '../services/api';
import Sidebar from '../components/Sidebar';
import RiskBadge from '../components/RiskBadge';
import { 
  Eye, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Camera, 
  FileText, 
  Check, 
  X, 
  ChevronRight, 
  Info,
  Maximize2
} from 'lucide-react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Inspection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryReturnId = searchParams.get('id');

  const [returnList, setReturnList] = useState([]);
  const [selectedReturnId, setSelectedReturnId] = useState(queryReturnId || '');
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Inspection Checklist Form State
  const [physicalCondition, setPhysicalCondition] = useState('Good condition');
  const [tagCondition, setTagCondition] = useState('Intact');
  const [sealCondition, setSealCondition] = useState('Broken');
  const [observations, setObservations] = useState('');

  // Photo modal preview
  const [previewImage, setPreviewImage] = useState(null);

  // Load return requests list
  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const res = await returnService.list();
        const retList = res.data.returns || [];
        setReturnList(retList);
        if (!selectedReturnId && retList.length > 0) {
          setSelectedReturnId(retList[0].id);
          setSearchParams({ id: retList[0].id });
        }
      } catch (err) {
        console.error("Failed to load return requests:", err);
      }
    };
    fetchReturns();
  }, []);

  // Load workspace data when selectedReturnId changes
  useEffect(() => {
    if (!selectedReturnId) return;

    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        setSaveSuccess('');
        setSaveError('');
        const res = await inspectionService.getWorkspace(selectedReturnId);
        setWorkspace(res.data);

        // Pre-fill existing inspection if recorded
        if (res.data.inspection) {
          setPhysicalCondition(res.data.inspection.physical_condition || 'Good condition');
          setTagCondition(res.data.inspection.tag_condition || 'Intact');
          setSealCondition(res.data.inspection.seal_condition || 'Broken');
          setObservations(res.data.inspection.observations || '');
        } else {
          setPhysicalCondition('Good condition');
          setTagCondition('Intact');
          setSealCondition('Broken');
          setObservations('');
        }
      } catch (err) {
        console.error("Failed to load inspection workspace:", err);
        setSaveError("Could not retrieve inspection workspace details.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [selectedReturnId]);

  const handleReturnChange = (newId) => {
    setSelectedReturnId(newId);
    setSearchParams({ id: newId });
  };

  const handleSaveInspection = async (e) => {
    e.preventDefault();
    if (!selectedReturnId) return;

    try {
      setSaving(true);
      setSaveError('');
      setSaveSuccess('');

      const payload = {
        physical_condition: physicalCondition,
        tag_condition: tagCondition,
        seal_condition: sealCondition,
        observations: observations
      };

      const res = await inspectionService.recordInspection(selectedReturnId, payload);
      setSaveSuccess('Inspection audit recorded and AI risk profile updated successfully!');
      
      // Update local workspace state
      setWorkspace(prev => ({
        ...prev,
        inspection: res.data.inspection,
        risk_assessment: res.data.risk_assessment,
        return_request: { ...prev.return_request, status: 'Inspected' }
      }));
    } catch (err) {
      console.error(err);
      setSaveError(err.response?.data?.message || 'Failed to save inspection audit.');
    } finally {
      setSaving(false);
    }
  };

  const order = workspace?.order;
  const dispatchEvidence = workspace?.dispatch_evidence;
  const returnReq = workspace?.return_request;
  const inspection = workspace?.inspection;
  const risk = workspace?.risk_assessment;

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={logout} />

      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-greeting">Side-by-Side Return Inspection Studio</h1>
            <p className="dashboard-subtitle">
              Verify returned parcel authenticity against original dispatch evidence and compute visual disparity.
            </p>
          </div>
          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Return Parcel:</span>
            <select
              className="form-input"
              style={{ width: 'auto', minWidth: '220px' }}
              value={selectedReturnId}
              onChange={(e) => handleReturnChange(e.target.value)}
            >
              {returnList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.return_ref} — {r.product_name} ({r.status})
                </option>
              ))}
            </select>
          </div>
        </header>

        {loading ? (
          <div className="empty-state" style={{ minHeight: '400px' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p>Loading side-by-side evidence images and vision analysis...</p>
          </div>
        ) : !workspace ? (
          <div className="empty-state">
            <RotateCcw size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3>No Return Selected</h3>
            <p style={{ color: 'var(--text-muted)' }}>Please select a return parcel from the list above or log a new return.</p>
            <Link to="/returns" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Go to Return Log
            </Link>
          </div>
        ) : (
          <div className="dashboard-content">
            {/* Notifications */}
            {saveSuccess && (
              <div className="auth-alert success" style={{ marginBottom: '1rem' }}>
                <CheckCircle2 size={18} />
                <span>{saveSuccess}</span>
              </div>
            )}
            {saveError && (
              <div className="auth-alert error" style={{ marginBottom: '1rem' }}>
                <AlertTriangle size={18} />
                <span>{saveError}</span>
              </div>
            )}

            {/* Top Info Bar */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Order Reference:
                  </span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                    {order?.order_ref}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Customer: <strong>{order?.customer_name}</strong> | Item: <strong>{order?.product?.name}</strong> (₹{order?.order_amount})
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Return Status</div>
                    <span className={`badge ${returnReq?.status === 'Inspected' ? 'badge-success' : 'badge-warning'}`}>
                      {returnReq?.status}
                    </span>
                  </div>
                  {risk && (
                    <div style={{ textAlign: 'right', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assessed Risk</div>
                      <RiskBadge level={risk.risk_level} score={risk.risk_score} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Side-by-Side Dual Column Evidence Workspace */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Left Column: Outgoing Dispatch Evidence */}
              <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Camera size={18} style={{ color: 'var(--primary-light)' }} />
                    Original Dispatch Evidence
                  </h3>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                    PRE-TRANSIT PROOF
                  </span>
                </div>

                {dispatchEvidence ? (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Token: <code style={{ color: 'var(--primary-light)' }}>{dispatchEvidence.evidence_token}</code>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span className={`badge ${dispatchEvidence.packaging_seal_intact ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
                        Seal: {dispatchEvidence.packaging_seal_intact ? 'Intact' : 'Not Intact'}
                      </span>
                      <span className={`badge ${dispatchEvidence.tag_attached ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
                        Security Tag: {dispatchEvidence.tag_attached ? 'Attached' : 'Missing'}
                      </span>
                    </div>

                    {/* Image Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                      {dispatchEvidence.images && dispatchEvidence.images.length > 0 ? (
                        dispatchEvidence.images.map((imgUrl, idx) => (
                          <div 
                            key={idx} 
                            style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '140px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                            onClick={() => setPreviewImage(`http://localhost:5000${imgUrl}`)}
                          >
                            <img 
                              src={`http://localhost:5000${imgUrl}`} 
                              alt={`Dispatch Evidence ${idx+1}`} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.7rem' }}>
                              <Maximize2 size={12} />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', background: 'var(--bg-app)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                          No dispatch photos were captured for this order.
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '6px' }}>
                      <strong>Dispatch Notes:</strong> {dispatchEvidence.condition_notes || 'No dispatch notes recorded.'}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <ShieldAlert size={40} style={{ margin: '0 auto 0.75rem auto', color: 'var(--warning)' }} />
                    <p style={{ fontWeight: 500 }}>No Dispatch Verification Found</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>This order was shipped without ReturnShield pre-dispatch photographic tagging.</p>
                  </div>
                )}
              </div>

              {/* Right Column: Received Return Parcel */}
              <div className="card" style={{ borderTop: '4px solid var(--warning)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RotateCcw size={18} style={{ color: 'var(--warning)' }} />
                    Received Return Parcel
                  </h3>
                  <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                    POST-RETURN AUDIT
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Return ID: <code style={{ color: 'var(--text-primary)' }}>{returnReq?.return_ref}</code>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem', marginRight: '0.5rem' }}>
                      Claimed Reason: {returnReq?.return_reason}
                    </span>
                  </div>

                  {/* Return Images Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    {returnReq?.images && returnReq.images.length > 0 ? (
                      returnReq.images.map((imgUrl, idx) => (
                        <div 
                          key={idx} 
                          style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '140px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                          onClick={() => setPreviewImage(`http://localhost:5000${imgUrl}`)}
                        >
                          <img 
                            src={`http://localhost:5000${imgUrl}`} 
                            alt={`Return Parcel ${idx+1}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.7rem' }}>
                            <Maximize2 size={12} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', background: 'var(--bg-app)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                        No intake photos uploaded yet. You can upload photos in Return Log.
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '6px' }}>
                    <strong>Customer Remarks:</strong> {returnReq?.customer_remarks || 'None provided.'}
                  </div>
                </div>
              </div>
            </div>

            {/* OpenCV Computer Vision Similarity & AI Analysis */}
            {inspection?.similarity_score !== undefined && inspection?.similarity_score !== null && (
              <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: inspection.similarity_score < 0.6 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: inspection.similarity_score < 0.6 ? 'var(--danger)' : 'var(--success)' }}>
                        {Math.round(inspection.similarity_score * 100)}%
                      </span>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Computer Vision Similarity Index (Histogram + SSIM)
                        <span className={`badge ${inspection.similarity_score < 0.6 ? 'badge-danger' : 'badge-success'}`}>
                          {inspection.similarity_score < 0.6 ? 'High Disparity / Swapped Item' : 'Visual Match'}
                        </span>
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {inspection.similarity_notes || 'Automated structural and color comparison between dispatch parcel and returned parcel.'}
                      </p>
                    </div>
                  </div>

                  {inspection.verified_damaged && (
                    <Link to={`/claims?return_id=${returnReq?.id}`} className="btn btn-primary btn-sm">
                      <FileText size={16} />
                      <span>Create Dispute Dossier</span>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Inspection Checklist Form */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={18} style={{ color: 'var(--primary-light)' }} />
                Physical Inspection Audit Findings
              </h3>

              <form onSubmit={handleSaveInspection}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Physical Product Condition *</label>
                    <select
                      className="form-input"
                      value={physicalCondition}
                      onChange={(e) => setPhysicalCondition(e.target.value)}
                      required
                    >
                      <option value="Good condition">Good condition (Resaleable)</option>
                      <option value="Used/worn">Used / Worn (Signs of heavy usage)</option>
                      <option value="Damaged">Damaged / Broken / Smashed</option>
                      <option value="Wrong product">Wrong product (Completely swapped)</option>
                      <option value="Missing components">Missing components / Empty box</option>
                      <option value="Needs manual review">Needs manual review</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Security Tag Condition *</label>
                    <select
                      className="form-input"
                      value={tagCondition}
                      onChange={(e) => setTagCondition(e.target.value)}
                      required
                    >
                      <option value="Intact">Intact & Untampered</option>
                      <option value="Broken">Broken / Cut</option>
                      <option value="Missing">Completely Missing</option>
                      <option value="Swapped">Swapped with Counterfeit Tag</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Packaging Seal Status *</label>
                    <select
                      className="form-input"
                      value={sealCondition}
                      onChange={(e) => setSealCondition(e.target.value)}
                      required
                    >
                      <option value="Broken">Broken / Cut Open</option>
                      <option value="Intact">Intact / Unopened</option>
                      <option value="Tampered">Resealed / Tampered Tape</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Inspector Detailed Observations & Remarks</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Enter physical observations, e.g.: Received counterfeit product with different serial number, seal was taped over with transparent tape..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Saving updates the return status to <strong>Inspected</strong> and executes the Explainable Risk Engine.
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Computing AI Disparity & Saving...' : 'Save Inspection Audit'}
                  </button>
                </div>
              </form>
            </div>

            {/* Explainable Risk Assessment Summary Card */}
            {risk && (
              <div className="card" style={{ borderLeft: `5px solid ${risk.risk_level === 'HIGH' ? 'var(--danger)' : risk.risk_level === 'MEDIUM' ? 'var(--warning)' : 'var(--success)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldAlert size={18} style={{ color: risk.risk_level === 'HIGH' ? 'var(--danger)' : 'var(--warning)' }} />
                      Explainable AI Risk Profile
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Evaluated on customer history, item value, visual disparity, and physical audit.
                    </p>
                  </div>
                  <RiskBadge level={risk.risk_level} score={risk.risk_score} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Rule Breakdown & Contributing Factors:</span>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {risk.reasons && risk.reasons.map((r, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: 'var(--bg-input)', padding: '0.85rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Recommended Action:</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {risk.recommended_action}
                    </div>
                  </div>

                  <Link to={`/claims?return_id=${returnReq?.id}`} className="btn btn-secondary btn-sm">
                    <FileText size={16} />
                    <span>Proceed to Claim Dossier</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Fullscreen Preview Modal */}
        {previewImage && (
          <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
            <div style={{ maxWidth: '85vw', maxHeight: '85vh', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setPreviewImage(null)} 
                style={{ position: 'absolute', top: '-2.5rem', right: 0, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={28} />
              </button>
              <img 
                src={previewImage} 
                alt="Enlarged Evidence Preview" 
                style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
