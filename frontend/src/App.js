import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import AnimatedBackground from './AnimatedBackground';

const API_URL = 'http://localhost:8000';

const CATEGORY_ICONS = {
  health: '🏥',
  work: '💼',
  learning: '📚',
  fitness: '💪',
  productivity: '⚡',
  other: '📌'
};

function App() {
  const [habits, setHabits] = useState([]);
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('health');

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/habits`);
      setHabits(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createHabit = async () => {
    if (!habitName.trim()) {
      alert('Please enter a habit name');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/habits`, {
        name: habitName,
        category: habitCategory,
        frequency: 'daily'
      });
      setHabitName('');
      fetchHabits();
    } catch (error) {
      alert('Error creating habit');
    }
  };

  const checkIn = async (habitId) => {
    try {
      await axios.post(`${API_URL}/api/habits/${habitId}/check-ins`, {
        completed: true,
        notes: 'Checked in today'
      });
      fetchHabits();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteHabit = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await axios.delete(`${API_URL}/api/habits/${habitId}`);
        fetchHabits();
      } catch (error) {
        alert('Error deleting habit');
      }
    }
  };

  const getProgressPercentage = (habit) => {
    if (!habit.analytics) return 0;
    return Math.min(habit.analytics.success_rate, 100);
  };

  return (
    <div className="App">
      {/* 3D Animated Background */}
      <AnimatedBackground />

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="title">🎯 Habit Hero</h1>
          <p className="subtitle">Build Better Habits, One Day at a Time</p>
        </div>
        <div className="header-stats">
          <div className="stat-box">
            <span className="stat-number">{habits.length}</span>
            <span className="stat-label">Habits</span>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Create Section */}
        <section className="create-section">
          <h2 className="section-title">✨ Create New Habit</h2>
          <div className="form-group">
            <input
              type="text"
              placeholder="What habit do you want to build?"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createHabit()}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <select 
              value={habitCategory} 
              onChange={(e) => setHabitCategory(e.target.value)}
              className="select-field"
            >
              <option value="health">🏥 Health</option>
              <option value="work">💼 Work</option>
              <option value="learning">📚 Learning</option>
              <option value="fitness">💪 Fitness</option>
              <option value="productivity">⚡ Productivity</option>
              <option value="other">📌 Other</option>
            </select>
          </div>

          <button onClick={createHabit} className="btn-create">
            ➕ Create Habit
          </button>
        </section>

        {/* Habits Section */}
        <section className="habits-section">
          <h2 className="section-title">
            {habits.length === 0 ? '📭 No Habits Yet' : `🏆 Your Habits (${habits.length})`}
          </h2>

          {habits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌱</div>
              <p className="empty-text">Start your journey by creating your first habit!</p>
            </div>
          ) : (
            <div className="habits-grid">
              {habits.map((habit) => (
                <div key={habit.id} className="habit-card">
                  {/* Card Header */}
                  <div className="card-header">
                    <div className="habit-title-group">
                      <span className="category-icon">{CATEGORY_ICONS[habit.category] || '📌'}</span>
                      <h3 className="habit-title">{habit.name}</h3>
                    </div>
                    <span className="category-badge">{habit.category}</span>
                  </div>

                  {/* Stats */}
                  {habit.analytics && (
                    <div className="stats-section">
                      {/* Streak */}
                      <div className="stat-item">
                        <div className="stat-row">
                          <span className="stat-label">Current Streak</span>
                          <span className="stat-value">{habit.analytics.current_streak} 🔥</span>
                        </div>
                      </div>

                      {/* Success Rate with Progress Bar */}
                      <div className="stat-item">
                        <div className="stat-row">
                          <span className="stat-label">Success Rate</span>
                          <span className="stat-value">{habit.analytics.success_rate.toFixed(1)}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${getProgressPercentage(habit)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Other Stats */}
                      <div className="mini-stats">
                        <div className="mini-stat">
                          <span className="mini-label">Total</span>
                          <span className="mini-value">{habit.analytics.total_completions}</span>
                        </div>
                        <div className="mini-stat">
                          <span className="mini-label">Longest</span>
                          <span className="mini-value">{habit.analytics.longest_streak}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="card-actions">
                    <button 
                      onClick={() => checkIn(habit.id)}
                      className="btn-checkin"
                    >
                      ✓ Check In Today
                    </button>
                    <button 
                      onClick={() => deleteHabit(habit.id)}
                      className="btn-delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>💪 Keep going! Every small step counts!</p>
      </footer>
    </div>
  );
}

export default App;