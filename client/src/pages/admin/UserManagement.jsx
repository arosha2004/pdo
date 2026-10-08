import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Users, UserPlus, Trash, Edit, Shield } from 'lucide-react';

export default function UserManagement({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', appRole: 'employee', branch: 'North', department: 'HR', jobGroup: 'All Staff' });

  useEffect(() => {
    // In a real app, fetch from /api/users
    // We mock it for the demo assuming the backend endpoint isn't fully robust yet
    setTimeout(() => {
      setUsers([
        { id: 1, name: 'System Admin', email: 'admin@example.com', appRole: 'admin', branch: 'Global', department: 'IT', active: true },
        { id: 2, name: 'North HR Manager', email: 'mgr1@example.com', appRole: 'manager', branch: 'North', department: 'HR', active: true },
        { id: 3, name: 'Alice (Completed)', email: 'emp1@example.com', appRole: 'employee', branch: 'North', department: 'HR', active: true },
        { id: 4, name: 'Bob (Inactive)', email: 'emp_inactive@example.com', appRole: 'employee', branch: 'South', department: 'Sales', active: false }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleAddUser = (e) => {
    e.preventDefault();
    setUsers([...users, { ...newUser, id: Date.now(), active: true }]);
    setShowAdd(false);
  };

  const toggleActive = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="container" style={{ maxWidth: '1000px', marginTop: '2rem' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted text-sm mt-1">Manage accounts, roles, and access</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2">
          <UserPlus size={18} /> Add User
        </Button>
      </div>

      {showAdd && (
        <Card className="mb-6 animate-fade-in p-6">
          <h2 className="text-xl mb-4">Create New Account</h2>
          <form onSubmit={handleAddUser} className="grid-3">
            <div>
              <label className="block mb-2 text-sm font-medium">Name</label>
              <input type="text" required className="input-field" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Email</label>
              <input type="email" required className="input-field" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Password</label>
              <input type="password" required className="input-field" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Role</label>
              <select className="input-field" value={newUser.appRole} onChange={e => setNewUser({...newUser, appRole: e.target.value})}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Branch</label>
              <input type="text" className="input-field" value={newUser.branch} onChange={e => setNewUser({...newUser, branch: e.target.value})} />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Department</label>
              <input type="text" className="input-field" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit">Create Account</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-muted)' }}>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Branch/Dept</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                  <td className="p-4 font-medium flex items-center gap-2">
                    <Users size={16} className="text-muted" /> {u.name}
                  </td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4 capitalize">
                    <span className={`badge ${u.appRole === 'admin' ? 'badge-danger' : u.appRole === 'manager' ? 'badge-warning' : 'badge-success'}`}>
                      {u.appRole}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted">{u.branch} - {u.department}</td>
                  <td className="p-4">
                    <span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>
                      {u.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button className="btn btn-secondary p-2" title="Edit Role"><Shield size={16}/></button>
                    <button onClick={() => toggleActive(u.id)} className={`btn ${u.active ? 'btn-danger' : 'btn-primary'} p-2`} title={u.active ? 'Deactivate' : 'Reactivate'}>
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
