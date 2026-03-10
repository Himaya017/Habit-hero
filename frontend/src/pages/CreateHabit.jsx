import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { habitsAPI } from '../api';
import '../styles/CreateHabit.css';

const CreateHabit = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    category: 'other',
    start_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    'health',
    'work',
    'learning',
    'fitness',
    'mental_health',
    'productivity',
    'other',
  ];

  const frequencies = ['daily', 'weekly'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Habit name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
      };

      const response = await habitsAPI.create(payload);
      navigate(`/habit/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-habit">
      <div className="create-habit-container">
        <h1>Create a New Habit</h1>
        <p className="subtitle">Start building a better routine today</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="habit-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Habit Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Morning Meditation, Read 30 min"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us more about this habit... Why is it important to you?"
              className="form-textarea"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="frequency" className="form-label">
                Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="form-select"
              >
                {frequencies.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat
                      .split('_')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="start_date" className="form-label">
              Start Date
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHabit;
