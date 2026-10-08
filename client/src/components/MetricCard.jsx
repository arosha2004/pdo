import React from 'react';

const MetricCard = ({ title, data, type }) => {
  if (!data) return null;

  const { rate, total, completed, pending, overdue } = data;
  
  return (
    <div className="glass-panel metric-card">
      <h3 className="metric-label">{title}</h3>
      {rate === null ? (
        <div className="metric-value" style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>
          No assignments
        </div>
      ) : (
        <div className="metric-value">{rate}%</div>
      )}
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--success-color)' }}>{completed} Done</span>
        <span style={{ color: 'var(--warning-color)' }}>{pending} Pending</span>
        <span style={{ color: 'var(--danger-color)' }}>{overdue} Overdue</span>
      </div>
      <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        Total: {total} {type}
      </div>
    </div>
  );
};

export default MetricCard;
