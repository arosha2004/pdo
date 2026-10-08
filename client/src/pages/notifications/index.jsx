import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { Bell, CheckCircle } from 'lucide-react';

export default function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from /api/notifications
    // For now, we mock some notifications for demonstration
    setTimeout(() => {
      setNotifications([
        { id: 1, type: 'assignment', title: 'New Training Assigned', message: 'You have been assigned: Phishing 101', date: new Date().toISOString(), read: false },
        { id: 2, type: 'reminder', title: 'Overdue Policy', message: 'Please acknowledge Acceptable Use Policy', date: new Date(Date.now() - 86400000).toISOString(), read: false },
        { id: 3, type: 'system', title: 'Welcome to SecuGuard', message: 'Your account has been created.', date: new Date(Date.now() - 172800000).toISOString(), read: true }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted text-sm mt-1">Stay updated on your requirements</p>
        </div>
      </div>

      <div className="flex-col flex gap-4">
        {notifications.length === 0 ? (
          <Card className="text-center p-8 text-muted">You have no notifications.</Card>
        ) : (
          notifications.map(note => (
            <Card key={note.id} className={`flex justify-between items-center ${!note.read ? 'border-l-4 border-l-accent-color' : ''}`} style={!note.read ? { borderLeft: '4px solid var(--accent-color)' } : {}}>
              <div className="flex items-start gap-4">
                <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--accent-color)' }}>
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className={`text-lg ${!note.read ? 'font-bold' : 'font-medium'}`}>{note.title}</h3>
                  <p className="text-sm text-muted mt-1 mb-1">{note.message}</p>
                  <p className="text-xs text-muted">{new Date(note.date).toLocaleString()}</p>
                </div>
              </div>
              {!note.read && (
                <button onClick={() => markAsRead(note.id)} className="btn btn-secondary flex items-center gap-2">
                  <CheckCircle size={16} /> Mark Read
                </button>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
