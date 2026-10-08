import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const IncidentForm = ({ token }) => {
  const [category, setCategory] = useState('Phishing');
  const [occurrenceTime, setOccurrenceTime] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category, occurrenceTime, description })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit incident');
      }

      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '64px' }}>
      <div className="glass-panel">
        <h2>Report an Incident</h2>
        
        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
        {success && <div style={{ color: 'var(--success-color)', marginBottom: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>Incident reported successfully! Returning to dashboard...</div>}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Category</label>
          <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
            <option>Phishing</option>
            <option>Lost Device</option>
            <option>Data Breach</option>
            <option>Other</option>
          </select>

          <label style={{ display: 'block', marginBottom: '8px' }}>Occurrence Time</label>
          <input 
            type="datetime-local" 
            className="input-field" 
            value={occurrenceTime} 
            onChange={e => setOccurrenceTime(e.target.value)} 
            required 
            max={new Date().toISOString().slice(0, 16)} 
          />

          <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
          <textarea 
            className="input-field" 
            rows="5" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            required 
            placeholder="Please describe the incident factually."
          ></textarea>
          <p style={{ fontSize: '0.75rem', marginBottom: '16px' }}>
            ⚠️ <strong>Guidance:</strong> Do NOT include sensitive information like passwords or full payment-card numbers.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--panel-border)' }} onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="btn btn-danger">Submit Incident</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentForm;
