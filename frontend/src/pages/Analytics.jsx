import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { motion } from 'framer-motion';
import { 
  TrendingUp, IndianRupee, AlertTriangle, RotateCcw, ShoppingCart,
  PieChart as PieIcon, Package, ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts';
import './Dashboard.css';

const PIE_COLORS = ['#7957F5', '#42D9E8', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'];
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1A1D3A', border: '1px solid rgba(121, 87, 245, 0.3)',
      borderRadius: '10px', padding: '0.6rem 0.9rem', fontSize: '0.82rem',
      color: '#F3F4F9', boxShadow: '0 8px 24px rgba(17,20,43,0.3)'
    }}>
      {label && <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', fontSize: '0.75rem' }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#7957F5', fontWeight: 600 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [deep, setDeep] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [sumRes, deepRes] = await Promise.all([
        dashboardService.getSummary(), dashboardService.getDeepAnalytics()
      ]);
      setSummary(sumRes.data);
      setDeep(deepRes.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAnalytics(); }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={logout} />
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-greeting">Loss Analytics & Return Telemetry</h1>
            <p className="dashboard-subtitle">Aggregate return ratios, claim recovery totals, and high-frequency defect patterns.</p>
          </div>
        </header>

        {loading ? (
          <div className="empty-state" style={{ minHeight: '400px' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p>Compiling cross-marketplace return loss statistics...</p>
          </div>
        ) : (
          <div className="dashboard-content">
            <motion.div className="stats-grid" style={{ marginBottom: '1.75rem' }} variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div variants={fadeUp}>
                <StatCard title="Total Orders" value={summary?.total_orders || 0} icon={ShoppingCart} subtitle="All fulfilled orders" accent="violet" />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatCard title="Return Rate" value={`${summary?.return_rate || 0}%`} icon={RotateCcw}
                  subtitle={`${summary?.total_returns || 0} total returns`} accent="amber"
                  trend={summary?.return_rate > 15 ? 'up' : 'down'} trendValue={summary?.return_rate > 15 ? 'High' : 'Normal'} />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatCard title="Suspicious Returns" value={summary?.suspicious_returns || 0} icon={AlertTriangle}
                  subtitle="Flagged by AI Risk Engine" accent="rose" trend="up" trendValue="Review" />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatCard title="Estimated Loss" value={`₹${summary?.estimated_loss?.toLocaleString() || 0}`}
                  icon={IndianRupee} subtitle="From damaged / swapped returns" accent="cyan" />
              </motion.div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                    <TrendingUp size={18} style={{ color: 'var(--color-violet)' }} /> Monthly Return Volume
                  </h3>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>Recent Months</span>
                </div>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={summary?.trend_data || []}>
                      <defs>
                        <linearGradient id="analyticsBarGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7957F5" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#42D9E8" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="returns" fill="url(#analyticsBarGrad)" radius={[6, 6, 0, 0]} name="Returns" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.35 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                    <PieIcon size={18} style={{ color: 'var(--color-cyan)' }} /> Return Reasons Breakdown
                  </h3>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>Customer Stated</span>
                </div>
                <div style={{ width: '100%', height: 260 }}>
                  {deep?.reason_distribution && deep.reason_distribution.length > 0 ? (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={deep.reason_distribution} dataKey="count" nameKey="reason" cx="50%" cy="50%"
                          outerRadius={85} innerRadius={35} paddingAngle={3}
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {deep.reason_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8}
                          formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{value.slice(0, 22)}{value.length > 22 ? '...' : ''}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ color: 'var(--text-muted)' }}>No reason data recorded yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            <motion.div className="card" style={{ marginBottom: '1.5rem' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.4 }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <Package size={18} style={{ color: 'var(--color-violet)' }} /> Product-Level Loss & Return Performance
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Track which SKUs suffer from abnormal return frequency and disproportionate financial damage.
                </p>
              </div>
              <div className="table-container" style={{ margin: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product Name</th><th>SKU</th><th>Dispatched</th><th>Returned</th>
                      <th>Return Rate</th><th>Total Loss</th><th>Risk Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deep?.product_summary && deep.product_summary.length > 0 ? (
                      deep.product_summary.map((p, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{p.sku}</td>
                          <td>{p.dispatched}</td>
                          <td>{p.returned}</td>
                          <td>
                            <span className={`badge ${p.return_rate > 25 ? 'badge-danger' : p.return_rate > 10 ? 'badge-warning' : 'badge-success'}`}>
                              {p.return_rate}%
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: p.loss > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>₹{p.loss.toLocaleString()}</td>
                          <td>
                            {p.return_rate > 25 ? (
                              <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <AlertTriangle size={14} /> High Risk SKU
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <ShieldCheck size={14} /> Healthy
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No product return statistics accumulated yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div className="card" style={{ background: 'linear-gradient(135deg, rgba(121, 87, 245, 0.06) 0%, rgba(17, 20, 43, 0.5) 100%)', border: '1px solid rgba(121, 87, 245, 0.18)' }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.45 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                🛡️ ReturnShield Automated Recommendations for Your Store
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                {[
                  { title: '1. Tag High-Risk SKUs with Tamper-Tape', body: 'For products with over 20% return rate, apply tamper-evident void tape and capture dispatch photo with QR code visible.' },
                  { title: '2. Fast-Track Dossier Submissions', body: 'Marketplaces require claims within 72 hours of return delivery. Download the ReturnShield PDF dossier immediately upon inspection.' },
                  { title: '3. Block Serial Returners', body: 'Customers flagged with multiple returns on expensive items should be marked for mandatory unboxing video inspection.' },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'var(--bg-card)', padding: '1rem 1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <strong style={{ color: 'var(--color-violet)', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>{item.title}</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.6 }}>{item.body}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
