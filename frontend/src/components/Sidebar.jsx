import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Camera, 
  RotateCcw, 
  Eye, 
  BrainCircuit, 
  FileText, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  ShieldAlert
} from 'lucide-react';
import './Sidebar.css';

/**
 * Sidebar Component with collapsible layout and active route highlighting
 */
export default function Sidebar({ user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
    { name: 'Dispatch Verification', path: '/dispatch', icon: Camera },
    { name: 'Return Requests', path: '/returns', icon: RotateCcw },
    { name: 'Return Inspection', path: '/inspection', icon: Eye },
    { name: 'AI Risk Engine', path: '/risk-analysis', icon: BrainCircuit },
    { name: 'Dispute Dossiers', path: '/claims', icon: FileText },
    { name: 'Analytics & Loss', path: '/analytics', icon: BarChart3 }
  ];

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">
            <ShieldAlert size={20} />
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="sidebar-title">
                ReturnShield <span className="sidebar-badge">AI</span>
              </span>
              <span className="sidebar-tagline">Smarter Returns. Safer Businesses.</span>
            </div>
          )}
        </div>
        <button 
          className="collapse-btn" 
          onClick={toggleSidebar}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="sidebar-nav">
        {!collapsed && <span className="nav-group-label">Core Operations</span>}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.name : ''}
            >
              <Icon size={19} className="nav-item-icon" />
              {!collapsed && <span className="nav-item-text">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="sidebar-footer">
        <div className="user-profile-widget">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-name">{user?.name || 'Verified Seller'}</span>
              <span className="user-role">{user?.store_name || 'Meesho Merchant'}</span>
            </div>
          )}
        </div>
        <button 
          className="logout-btn" 
          onClick={onLogout}
          title="Sign out"
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
