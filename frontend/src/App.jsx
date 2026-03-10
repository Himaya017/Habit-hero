import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './App.css';

// Page components
import Dashboard from './pages/Dashboard';
import HabitDetail from './pages/HabitDetail';
import CreateHabit from './pages/CreateHabit';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-content">
            <h1 className="navbar-title">🎯 Habit Hero</h1>
            <button 
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        <div className="app-container">
          <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <nav className="sidebar-nav">
              <a href="/" className="nav-link">Dashboard</a>
              <a href="/create" className="nav-link">+ New Habit</a>
              <a href="/analytics" className="nav-link">Analytics</a>
              <a href="/reports" className="nav-link">Reports</a>
            </nav>
          </aside>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/habit/:id" element={<HabitDetail />} />
              <Route path="/create" element={<CreateHabit />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
