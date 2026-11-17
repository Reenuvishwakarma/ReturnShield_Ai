import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/api';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Trash2, Search, X, Check, AlertCircle } from 'lucide-react';
import './Dashboard.css';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function Products() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState("Women's Ethnic");
  const [sellingPrice, setSellingPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.list();
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('sku', sku);
      fd.append('category', category);
      fd.append('selling_price', sellingPrice);
      fd.append('description', description);
      if (imageFile) fd.append('image', imageFile);
      await productService.create(fd);
      setSuccess('Product registered successfully into catalog.');
      setShowModal(false);
      setName(''); setSku(''); setSellingPrice(''); setDescription(''); setImageFile(null);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.delete(id);
      loadProducts();
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={logout} />
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-greeting">Product Catalog</h1>
            <p className="dashboard-subtitle">Manage catalog SKUs, selling prices, and dispatch reference specs</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Add Product</span>
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
                placeholder="Search products by name, SKU, or category..."
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
              <h3 className="heading-card">Active Catalog Items ({filtered.length})</h3>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
                <p>Loading catalog items...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <Package size={36} className="empty-state-icon" />
                <p>No products match your search query.</p>
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Selling Price</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((prod) => (
                    <tr key={prod.id}>
                      <td><span className="badge badge-neutral" style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{prod.sku}</span></td>
                      <td><strong style={{ color: 'var(--text-primary)' }}>{prod.name}</strong></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{prod.category}</td>
                      <td><strong style={{ color: 'var(--color-violet)' }}>₹{prod.selling_price.toLocaleString()}</strong></td>
                      <td style={{ maxWidth: '280px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{prod.description || '—'}</td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '0.3rem 0.6rem' }}
                          onClick={() => handleDelete(prod.id)}
                          title="Delete SKU"
                        >
                          <Trash2 size={14} />
                        </button>
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
                style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <h3 className="heading-card" style={{ marginBottom: '0.2rem' }}>Add Product to Catalog</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Register a new SKU for dispatch evidence coverage</p>
                  </div>
                  <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)', padding: '0.3rem', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                {error && (
                  <div className="auth-alert error" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={16} /> <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleCreate}>
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input type="text" required className="form-input" placeholder="e.g. Printed Georgette Saree" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU Identifier</label>
                    <input type="text" required className="form-input" placeholder="e.g. SAREE-GEO-RED-01" value={sku} onChange={(e) => setSku(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Women's Ethnic">Women's Ethnic</option>
                      <option value="Men's Apparel">Men's Apparel</option>
                      <option value="Luggage & Accessories">Luggage & Accessories</option>
                      <option value="Consumer Electronics">Consumer Electronics</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                      <option value="Footwear">Footwear</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Selling Price (INR)</label>
                    <input type="number" step="0.01" required className="form-input" placeholder="899.00" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description / Features</label>
                    <textarea rows={3} className="form-input" placeholder="Material specs, tag placement guidelines, packaging note..." value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Saving...' : 'Save Product'}
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
