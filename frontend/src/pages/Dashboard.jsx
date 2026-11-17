import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import { motion } from 'framer-motion';
import { 
  Package, ShoppingCart, RotateCcw, AlertTriangle, ShieldAlert,
  IndianRupee, ArrowRight, Clock, CheckCircle2, TrendingUp, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const DarkTooltip = ({ active, payload, label }) => {
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

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getSummary();
      setData(res.data);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError("Unable to retrieve dashboard metrics from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={logout} />
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-greeting">Seller Command Center</h1>
            <p className="dashboard-subtitle">
              Store: <strong>{user?.store_name}</strong> | Real-time Return Evidence & Risk Metrics
            </p>
          </div>
          <div className="topbar-actions">
            <Link to="/dispatch" className="btn btn-primary btn-sm">
              <Package size={16} />
              <span>Record Dispatch</span>
            </Link>
            <Link to="/returns" className="btn btn-secondary btn-sm">
              <RotateCcw size={16} />
              <span>Log Return</span>
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="empty-state">
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p>Aggregating database return metrics...</p>
          </div>
        ) : error ? (
          <div className="auth-alert error">{error}</div>
        ) : (
          <div className="dashboard-content">
            {/* KPI Stat Cards Grid */}
            <motion.div className="stats-grid" variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div variants={fadeUp}>
                <StatCard title="Total Orders" value={data?.total_orders || 0} icon={ShoppingCart} accent="violet" subtitle="All tracked marketplace orders" />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatCard title="Total Returns" value={data?.total_returns || 0} icon={RotateCcw} accent="cyan" subtitle={`Return Rate: ${data?.return_rate || 0}%`} />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatCard title="Suspicious Returns" value={data?.suspicious_returns || 0} icon={AlertTriangle} accent="rose" trend="High Risk" trendType="negative" subtitle="Flagged by Explainable AI" />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatCard title="Verified Damaged" value={data?.verified_damaged || 0} icon={ShieldAlert} accent="amber" subtitle="Physical inspection verified" />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatCard title="Est. Financial Loss" value={`₹${(data?.estimated_loss || 0).toLocaleString()}`} icon={IndianRupee} accent="rose" trendType="negative" subtitle="Disputed or damaged inventory" />
              </motion.div>
            </motion.div>

            {/* Charts Row */}
            <div className="charts-grid">
              <motion.div className="card chart-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 }}>
                <div className="chart-header">
                  <h3>Monthly Return Trends</h3>
                  <span className="badge badge-neutral">Database Driven</span>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data?.trend_data || []}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7957F5" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#42D9E8" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#777A96" fontSize={12} tickLine={false} />
                      <YAxis stroke="#777A96" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="returns" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div className="card chart-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.35 }}>
                <div className="chart-header">
                  <h3>Return Risk Distribution</h3>
                  <span className="badge badge-neutral">AI Evaluated</span>
                </div>
                <div className="chart-wrapper pie-wrapper">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={data?.risk_distribution || []}
                        dataKey="value" nameKey="name"
                        cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5}
                      >
                        {(data?.risk_distribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<DarkTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-legend">
                    {(data?.risk_distribution || []).map((d) => (
                      <div key={d.name} className="legend-item">
                        <span className="legend-dot" style={{ background: d.color }} />
                        <span>{d.name}: <strong>{d.value}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Return Requests & Live Alerts */}
            <div className="recent-grid">
              <motion.div className="table-container" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.4 }}>
                <div className="table-header">
                  <h3 className="heading-card">Recent Return Requests</h3>
                  <Link to="/returns" className="btn btn-outline btn-sm">
                    View All Returns <ArrowRight size={14} />
                  </Link>
                </div>

                {data?.recent_returns?.length === 0 ? (
                  <div className="empty-state"><p>No returns logged yet.</p></div>
                ) : (
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Return Ref</th><th>Order</th><th>Product</th>
                        <th>Reason</th><th>Risk Level</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.recent_returns?.map((ret) => (
                        <tr key={ret.id}>
                          <td><strong style={{ color: 'var(--color-violet)', fontFamily: 'monospace' }}>{ret.return_ref}</strong></td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{ret.order_ref}</td>
                          <td style={{ fontWeight: 500 }}>{ret.product_name}</td>
                          <td><span className="badge badge-neutral" style={{ fontSize: '0.78rem' }}>{ret.return_reason}</span></td>
                          <td><RiskBadge level={ret.risk_level} score={ret.risk_score} /></td>
                          <td>
                            <Link to={`/inspection?id=${ret.id}`} className="btn btn-secondary btn-sm">
                              Inspect
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </motion.div>

              <motion.div className="card alerts-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.45 }}>
                <div className="chart-header">
                  <h3>Recent Risk Alerts</h3>
                  <Clock size={16} className="text-muted" />
                </div>
                <div className="alerts-list">
                  {data?.recent_alerts?.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                      <CheckCircle2 size={32} style={{ color: 'var(--success)', margin: '0 auto 0.5rem auto' }} />
                      <p>All returns verified with no open anomalies.</p>
                    </div>
                  ) : (
                    data?.recent_alerts?.map((alert) => (
                      <div key={alert.id} className={`alert-feed-item severity-${alert.severity}`}>
                        <div className="alert-feed-title">{alert.title}</div>
                        <div className="alert-feed-msg">{alert.message}</div>
                        <div className="alert-feed-time">{alert.created_at}</div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
