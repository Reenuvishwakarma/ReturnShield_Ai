import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { 
  BarChart3, 
  TrendingUp, 
  IndianRupee, 
  AlertTriangle, 
  RotateCcw, 
  ShoppingCart, 
  ShieldAlert, 
  PieChart as PieIcon,
  Package,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import './Dashboard.css';

const PIE_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];

export default function Analytics() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [deep, setDeep] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [sumRes, deepRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getDeepAnalytics()
      ]);
      setSummary(sumRes.data);
      setDeep(deepRes.data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={logout} />

      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-greeting">Loss Analytics & Return Telemetry</h1>
            <p className="dashboard-subtitle">
              Aggregate return ratios, claim recovery totals, and high-frequency defect patterns.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="empty-state" style={{ minHeight: '400px' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p>Compiling cross-marketplace return loss statistics...</p>
          </div>
        ) : (
          <div className="dashboard-content">
            {/* Top Stat Cards */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
              <StatCard
                title="Total Orders"
                value={summary?.total_orders || 0}
                icon={ShoppingCart}
                subtitle="All fulfilled orders"
              />
              <StatCard
                title="Return Rate"
                value={`${summary?.return_rate || 0}%`}
                icon={RotateCcw}
                subtitle={`${summary?.total_returns || 0} total returns`}
                trend={summary?.return_rate > 15 ? 'up' : 'down'}
                trendValue={summary?.return_rate > 15 ? 'High' : 'Normal'}
              />
              <StatCard
                title="Suspicious Returns"
                value={summary?.suspicious_returns || 0}
                icon={AlertTriangle}
                subtitle="Flagged by AI Risk Engine"
                trend="up"
                trendValue="Review"
              />
              <StatCard
                title="Estimated Loss"
                value={`₹${summary?.estimated_loss?.toLocaleString() || 0}`}
                icon={IndianRupee}
                subtitle="From damaged / swapped returns"
              />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Monthly Return Trends */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={18} style={{ color: 'var(--primary-light)' }} />
                    Monthly Return Volume
                  </h3>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>Recent Months</span>
                </div>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={summary?.trend_data || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                      />
                      <Bar dataKey="returns" fill="#6366f1" radius={[4, 4, 0, 0]} name="Returns" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Reasons Breakdown */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PieIcon size={18} style={{ color: 'var(--primary-light)' }} />
                    Return Reasons Breakdown
                  </h3>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>Customer Stated</span>
                </div>
                <div style={{ width: '100%', height: 260 }}>
                  {deep?.reason_distribution && deep.reason_distribution.length > 0 ? (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={deep.reason_distribution}
                          dataKey="count"
                          nameKey="reason"
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          label={({ name, percent }) => `${name.slice(0, 15)}... ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {deep.reason_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                          itemStyle={{ color: 'var(--text-primary)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ color: 'var(--text-muted)' }}>No reason data recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product-Wise Return & Loss Table */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={18} style={{ color: 'var(--primary-light)' }} />
                    Product-Level Loss & Return Performance
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Track which SKUs suffer from abnormal return frequency and disproportionate financial damage.
                  </p>
                </div>
              </div>

              <div className="table-container" style={{ margin: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Dispatched Units</th>
                      <th>Returned Units</th>
                      <th>Return Rate</th>
                      <th>Total Loss Incurred</th>
                      <th>Risk Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deep?.product_summary && deep.product_summary.length > 0 ? (
                      deep.product_summary.map((p, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{p.sku}</td>
                          <td>{p.dispatched}</td>
                          <td>{p.returned}</td>
                          <td>
                            <span className={`badge ${p.return_rate > 25 ? 'badge-danger' : p.return_rate > 10 ? 'badge-warning' : 'badge-success'}`}>
                              {p.return_rate}%
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: p.loss > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                            ₹{p.loss.toLocaleString()}
                          </td>
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
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No product return statistics accumulated yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strategic Loss Reduction Playbook */}
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(30, 41, 59, 0.6))', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                🛡️ ReturnShield Automated Recommendations for Your Store
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '8px' }}>
                  <strong style={{ color: 'var(--primary-light)' }}>1. Tag High-Risk SKUs with Tamper-Tape</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.8rem' }}>
                    For products with over 20% return rate, apply tamper-evident void tape and capture dispatch photo with QR code visible.
                  </p>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '8px' }}>
                  <strong style={{ color: 'var(--primary-light)' }}>2. Fast-Track Dossier Submissions</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.8rem' }}>
                    Marketplaces require claims within 72 hours of return delivery. Download the ReturnShield PDF dossier immediately upon inspection.
                  </p>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '8px' }}>
                  <strong style={{ color: 'var(--primary-light)' }}>3. Block Serial Returners</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.8rem' }}>
                    Customers flagged with multiple returns on expensive items should be marked for mandatory unboxing video inspection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
