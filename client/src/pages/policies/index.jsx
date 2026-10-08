import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { Search, Filter, FileText, CheckCircle, Clock } from 'lucide-react';

export default function PoliciesLibrary({ user }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchPolicies = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/policies', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setPolicies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const acknowledgePolicy = async (versionId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/policies/versions/${versionId}/acknowledge`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchPolicies(); // Refresh
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPolicies = policies.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter ? p.category === categoryFilter : true;
    return matchSearch && matchCat;
  });

  const categories = [...new Set(policies.map(p => p.category))];

  if (loading) return <div>Loading policies...</div>;

  return (
    <div className="flex-col flex gap-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Policy Library</h1>
          <p className="text-muted text-sm mt-1">Review and acknowledge your assigned policies</p>
        </div>
        {(user.appRole === 'admin' || user.appRole === 'manager') && (
          <Button variant="primary" onClick={() => window.location.href='/policies/new'}>Create Draft</Button>
        )}
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2" style={{ flexGrow: 1, background: 'rgba(15,23,42,0.6)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search policies..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100%' }}
          />
        </div>
        <div className="flex items-center gap-2" style={{ background: 'rgba(15,23,42,0.6)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
          <Filter size={18} className="text-muted" />
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none' }}
          >
            <option value="" style={{ color: 'black' }}>All Categories</option>
            {categories.map(c => <option key={c} value={c} style={{ color: 'black' }}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-col flex gap-4">
        {filteredPolicies.length === 0 ? (
          <Card className="text-center p-8 text-muted">No policies found matching your criteria.</Card>
        ) : (
          filteredPolicies.map(policy => (
            <Card key={policy.id} className="flex justify-between items-center">
              <div className="flex items-start gap-4">
                <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--primary-color)' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{policy.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted mt-1">
                    <StatusBadge status={policy.status} />
                    <span>v{policy.versionNumber}</span>
                    <span>•</span>
                    <span>{policy.category}</span>
                    {policy.deadline && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-warning-color"><Clock size={14}/> Due {new Date(policy.deadline).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {user.appRole === 'employee' && (
                  policy.acknowledged ? (
                    <div className="flex items-center gap-2 text-secondary-color">
                      <CheckCircle size={18} />
                      <span className="text-sm font-medium">Acknowledged</span>
                    </div>
                  ) : (
                    <Button onClick={() => acknowledgePolicy(policy.versionId)}>Acknowledge</Button>
                  )
                )}
                <Button variant="secondary" onClick={() => alert('Download simulated')}>Download</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
