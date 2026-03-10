import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Flame, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { dashboardAPI, habitsAPI, checkInsAPI } from '../api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);
  const [checkedIn, setCheckedIn] = useState(new Set());

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setDashboard(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (habitId) => {
    try {
      await checkInsAPI.create(habitId, { completed: true, notes: '' });
      setCheckedIn(new Set(checkedIn).add(habitId));
      setTimeout(() => loadDashboard(), 500);
    } catch (err) {
      console.error('Failed to check in:', err);
    }
  };

  if (loading) {
    return <div className="dashboard"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back! 👋</h1>
          <p className="text-muted">Let's build better habits together</p>
        </div>
        <Link to="/create" className="btn btn-primary">
          <Plus size={20} /> New Habit
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {dashboard && (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                <Target size={24} color="#6366f1" />
              </div>
              <div>
                <p className="stat-label">Total Habits</p>
                <p className="stat-value">{dashboard.total_habits}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <CheckCircle size={24} color="#10b981" />
              </div>
              <div>
                <p className="stat-label">Active Habits</p>
                <p className="stat-value">{dashboard.active_habits}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <TrendingUp size={24} color="#f59e0b" />
              </div>
              <div>
                <p className="stat-label">Today's Check-ins</p>
                <p className="stat-value">{dashboard.today_completed}</p>
              </div>
            </div>

            {dashboard.best_performing_habit && (
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
                  <Flame size={24} color="#ec4899" />
                </div>
                <div>
                  <p className="stat-label">Best Habit</p>
                  <p className="stat-value">
                    {dashboard.best_performing_habit.name.substring(0, 15)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Habits List */}
          <div className="habits-section">
            <h2>Your Habits</h2>
            {dashboard.all_habits.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h3 className="empty-state-title">No habits yet</h3>
                <p>Create your first habit to get started building a better routine!</p>
                <Link to="/create" className="btn btn-primary mt-3">
                  Create First Habit
                </Link>
              </div>
            ) : (
              <div className="habits-grid">
                {dashboard.all_habits.map((habit) => (
                  <Link
                    key={habit.id}
                    to={`/habit/${habit.id}`}
                    className="habit-card"
                  >
                    <div className="habit-header">
                      <h3>{habit.name}</h3>
                      <span className={`badge badge-${getCategoryColor(habit.category)}`}>
                        {habit.category}
                      </span>
                    </div>

                    <div className="habit-stats">
                      {habit.analytics && (
                        <>
                          <div className="habit-stat">
                            <span className="stat-number">{habit.analytics.current_streak}</span>
                            <span className="stat-name">Current Streak</span>
                          </div>
                          <div className="habit-stat">
                            <span className="stat-number">{habit.analytics.total_completions}</span>
                            <span className="stat-name">Completed</span>
                          </div>
                          <div className="habit-stat">
                            <span className="stat-number">
                              {habit.analytics.success_rate.toFixed(0)}%
                            </span>
                            <span className="stat-name">Success Rate</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="habit-frequency">
                      <span className="frequency-badge">{habit.frequency}</span>
                    </div>

                    <button
                      className="btn btn-check-in"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCheckIn(habit.id);
                      }}
                      disabled={checkedIn.has(habit.id)}
                    >
                      {checkedIn.has(habit.id) ? '✓ Done Today' : 'Check In'}
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const getCategoryColor = (category) => {
  const colors = {
    health: 'primary',
    work: 'success',
    learning: 'danger',
    fitness: 'primary',
    mental_health: 'success',
    productivity: 'success',
    other: 'secondary',
  };
  return colors[category] || 'secondary';
};

export default Dashboard;
