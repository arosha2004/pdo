import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';

export default function PlaceholderForm({ title }) {
  const navigate = useNavigate();
  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>
      
      <Card className="p-12 text-center text-muted">
        <h2 className="text-xl mb-2">Module Under Construction</h2>
        <p>This form/page is part of the backlog and will be implemented in a future sprint.</p>
      </Card>
    </div>
  );
}
