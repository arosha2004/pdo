import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function PolicyForm() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleGenerateAI = async () => {
    if (!title || !category) {
      alert("Please enter a Title and select a Category before generating with AI.");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:3000/api/policies/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, category })
      });
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
      } else {
        const err = await res.json();
        alert(err.error?.message || 'Failed to generate');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/policies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, category, content, effectiveDate })
      });
      if (res.ok) {
        navigate('/policies');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create draft');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create Policy Draft</h1>
        <Button variant="secondary" onClick={() => navigate('/policies')}>Cancel</Button>
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex-col flex gap-4">
          <div>
            <label className="block mb-2 font-medium">Title</label>
            <input 
              type="text" 
              className="input-field" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Category</label>
            <select 
              className="input-field" 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              required
            >
              <option value="">Select a category</option>
              <option value="Security">Security</option>
              <option value="AUP">AUP</option>
              <option value="Privacy">Privacy</option>
              <option value="HR">HR</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium">Effective Date</label>
            <input 
              type="date" 
              className="input-field" 
              value={effectiveDate} 
              onChange={e => setEffectiveDate(e.target.value)} 
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">Content</label>
              <Button type="button" variant="secondary" onClick={handleGenerateAI} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : '✨ Auto-Generate with AI'}
              </Button>
            </div>
            <textarea 
              className="input-field" 
              rows="10" 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              required
            ></textarea>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save Draft</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
