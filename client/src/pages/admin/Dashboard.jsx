import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ user, token }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ branch: '', department: '' });
  const navigate = useNavigate();

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`http://localhost:3000/api/compliance/summary?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load summary');
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [token]);

  const handleExportPdf = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`http://localhost:3000/api/reports/export/pdf?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'compliance_report.pdf';
      a.click();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading dashboard...</div>;
  if (error) return <div className="container" style={{ color: 'var(--danger-color)', padding: '2rem' }}>{error}</div>;

  const policyRate = summary.policies?.rate ?? 'N/A';
  const trainingRate = summary.lessons?.rate ?? 'N/A';
  const quizRate = summary.quizzes?.rate ?? 'N/A';
  const openIncidents = summary.incidents?.open ?? 0;

  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const scopeText = (filters.branch || filters.department) 
    ? `${filters.branch || '*'} - ${filters.department || '*'}` 
    : 'Global';

  return (
    <div className="container" style={{ padding: '0 2rem' }}>
      <div className="dashboard-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Management dashboard</h1>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Notifications (3)</div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'flex-end', background: 'var(--bg-color)', padding: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px' }}>Filter Branch</label>
          <input 
            type="text" 
            className="input-field" 
            value={filters.branch} 
            onChange={(e) => setFilters({ ...filters, branch: e.target.value })} 
            placeholder="e.g. North" 
            style={{ marginBottom: 0, width: '100%' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px' }}>Filter Department</label>
          <input 
            type="text" 
            className="input-field" 
            value={filters.department} 
            onChange={(e) => setFilters({ ...filters, department: e.target.value })} 
            placeholder="e.g. HR" 
            style={{ marginBottom: 0, width: '100%' }}
          />
        </div>
        <div>
          <button className="btn" onClick={fetchSummary} style={{ height: '42px' }}>Apply Filters</button>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Compliance overview</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
        Authorized scope: {scopeText} | As of {currentDate}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <Card style={{ padding: '24px', background: 'var(--bg-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Policy rate</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '400', lineHeight: 1 }}>{policyRate}{policyRate !== 'N/A' && '%'}</div>
        </Card>
        <Card style={{ padding: '24px', background: 'var(--bg-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Training rate</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '400', lineHeight: 1 }}>{trainingRate}{trainingRate !== 'N/A' && '%'}</div>
        </Card>
        <Card style={{ padding: '24px', background: 'var(--bg-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Quiz pass rate</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '400', lineHeight: 1 }}>{quizRate}{quizRate !== 'N/A' && '%'}</div>
        </Card>
        <Card style={{ padding: '24px', background: 'var(--bg-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Open incidents</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '400', lineHeight: 1 }}>{openIncidents}</div>
        </Card>
      </div>

      <Card className="mb-6" style={{ background: 'var(--bg-color)', padding: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Employees needing follow-up</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', padding: '16px 0', borderBottom: '1px solid var(--panel-border)', alignItems: 'center' }}>
            <div style={{ fontSize: '0.95rem' }}>Sales group</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Policy acknowledgements overdue</div>
            <div style={{ color: 'var(--success-color)', cursor: 'pointer', textAlign: 'right', fontSize: '0.95rem' }}>View gaps</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', padding: '16px 0', borderBottom: '1px solid var(--panel-border)', alignItems: 'center' }}>
            <div style={{ fontSize: '0.95rem' }}>Warehouse group</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Training incomplete</div>
            <div style={{ color: 'var(--success-color)', cursor: 'pointer', textAlign: 'right', fontSize: '0.95rem' }}>View training</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', padding: '16px 0', alignItems: 'center' }}>
            <div style={{ fontSize: '0.95rem' }}>Accounts group</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Quiz attempts exhausted</div>
            <div style={{ color: 'var(--success-color)', cursor: 'pointer', textAlign: 'right', fontSize: '0.95rem' }}>Follow up</div>
          </div>
        </div>
      </Card>

      <Card style={{ background: 'var(--bg-color)', padding: '32px' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '8px', fontWeight: 'bold' }}>Recent incidents and management actions</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>Open the queue, review details, and record an authorized update.</p>
        <div style={{ color: 'var(--success-color)', fontWeight: '500', cursor: 'pointer', fontSize: '0.95rem' }} onClick={handleExportPdf}>
          Generate report
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
