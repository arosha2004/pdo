import React from 'react';

export default function StatusBadge({ status }) {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'published':
      case 'completed':
      case 'passed':
        return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }; // secondary-color
      case 'draft':
      case 'in_progress':
        return { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }; // warning-color
      case 'archived':
      case 'not_started':
      case 'pending':
        return { bg: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' }; // text-muted
      case 'overdue':
      case 'failed':
      case 'needs_manager_followup':
        return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }; // danger-color
      default:
        return { bg: 'rgba(255, 255, 255, 0.1)', color: '#f8fafc' };
    }
  };

  const { bg, color } = getStyles();

  return (
    <span 
      style={{ backgroundColor: bg, color, padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
    >
      {status?.replace(/_/g, ' ') || 'Unknown'}
    </span>
  );
}
