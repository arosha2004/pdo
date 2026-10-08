import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout({ user, onLogout }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={user} onLogout={onLogout} />
      <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flexGrow: 1 }}>
          <Outlet />
        </div>
        <footer style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.875rem' }}>
          <a href="/policies/aup" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Acceptable Use Policy (AUP)</a>
          <a href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Notice</a>
        </footer>
      </main>
    </div>
  );
}
