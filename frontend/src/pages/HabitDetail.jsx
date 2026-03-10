import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar } from 'lucide-react';
import { habitsAPI, checkInsAPI, analyticsAPI } from '../api';
import '../styles/HabitDetail.css';

const HabitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    loadHabitDetail();
  }, [id]);

  const loadHabitDetail = async () => {
    try {
      setLoading(true);
      const [habitRes, checkInsRes] = await Promise.all([
        habitsAPI.getById(id),
        checkInsAPI.getByHabitId(id, 90),
      ]);
      setHabit(habitRes.data);
      setCheckIns(checkInsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load habit details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkInsAPI.create(id, {
        completed: true,
        notes: note,
      });
      setNote('');
      loadHabitDetail();
    } catch (err) {
      setError('Failed to create check-in');
    }
  };

  const handleDeleteCheckIn = async (checkInId) => {
    if (window.confirm('Are you sure you want to delete this check-in?')) {
      try {
        await checkInsAPI.delete(checkInId);
        loadHabitDetail();
      } catch (err) {
        setError('Failed to delete check-in');
      }
    }
  };

  const handleDeleteHabit = async () => {
    if (window.confirm('Are you sure you want to delete this habit? This cannot be undone.')) {
      try {
        await habitsAPI.delete(id);
        navigate('/');
      } catch (err) {
        setError('Failed to delete habit');
      }
    }
  };

  if (loading) {
    return <div className="habit-detail"><div className="spinner"></div></div>;
  }

  if (!habit) {
    return (
      <div className="habit-detail">
        <div className="error-container">
          <p>Habit not found</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="habit-detail">
      <button onClick={() => navigate('/')} className="back-button">
        <ArrowLeft size={20} /> Back
      </button>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="habit-header-section">
        <div>
          <h1>{habit.name}</h1>
          {habit.description && <p className="description">{habit.description}</p>}
          <div className="habit-meta">
            <span className="meta-tag">{habit.frequency}</span>
            <span className="meta-tag">{habit.category}</span>
            <span className={`meta-tag ${habit.is_active ? 'active' : 'inactive'}`}>
              {habit.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <button onClick={handleDeleteHabit} className="btn btn-danger btn-small">
          <Trash2 size={16} /> Delete
        </button>
      </div>

      {habit.analytics && (
        <div className="analytics-cards">
          <div className="analytics-card">
            <span className="analytics-label">Current Streak</span>
            <span className="analytics-value">{habit.analytics.current_streak} 🔥</span>
          </div>
          <div className="analytics-card">
            <span className="analytics-label">Longest Streak</span>
            <span className="analytics-value">{habit.analytics.longest_streak}</span>
          </div>
          <div className="analytics-card">
            <span className="analytics-label">Total Completions</span>
            <span className="analytics-value">{habit.analytics.total_completions}</span>
          </div>
          <div className="analytics-card">
            <span className="analytics-label">Success Rate</span>
            <span className="analytics-value">{habit.analytics.success_rate.toFixed(1)}%</span>
          </div>
          {habit.analytics.best_day_of_week && (
            <div className="analytics-card">
              <span className="analytics-label">Best Day</span>
              <span className="analytics-value">{habit.analytics.best_day_of_week}</span>
            </div>
          )}
        </div>
      )}

      <div className="check-in-section">
        <h2>Quick Check-in</h2>
        <div className="check-in-form">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about today... (optional)"
            className="form-textarea"
          />
          <button onClick={handleCheckIn} className="btn btn-primary btn-block">
            ✓ Check In Today
          </button>
        </div>
      </div>

      <div className="history-section">
        <h2>Check-in History</h2>
        {checkIns.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No check-ins yet. Start tracking your habit!</p>
          </div>
        ) : (
          <div className="check-ins-list">
            {checkIns.map((checkIn) => (
              <div key={checkIn.id} className="check-in-item">
                <div className="check-in-info">
                  <span className="check-in-date">
                    {new Date(checkIn.check_in_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {checkIn.notes && <span className="check-in-note">{checkIn.notes}</span>}
                </div>
                <button
                  onClick={() => handleDeleteCheckIn(checkIn.id)}
                  className="btn-delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitDetail;
