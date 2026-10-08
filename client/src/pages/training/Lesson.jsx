import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/lessons/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setLesson(data);
        // Fetch progress separately or get it from list (simplifying: starting at 0, 
        // real app would fetch progress or backend would return it in details)
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  const updateProgress = async (newIndex) => {
    const isCompleted = newIndex >= lesson.content.length;
    const status = isCompleted ? 'completed' : 'in_progress';
    try {
      await fetch(`http://localhost:3000/api/lessons/${id}/progress`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ progressData: { slideIndex: Math.min(newIndex, lesson.content.length - 1) }, status })
      });
      if (isCompleted) {
        navigate('/training');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const nextSlide = () => {
    if (!lesson) return;
    const nextIndex = currentSlide + 1;
    setCurrentSlide(nextIndex);
    updateProgress(nextIndex);
  };

  const prevSlide = () => {
    setCurrentSlide(Math.max(0, currentSlide - 1));
  };

  if (loading) return <div>Loading lesson...</div>;
  if (!lesson) return <div>Lesson not found.</div>;

  const slide = lesson.content[currentSlide] || lesson.content[lesson.content.length - 1];

  return (
    <div className="flex-col flex gap-6 animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <button onClick={() => navigate('/training')} className="flex items-center gap-2 text-muted" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <ArrowLeft size={16} /> Back to Library
      </button>

      <div>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted mt-2">
          <div style={{ flexGrow: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${((currentSlide + 1) / lesson.content.length) * 100}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
          </div>
          <span>{currentSlide + 1} / {lesson.content.length}</span>
        </div>
      </div>

      <Card className="min-h-[300px] flex-col flex justify-center p-8">
        {slide.type === 'text' && (
          <p className="text-lg leading-relaxed text-center">{slide.content}</p>
        )}
        {slide.type === 'video' && (
          <div className="text-center text-muted">Video content: {slide.url}</div>
        )}
      </Card>

      <div className="flex justify-between mt-4">
        <Button variant="secondary" onClick={prevSlide} disabled={currentSlide === 0}>
          <ArrowLeft size={18} /> Previous
        </Button>
        <Button onClick={nextSlide}>
          {currentSlide === lesson.content.length - 1 ? (
            <><Check size={18} /> Finish</>
          ) : (
            <>Next <ArrowRight size={18} /></>
          )}
        </Button>
      </div>
    </div>
  );
}
