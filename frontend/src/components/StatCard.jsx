import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import '../styles/components.css';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  subtitle,
  accent = 'violet' // 'violet' | 'cyan' | 'amber' | 'rose' | 'emerald'
}) {
  const accentStyles = {
    violet: {
      borderTop: '3px solid #7957F5',
      iconBg: 'rgba(121, 87, 245, 0.1)',
      iconColor: '#7957F5',
      glow: 'rgba(121, 87, 245, 0.05)'
    },
    cyan: {
      borderTop: '3px solid #42D9E8',
      iconBg: 'rgba(66, 217, 232, 0.12)',
      iconColor: '#0E7490',
      glow: 'rgba(66, 217, 232, 0.05)'
    },
    amber: {
      borderTop: '3px solid #F59E0B',
      iconBg: 'rgba(245, 158, 11, 0.1)',
      iconColor: '#D97706',
      glow: 'rgba(245, 158, 11, 0.05)'
    },
    rose: {
      borderTop: '3px solid #EF4444',
      iconBg: 'rgba(239, 68, 68, 0.1)',
      iconColor: '#DC2626',
      glow: 'rgba(239, 68, 68, 0.05)'
    },
    emerald: {
      borderTop: '3px solid #10B981',
      iconBg: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#059669',
      glow: 'rgba(16, 185, 129, 0.05)'
    }
  };

  const style = accentStyles[accent] || accentStyles.violet;

  return (
    <div 
      className="stat-card" 
      style={{ 
        borderTop: style.borderTop,
        background: `linear-gradient(180deg, #FFFFFF 0%, ${style.glow} 100%)`
      }}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div 
            className="stat-card-icon-wrapper"
            style={{ 
              background: style.iconBg,
              color: style.iconColor 
            }}
          >
            <Icon size={19} />
          </div>
        )}
      </div>

      <div className="stat-card-value">{value}</div>

      {(trend || subtitle) && (
        <div className="stat-card-footer">
          {trend && (
            <span 
              className="badge" 
              style={{ 
                padding: '0.15rem 0.5rem',
                fontSize: '0.725rem',
                background: trendType === 'positive' ? 'rgba(16, 185, 129, 0.1)' : trendType === 'negative' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(119, 122, 150, 0.1)',
                color: trendType === 'positive' ? '#059669' : trendType === 'negative' ? '#DC2626' : '#777A96'
              }}
            >
              {trendType === 'positive' && <ArrowDownRight size={13} />}
              {trendType === 'negative' && <ArrowUpRight size={13} />}
              {trend}
            </span>
          )}
          {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
