import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, BookOpen, GraduationCap, Bell, LogOut, LayoutDashboard, Users, AlertTriangle } from 'lucide-react';

export default function Sidebar({ user, onLogout }) {
  return (
    <aside style={{ width: '250px', display: 'flex', flexDirection: 'column', padding: '1.5rem', borderRight: '1px solid var(--surface-border)', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)' }}>
      <div className="flex items-center gap-2 mb-8 text-xl font-bold" style={{ color: 'var(--primary-color)' }}>
        <Shield size={28} />
        <span>SecuGuard</span>
      </div>

      <nav className="flex-col gap-2 flex" style={{ flexGrow: 1 }}>
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md ${isActive ? 'bg-primary-color' : ''}`}
          style={({ isActive }) => ({ background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: isActive ? 'var(--primary-color)' : 'var(--text-muted)' })}
        >
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink 
          to="/policies" 
          className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md ${isActive ? 'bg-primary-color' : ''}`}
          style={({ isActive }) => ({ background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: isActive ? 'var(--primary-color)' : 'var(--text-muted)' })}
        >
          <BookOpen size={20} /> Policies
        </NavLink>
        <NavLink 
          to="/training" 
          className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md ${isActive ? 'bg-primary-color' : ''}`}
          style={({ isActive }) => ({ background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: isActive ? 'var(--primary-color)' : 'var(--text-muted)' })}
        >
          <GraduationCap size={20} /> Training
        </NavLink>
        
        {/* Incidents (Visible for all, but maybe just a submission link for employees) */}
        <NavLink 
          to="/incidents/new" 
          className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md ${isActive ? 'bg-primary-color' : ''}`}
          style={({ isActive }) => ({ background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: isActive ? 'var(--primary-color)' : 'var(--text-muted)' })}
        >
          <AlertTriangle size={20} /> Report Incident
        </NavLink>

        <NavLink 
          to="/notifications" 
          className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md ${isActive ? 'bg-primary-color' : ''}`}
          style={({ isActive }) => ({ background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: isActive ? 'var(--primary-color)' : 'var(--text-muted)' })}
        >
          <Bell size={20} /> Notifications
        </NavLink>

        {user.appRole === 'admin' && (
          <NavLink 
            to="/users" 
            className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md ${isActive ? 'bg-primary-color' : ''}`}
            style={({ isActive }) => ({ background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: isActive ? 'var(--primary-color)' : 'var(--text-muted)' })}
          >
            <Users size={20} /> Users & Access
          </NavLink>
        )}

        {(user.appRole === 'admin' || user.appRole === 'manager') && (
          <NavLink 
            to="/reports" 
            className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md ${isActive ? 'bg-primary-color' : ''}`}
            style={({ isActive }) => ({ background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: isActive ? 'var(--primary-color)' : 'var(--text-muted)' })}
          >
            <BookOpen size={20} /> Reports
          </NavLink>
        )}
      </nav>

      <div className="mt-auto flex-col flex gap-4 pt-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
        <div className="flex-col flex">
          <span className="font-semibold">{user.name}</span>
          <span className="text-sm text-muted capitalize">{user.appRole} - {user.jobGroup}</span>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-muted" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
