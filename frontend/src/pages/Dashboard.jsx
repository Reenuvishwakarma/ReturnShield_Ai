import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import { 
  Package, 
  ShoppingCart, 
  RotateCcw, 
  AlertTriangle, 
  ShieldAlert, 
  IndianRupee, 
  ArrowRight, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  FileText
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
  Cell 
} from 'recharts';
import { Link } from 'react-router-dom';
import './Dashboard.css';

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

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={logout} />

      <main className="dashboard-main">
        {/* Top Header */}
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
            <div className="stats-grid">
              <StatCard
                title="Total Orders"
                value={data?.total_orders || 0}
                icon={ShoppingCart}
                subtitle="All tracked marketplace orders"
              />
              <StatCard
                title="Total Returns"
                value={data?.total_returns || 0}
                icon={RotateCcw}
                subtitle={`Return Rate: ${data?.return_rate || 0}%`}
              />
              <StatCard
                title="Suspicious Returns"
                value={data?.suspicious_returns || 0}
                icon={AlertTriangle}
                trend="High Risk"
                trendType="negative"
                subtitle="Flagged by Explainable AI"
              />
              <StatCard
                title="Verified Damaged"
                value={data?.verified_damaged || 0}
                icon={ShieldAlert}
                subtitle="Physical inspection verified"
              />
              <StatCard
                title="Est. Financial Loss"
                value={`₹${(data?.estimated_loss || 0).toLocaleString()}`}
                icon={IndianRupee}
                trendType="negative"
                subtitle="Disputed or damaged inventory"
              />
            </div>

            {/* Charts Row */}
            <div className="charts-grid">
              {/* Monthly Return Trend */}
              <div className="card chart-card">
                <div className="chart-header">
                  <h3>Monthly Return Trends</h3>
                  <span className="badge badge-neutral">Database Driven</span>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data?.trend_data || []}>
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} 
                      />
                      <Bar dataKey="returns" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Distribution Chart */}
              <div className="card chart-card">
                <div className="chart-header">
                  <h3>Return Risk Distribution</h3>
                  <span className="badge badge-neutral">AI Evaluated</span>
                </div>
                <div className="chart-wrapper pie-wrapper">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={data?.risk_distribution || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                      >
                        {(data?.risk_distribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
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
              </div>
            </div>

            {/* Recent Return Requests & Live Alerts */}
            <div className="recent-grid">
              {/* Recent Return Requests Table */}
              <div className="table-container">
                <div className="table-header">
                  <h3 className="heading-card">Recent Return Requests</h3>
                  <Link to="/returns" className="btn btn-outline btn-sm">
                    View All Returns <ArrowRight size={14} />
                  </Link>
                </div>

                {data?.recent_returns?.length === 0 ? (
                  <div className="empty-state">
                    <p>No returns logged yet.</p>
                  </div>
                ) : (
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Return Ref</th>
                        <th>Order</th>
                        <th>Product</th>
                        <th>Reason</th>
                        <th>Risk Level</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.recent_returns?.map((ret) => (
                        <tr key={ret.id}>
                          <td><strong>{ret.return_ref}</strong></td>
                          <td>{ret.order_ref}</td>
                          <td>{ret.product_name}</td>
                          <td>{ret.return_reason}</td>
                          <td>
                            <RiskBadge level={ret.risk_level} score={ret.risk_score} />
                          </td>
                          <td>
                            <Link to={`/inspection/${ret.id}`} className="btn btn-secondary btn-sm">
                              Inspect
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Recent Risk Alerts Feed */}
              <div className="card alerts-card">
                <div className="chart-header">
                  <h3>Recent Risk Alerts</h3>
                  <Clock size={16} className="text-muted" />
                </div>
                <div className="alerts-list">
                  {data?.recent_alerts?.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                      <CheckCircle2 size={32} style={{ color: '#10b981', margin: '0 auto 0.5rem auto' }} />
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
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
