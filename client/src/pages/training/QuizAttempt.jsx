import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function QuizAttempt() {
  const { id, versionId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Note: Since quiz fetching endpoint isn't fully built for client in our example, we will mock or use basic fetch
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/quizzes`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        // Just find the assigned quiz for this demo
        const q = data.find(a => a.quizVersionId === versionId);
        if (q) {
          // We need the questions... assuming the backend sends them (in a real scenario they are fetched specifically)
          setQuiz(q);
        }
      } catch (err) {
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, versionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/api/quizzes/versions/${versionId}/submit`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading quiz...</div>;
  if (result) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <Card className="text-center p-8">
          <h2 className="text-2xl mb-4">Quiz Results</h2>
          <div className="text-4xl mb-4 font-bold text-primary-color">{result.score}%</div>
          <p className="mb-6">{result.passed ? '✅ You passed!' : '❌ You failed.'}</p>
          <Button onClick={() => navigate('/training')}>Return to Training</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
      <h1 className="text-2xl font-bold mb-6">Quiz Assessment</h1>
      {error && <div className="text-danger-color mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        {/* Placeholder for questions since we don't have the full questions schema loaded in frontend */}
        <Card className="mb-4">
          <h3 className="font-semibold mb-4">Question 1: Is this bad?</h3>
          <div className="flex-col gap-2 flex">
            <label className="flex gap-2 items-center">
              <input type="radio" name="q1" onChange={() => setAnswers({...answers, q1: 'yes'})} /> Yes
            </label>
            <label className="flex gap-2 items-center">
              <input type="radio" name="q1" onChange={() => setAnswers({...answers, q1: 'no'})} /> No
            </label>
          </div>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit">Submit Answers</Button>
        </div>
      </form>
    </div>
  );
}
