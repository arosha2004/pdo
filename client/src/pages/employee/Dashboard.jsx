import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import { Shield, BookOpen, GraduationCap, AlertTriangle, PlayCircle, CheckCircle } from 'lucide-react';

const EmployeeDashboard = ({ user, token }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/compliance/summary', {
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
    fetchSummary();
  }, [token]);

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading dashboard...</div>;
  if (error) return <div className="container" style={{ color: 'var(--danger-color)', padding: '2rem' }}>{error}</div>;

  const policiesPending = (summary.policies?.pending || 0) + (summary.policies?.overdue || 0);
  const lessonsPending = (summary.lessons?.pending || 0) + (summary.lessons?.overdue || 0);
  const quizzesPending = (summary.quizzes?.pending || 0) + (summary.quizzes?.overdue || 0);
  const openIncidents = summary.incidents?.open || 0;
  
  const totalPending = policiesPending + lessonsPending + quizzesPending;

  return (
    <div className="container" style={{ padding: '0 2rem' }}>
      <div className="dashboard-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Welcome back, {user.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Complete your assigned activities before their deadlines.</p>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', alignSelf: 'flex-start' }}>Notifications (3)</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <Card style={{ padding: '24px', background: 'var(--bg-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Policies pending</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '400', lineHeight: 1 }}>{policiesPending}</div>
        </Card>
        <Card style={{ padding: '24px', background: 'var(--bg-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Lessons pending</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '400', lineHeight: 1 }}>{lessonsPending}</div>
        </Card>
        <Card style={{ padding: '24px', background: 'var(--bg-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Assessments due</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '400', lineHeight: 1 }}>{quizzesPending}</div>
        </Card>
        <Card style={{ padding: '24px', background: 'var(--bg-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>My open incidents</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '400', lineHeight: 1 }}>{openIncidents}</div>
        </Card>
      </div>

      <Card className="mb-6" style={{ background: 'var(--bg-color)', padding: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Your next actions</h2>
        
        {totalPending === 0 ? (
          <div style={{ color: 'var(--text-secondary)', padding: '16px 0' }}>No tasks assigned yet or all tasks completed.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {policiesPending > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', padding: '16px 0', borderBottom: '1px solid var(--panel-border)', alignItems: 'center' }}>
                <div style={{ fontSize: '0.95rem' }}>AUP version 1.0</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Pending acknowledgement</div>
                <div style={{ color: 'var(--success-color)', cursor: 'pointer', textAlign: 'right', fontSize: '0.95rem' }} onClick={() => navigate('/policies')}>Read policy</div>
              </div>
            )}
            
            {lessonsPending > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', padding: '16px 0', borderBottom: '1px solid var(--panel-border)', alignItems: 'center' }}>
                <div style={{ fontSize: '0.95rem' }}>Recognising phishing</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Lesson in progress</div>
                <div style={{ color: 'var(--success-color)', cursor: 'pointer', textAlign: 'right', fontSize: '0.95rem' }} onClick={() => navigate('/training')}>Continue</div>
              </div>
            )}
            
            {quizzesPending > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', padding: '16px 0', alignItems: 'center' }}>
                <div style={{ fontSize: '0.95rem' }}>Password security</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Quiz ready</div>
                <div style={{ color: 'var(--success-color)', cursor: 'pointer', textAlign: 'right', fontSize: '0.95rem' }} onClick={() => navigate('/training')}>Start quiz</div>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card style={{ background: 'var(--bg-color)', padding: '32px' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '8px', fontWeight: 'bold' }}>Need to report something suspicious?</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>Use Report Incident. Do not include passwords or full card details.</p>
        <div style={{ color: 'var(--success-color)', fontWeight: '500', cursor: 'pointer', fontSize: '0.95rem' }} onClick={() => navigate('/incidents/new')}>
          Report Incident
        </div>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
