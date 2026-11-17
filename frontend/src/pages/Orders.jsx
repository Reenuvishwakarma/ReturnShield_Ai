import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService, productService } from '../services/api';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Search, X, Check, AlertCircle, Camera, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Orders() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [orderRef, setOrderRef] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderAmount, setOrderAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [oRes, pRes] = await Promise.all([orderService.list(), productService.list()]);
      setOrders(oRes.data.orders);
      setProducts(pRes.data.products);
      if (pRes.data.products.length > 0 && !productId) {
        setProductId(pRes.data.products[0].id);
        setOrderAmount(pRes.data.products[0].selling_price);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleProductSelect = (id) => {
    setProductId(id);
    const selected = products.find(p => p.id === parseInt(id));
    if (selected) setOrderAmount(selected.selling_price * quantity);
  };

  const handleQtyChange = (qty) => {
    setQuantity(qty);
    const selected = products.find(p => p.id === parseInt(productId));
    if (selected) setOrderAmount(selected.selling_price * qty);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await orderService.create({
        order_ref: orderRef,
        customer_name: customerName,
        product_id: parseInt(productId),
        quantity: parseInt(quantity),
        order_amount: parseFloat(orderAmount)
      });
      setSuccess('Order registered successfully. You can now record dispatch evidence.');
      setShowModal(false);
      setOrderRef(''); setCustomerName('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording order.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = orders.filter(o =>
    o.order_ref.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.product_name.toLowerCase().includes(search.toLowerCase()) ||
    o.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={logout} />
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-greeting">Order Management</h1>
            <p className="dashboard-subtitle">Track customer orders, dispatch status, and evidence coverage</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>New Order</span>
          </button>
        </header>

        <div className="dashboard-content">
          {success && (
            <motion.div
              className="auth-alert success"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: '1rem' }}
            >
              <Check size={18} /> <span>{success}</span>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card" style={{ padding: '0.85rem 1.1rem', marginBottom: '1.25rem' }}
          >
            <div className="input-with-icon">
              <Search size={18} className="field-icon" />
              <input
                type="text"
                className="form-input with-left-icon"
                placeholder="Search by order ID, customer name, SKU or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </motion.div>

          <motion.div
            className="table-container"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="table-header">
              <h3 className="heading-card">Registered Orders ({filtered.length})</h3>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
                <p>Loading orders from database...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={36} className="empty-state-icon" />
                <p>No orders recorded yet.</p>
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order Ref</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Qty & Amount</th>
                    <th>Status</th>
                    <th>Evidence Token</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id}>
                      <td><strong style={{ color: 'var(--color-violet)', fontFamily: 'monospace', fontSize: '0.85rem' }}>{o.order_ref}</strong></td>
                      <td>{o.customer_name}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{o.product_name}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{o.product_sku}</span>
                      </td>
                      <td>
                        <strong>₹{o.order_amount.toLocaleString()}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {o.quantity}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{o.status}</span>
                      </td>
                      <td>
                        {o.has_dispatch_evidence ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>
                            <CheckCircle2 size={14} /> {o.evidence_token}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--warning)', fontSize: '0.8rem', fontWeight: 500 }}>Unprotected</span>
                        )}
                      </td>
                      <td>
                        {!o.has_dispatch_evidence ? (
                          <Link to="/dispatch" className="btn btn-secondary btn-sm" style={{ gap: '4px' }}>
                            <Camera size={13} /> Capture
                          </Link>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 500 }}>✓ Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {showModal && (
            <motion.div
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            >
              <motion.div
                className="card"
                style={{ width: '100%', maxWidth: '500px' }}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <h3 className="heading-card" style={{ marginBottom: '0.2rem' }}>Register Dispatched Order</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Log an order to enable dispatch evidence capture</p>
                  </div>
                  <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)', padding: '0.3rem', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                {error && (
                  <div className="auth-alert error">
                    <AlertCircle size={16} /> <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleCreate}>
                  <div className="form-group">
                    <label className="form-label">Marketplace Order Reference</label>
                    <input type="text" required className="form-input" placeholder="e.g. MEESH-ORD-99410" value={orderRef} onChange={(e) => setOrderRef(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input type="text" required className="form-input" placeholder="e.g. Simran Kaur" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Select Dispatched Product</label>
                    <select className="form-input" value={productId} onChange={(e) => handleProductSelect(e.target.value)} required>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku}) — ₹{p.selling_price}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <input type="number" min={1} required className="form-input" value={quantity} onChange={(e) => handleQtyChange(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Order Total (INR)</label>
                      <input type="number" step="0.01" required className="form-input" value={orderAmount} onChange={(e) => setOrderAmount(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Registering...' : 'Register Order'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
