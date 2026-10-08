import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { ShieldAlert } from 'lucide-react';

export default function AUP() {
  const [aup, setAup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAUP = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/policies/aup', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAup(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAUP();
  }, []);

  if (loading) return <div>Loading AUP...</div>;

  return (
    <div className="flex-col flex gap-6 animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex items-center gap-4 mb-4">
        <ShieldAlert size={32} color="var(--primary-color)" />
        <div>
          <h1 className="text-2xl font-bold">Acceptable Use Policy (AUP)</h1>
          <p className="text-muted text-sm mt-1">Current Published Version</p>
        </div>
      </div>
      
      {aup ? (
        <Card>
          <div className="flex justify-between items-center mb-6 pb-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
            <span className="text-sm font-semibold text-muted">Version: {aup.versionNumber}</span>
            <span className="text-sm font-semibold text-muted">Published: {new Date(aup.publishedAt).toLocaleDateString()}</span>
          </div>
          <div className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-main)' }}>
            {aup.content}
          </div>
        </Card>
      ) : (
        <Card className="text-center text-muted">No published AUP found.</Card>
      )}
    </div>
  );
}
