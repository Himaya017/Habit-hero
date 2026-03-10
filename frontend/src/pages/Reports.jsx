import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { habitsAPI, reportsAPI } from '../api';
import '../styles/Reports.css';

const Reports = () => {
  const [habits, setHabits] = useState([]);
  const [selectedHabits, setSelectedHabits] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const response = await habitsAPI.getAll();
      setHabits(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load habits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHabit = (habitId) => {
    const newSelected = new Set(selectedHabits);
    if (newSelected.has(habitId)) {
      newSelected.delete(habitId);
    } else {
      newSelected.add(habitId);
    }
    setSelectedHabits(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedHabits.size === habits.length) {
      setSelectedHabits(new Set());
    } else {
      setSelectedHabits(new Set(habits.map((h) => h.id)));
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const habitIds = selectedHabits.size > 0 ? Array.from(selectedHabits) : null;
      const response = await reportsAPI.generateProgressReport(habitIds);

      // Create a blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `habit-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to generate report');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="reports"><div className="spinner"></div></div>;
  }

  return (
    <div className="reports">
      <h1>Progress Reports</h1>
      <p className="subtitle">Generate PDF reports of your habit progress</p>

      {error && <div className="alert alert-error">{error}</div>}

      {habits.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <p>No habits to report on. Create some habits first!</p>
        </div>
      ) : (
        <div className="reports-container">
          <div className="report-card">
            <div className="report-header">
              <h2>Select Habits</h2>
              <button className="link-button" onClick={handleSelectAll}>
                {selectedHabits.size === habits.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="habits-checklist">
              {habits.map((habit) => (
                <label key={habit.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedHabits.has(habit.id)}
                    onChange={() => handleSelectHabit(habit.id)}
                    className="checkbox"
                  />
                  <span className="checkbox-label">
                    <span className="habit-name">{habit.name}</span>
                    <span className="habit-category">{habit.category}</span>
                  </span>
                </label>
              ))}
            </div>

            <div className="report-actions">
              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="btn btn-primary btn-lg"
              >
                <Download size={20} />
                {generating ? 'Generating...' : 'Generate Report (PDF)'}
              </button>
              {selectedHabits.size > 0 && (
                <span className="selection-info">
                  {selectedHabits.size} of {habits.length} habits selected
                </span>
              )}
            </div>
          </div>

          <div className="report-info">
            <h3>What's in the Report?</h3>
            <ul className="info-list">
              <li>📊 Summary statistics of your habits</li>
              <li>🔥 Current and longest streaks</li>
              <li>✅ Total completions and success rates</li>
              <li>📅 Best days of the week for each habit</li>
              <li>📈 Detailed analytics for each selected habit</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
