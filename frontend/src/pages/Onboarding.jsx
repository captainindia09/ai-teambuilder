import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';

export default function Onboarding() {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(false);
    const [aiScore, setAiScore] = useState(null);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const { data } = await api.get('/onboarding/generate-questions');
                setQuestions(data.questions);
                setAnswers(new Array(data.questions.length).fill(''));
            } catch (err) {
                console.error('Failed to fetch questions:', err);
                setError('Failed to load AI assessment. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEvaluating(true);
        setError('');

        // Format pairs for the backend
        const qaPairs = questions.map((q, i) => ({
            question: q,
            answer: answers[i]
        }));

        try {
            const { data } = await api.post('/onboarding/evaluate-answers', { qaPairs });
            setAiScore(data.aiScore);

            // Give the user a moment to see their score before redirecting
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);

        } catch (err) {
            console.error('Failed to evaluate answers:', err);
            setError('Evaluation failed. Please try again.');
            setEvaluating(false);
        }
    };

    if (loading) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <h2>🤖 Analyzing Your Skills...</h2>
                    <p className="muted">The AI Concierge is generating personalized technical questions based on your profile.</p>
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    if (aiScore !== null) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <h2>Assessment Complete! 🎉</h2>
                    <p className="muted">The AI has evaluated your answers.</p>
                    <div style={{ margin: '2rem 0' }}>
                        <h1 style={{ fontSize: '4rem', color: 'var(--primary)', margin: 0 }}>{aiScore}%</h1>
                        <p>Verified Match Score</p>
                    </div>
                    <p className="muted">Redirecting to your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page" style={{ padding: '2rem 0' }}>
            <div className="auth-card" style={{ maxWidth: '600px', width: '90%' }}>
                <h2>Technical Assessment 📝</h2>
                <p className="muted">
                    Answer these 3 quick questions to set your Verified Match Score.
                    This helps the AI recommend you for the perfect teams.
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {questions.map((q, i) => (
                        <div className="form-group" key={i} style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontWeight: 'bold' }}>Question {i + 1}: {q}</label>
                            <textarea
                                value={answers[i]}
                                onChange={(e) => handleAnswerChange(i, e.target.value)}
                                required
                                rows={3}
                                placeholder="Type your answer here..."
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #333', background: 'var(--bg-lighter)', color: '#fff', resize: 'vertical' }}
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={evaluating || answers.some(a => a.trim() === '')}
                        style={{ marginTop: '1rem' }}
                    >
                        {evaluating ? 'Evaluating...' : 'Submit Answers'}
                    </button>
                </form>
            </div>
        </div>
    );
}
