import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Shield } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Login failed');
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ width: '100vw' }}>
      <Card className="w-full animate-fade-in" style={{ maxWidth: '400px' }}>
        <div className="flex-col flex items-center mb-6">
          <Shield size={48} color="var(--primary-color)" className="mb-4" />
          <h1 className="text-2xl font-bold">SecuGuard</h1>
          <p className="text-muted text-sm mt-1">Security Awareness & Compliance</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-col flex gap-4">
          {error && <div style={{ color: 'var(--danger-color)', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}
          
          <div className="flex-col flex gap-2">
            <label className="text-sm font-medium">Email</label>
            <input 
              type="email" 
              className="input-base" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@acme.com"
              required 
            />
          </div>
          
          <div className="flex-col flex gap-2">
            <label className="text-sm font-medium">Password</label>
            <input 
              type="password" 
              className="input-base" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>

          <Button type="submit" className="w-full mt-2">Sign In</Button>
        </form>

        <div className="mt-6 text-sm text-muted text-center flex-col flex gap-1">
          <p>Demo accounts (password: password123):</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <span style={{cursor:'pointer', textDecoration:'underline'}} onClick={()=>{setEmail('admin@example.com'); setPassword('password123');}}>Admin</span>
            <span style={{cursor:'pointer', textDecoration:'underline'}} onClick={()=>{setEmail('mgr1@example.com'); setPassword('password123');}}>Manager</span>
            <span style={{cursor:'pointer', textDecoration:'underline'}} onClick={()=>{setEmail('emp1@example.com'); setPassword('password123');}}>Employee</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
