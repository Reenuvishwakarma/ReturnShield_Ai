import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import '../styles/components.css';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  subtitle 
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon-wrapper">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="stat-card-value">{value}</div>

      {(trend || subtitle) && (
        <div className="stat-card-footer">
          {trend && (
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              fontWeight: 600,
              color: trendType === 'positive' ? '#10b981' : trendType === 'negative' ? '#ef4444' : '#64748b' 
            }}>
              {trendType === 'positive' && <ArrowDownRight size={14} />}
              {trendType === 'negative' && <ArrowUpRight size={14} />}
              {trend}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
