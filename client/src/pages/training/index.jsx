import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { GraduationCap, PlayCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TrainingLibrary({ user }) {
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        const [lessonsRes, quizzesRes] = await Promise.all([
          fetch('http://localhost:3000/api/lessons', { headers }),
          fetch('http://localhost:3000/api/quizzes', { headers })
        ]);
        
        if (lessonsRes.ok) setLessons(await lessonsRes.json());
        if (quizzesRes.ok) setQuizzes(await quizzesRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading training modules...</div>;

  return (
    <div className="flex-col flex gap-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Training & Quizzes</h1>
          <p className="text-muted text-sm mt-1">Complete your assigned training courses and assessments</p>
        </div>
        {(user.appRole === 'admin' || user.appRole === 'manager') && (
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => window.location.href='/training/lessons/new'}>Create Lesson</Button>
            <Button variant="primary" onClick={() => window.location.href='/training/quizzes/new'}>Create Quiz</Button>
          </div>
        )}
      </div>

      <div className="flex-col flex gap-4">
        {lessons.length === 0 && quizzes.length === 0 ? (
          <Card className="text-center p-8 text-muted">No training assigned.</Card>
        ) : (
          <>
            {lessons.map(lesson => (
              <Card key={lesson.id} className="flex justify-between items-center">
                <div className="flex items-start gap-4">
                  <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success-color)' }}>
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{lesson.title}</h3>
                    <p className="text-sm text-muted mt-1 mb-2">{lesson.description}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <StatusBadge status={lesson.status} />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {lesson.status === 'completed' ? (
                    <Button variant="secondary" onClick={() => navigate(`/training/lesson/${lesson.id}`)}>Review</Button>
                  ) : (
                    <Button onClick={() => navigate(`/training/lesson/${lesson.id}`)}>
                      <PlayCircle size={18} /> {lesson.status === 'in_progress' ? 'Continue' : 'Start'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
            
            {quizzes.map(quiz => (
              <Card key={quiz.id} className="flex justify-between items-center">
                <div className="flex items-start gap-4">
                  <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--accent-color)' }}>
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{quiz.quizVersion?.quiz?.title || 'Quiz Assessment'}</h3>
                    <p className="text-sm text-muted mt-1 mb-2">Required Assessment (v{quiz.quizVersion?.versionNumber})</p>
                    <div className="flex items-center gap-3 text-sm">
                      <StatusBadge status={quiz.status} />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {quiz.status === 'passed' ? (
                    <Button variant="secondary" disabled>Passed</Button>
                  ) : (
                    <Button onClick={() => navigate(`/training/quiz/${quiz.id}/${quiz.quizVersionId}`)}>
                      Take Quiz
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
