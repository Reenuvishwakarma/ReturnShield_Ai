import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import '../styles/components.css';

/**
 * RiskBadge Component
 * Standardized badge to show Low, Medium, or High Risk with icons.
 */
export default function RiskBadge({ level, score }) {
  const normalizedLevel = (level || 'LOW').toUpperCase();

  let badgeClass = 'badge-risk-low';
  let Icon = CheckCircle;

  if (normalizedLevel === 'HIGH' || (score !== undefined && score >= 70)) {
    badgeClass = 'badge-risk-high';
    Icon = AlertCircle;
  } else if (normalizedLevel === 'MEDIUM' || (score !== undefined && score >= 40)) {
    badgeClass = 'badge-risk-medium';
    Icon = AlertTriangle;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <Icon size={13} />
      <span>{normalizedLevel} {score !== undefined ? `(${score})` : ''}</span>
    </span>
  );
}
