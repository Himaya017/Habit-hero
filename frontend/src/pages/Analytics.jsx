import React, { useState, useEffect } from 'react';
import { habitsAPI, analyticsAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/Analytics.css';

const Analytics = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await habitsAPI.getAll();
      setHabits(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics"><div className="spinner"></div></div>;
  }

  const successData = habits
    .filter((h) => h.analytics)
    .map((h) => ({
      name: h.name.length > 15 ? h.name.substring(0, 15) + '...' : h.name,
      'Success Rate': Math.round(h.analytics.success_rate),
    }));

  const streakData = habits
    .filter((h) => h.analytics)
    .map((h) => ({
      name: h.name.length > 15 ? h.name.substring(0, 15) + '...' : h.name,
      'Current Streak': h.analytics.current_streak,
      'Longest Streak': h.analytics.longest_streak,
    }));

  const categoryData = {};
  habits.forEach((h) => {
    categoryData[h.category] = (categoryData[h.category] || 0) + 1;
  });

  const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
    name: category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    value: count,
  }));

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6'];

  return (
    <div className="analytics">
      <h1>Analytics & Insights</h1>
      {error && <div className="alert alert-error">{error}</div>}

      {habits.length === 0 ? (
        <div className="empty-state">
          <p>No habits to analyze yet. Create some habits to see analytics!</p>
        </div>
      ) : (
        <>
          <div className="charts-grid">
            {successData.length > 0 && (
              <div className="chart-container">
                <h2>Success Rate by Habit</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={successData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="Success Rate" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {streakData.length > 0 && (
              <div className="chart-container">
                <h2>Streaks Comparison</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={streakData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend />
                    <Bar dataKey="Current Streak" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Longest Streak" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {categoryChartData.length > 0 && (
              <div className="chart-container">
                <h2>Habits by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="stats-summary">
            <h2>Summary Statistics</h2>
            <div className="stats-cards">
              <div className="stat-card-summary">
                <span className="stat-label">Total Habits</span>
                <span className="stat-value">{habits.length}</span>
              </div>
              <div className="stat-card-summary">
                <span className="stat-label">Active Habits</span>
                <span className="stat-value">{habits.filter((h) => h.is_active).length}</span>
              </div>
              <div className="stat-card-summary">
                <span className="stat-label">Average Success Rate</span>
                <span className="stat-value">
                  {habits.filter((h) => h.analytics).length > 0
                    ? (
                      habits.reduce((sum, h) => sum + (h.analytics?.success_rate || 0), 0) /
                      habits.filter((h) => h.analytics).length
                    ).toFixed(1)
                    : '0'}
                  %
                </span>
              </div>
              <div className="stat-card-summary">
                <span className="stat-label">Total Check-ins</span>
                <span className="stat-value">
                  {habits.reduce((sum, h) => sum + (h.analytics?.total_completions || 0), 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="top-performers">
            <h2>Top Performers</h2>
            <div className="performers-list">
              {habits
                .filter((h) => h.analytics)
                .sort((a, b) => b.analytics.success_rate - a.analytics.success_rate)
                .slice(0, 5)
                .map((habit) => (
                  <div key={habit.id} className="performer-item">
                    <div className="performer-info">
                      <h3>{habit.name}</h3>
                      <p>{habit.category}</p>
                    </div>
                    <div className="performer-stats">
                      <div className="stat">
                        <span className="label">Success</span>
                        <span className="value">{habit.analytics.success_rate.toFixed(1)}%</span>
                      </div>
                      <div className="stat">
                        <span className="label">Current Streak</span>
                        <span className="value">{habit.analytics.current_streak}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
