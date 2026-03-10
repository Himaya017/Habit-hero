# 🎯 Habit Hero

A comprehensive habit tracking application to build better routines and stay consistent. Track daily and weekly habits, monitor progress through analytics, and generate detailed reports of your habits.

**[Live Demo]** | **[Documentation]** | **[Support]**

---

## ✨ Features

### Core Features
- ✅ **Create Habits** - Add habits with custom name, frequency, category, and start date
- 📝 **Track Progress** - Daily check-ins with optional notes
- 📊 **Visual Analytics** - Track streaks, success rates, and completion patterns
- 🏆 **Performance Metrics**
  - Current streak counter
  - Longest streak tracking
  - Success rate calculations
  - Best day of week analysis
- 📁 **Categorization** - Organize habits by Health, Work, Learning, Fitness, Mental Health, Productivity, or Other
- 📅 **Frequency Options** - Daily and weekly habits with different tracking

### Advanced Features
- 📈 **Interactive Charts** - Visualize habit performance with bar charts and pie charts
- 📋 **PDF Reports** - Generate comprehensive progress reports for selected habits
- 🎯 **Dashboard** - Real-time overview of all habits and daily progress
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔄 **Real-time Updates** - Instant analytics refresh after check-ins
- 🎨 **Modern UI** - Clean, intuitive interface with smooth animations

### Tech Stack
- **Frontend**: React 18 with Recharts for data visualization
- **Backend**: FastAPI with Python
- **Database**: SQLite (easily upgradeable to PostgreSQL)
- **Additional**: SQLAlchemy ORM, Pydantic validation, ReportLab for PDF generation

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**
   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file** (optional)
   ```bash
   echo "REACT_APP_API_URL=http://localhost:8000" > .env
   ```

4. **Start development server**
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

---

## 📁 Project Structure

```
habit-hero/
├── backend/
│   ├── main.py              # FastAPI application & routes
│   ├── database.py          # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── config.py            # Database configuration
│   ├── services.py          # Business logic
│   ├── pdf_utils.py         # PDF report generation
│   ├── requirements.txt     # Python dependencies
│   └── habit_hero.db        # SQLite database (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main app component with routing
│   │   ├── App.css          # Global styles
│   │   ├── api.js           # API client
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── CreateHabit.jsx  # Create new habit form
│   │   │   ├── HabitDetail.jsx  # Habit details & check-ins
│   │   │   ├── Analytics.jsx    # Analytics & charts
│   │   │   └── Reports.jsx      # PDF report generation
│   │   └── styles/
│   │       ├── Dashboard.css
│   │       ├── CreateHabit.css
│   │       ├── HabitDetail.css
│   │       ├── Analytics.css
│   │       └── Reports.css
│   ├── package.json
│   └── .env                 # API configuration
│
└── README.md
```

---

## 🔌 API Endpoints

### Habits
- `POST /api/habits` - Create a new habit
- `GET /api/habits` - List all habits
- `GET /api/habits/{id}` - Get habit details
- `PUT /api/habits/{id}` - Update habit
- `DELETE /api/habits/{id}` - Delete habit

### Check-ins
- `POST /api/habits/{habit_id}/check-ins` - Create check-in
- `GET /api/habits/{habit_id}/check-ins` - Get check-ins
- `PUT /api/check-ins/{id}` - Update check-in
- `DELETE /api/check-ins/{id}` - Delete check-in

### Analytics
- `GET /api/habits/{habit_id}/analytics` - Get habit analytics
- `POST /api/habits/{habit_id}/analytics/refresh` - Refresh analytics

### Dashboard
- `GET /api/dashboard` - Get dashboard stats

### Reports
- `GET /api/reports/progress` - Generate PDF report

---

## 💾 Database Schema

### Habits Table
- `id` - Primary key
- `name` - Habit name
- `description` - Optional description
- `frequency` - 'daily' or 'weekly'
- `category` - Health, Work, Learning, Fitness, Mental Health, Productivity, Other
- `start_date` - When habit started
- `is_active` - Active status
- `created_at`, `updated_at` - Timestamps

### Check-ins Table
- `id` - Primary key
- `habit_id` - Foreign key to Habits
- `check_in_date` - When check-in was recorded
- `notes` - Optional notes
- `completed` - Completion status
- `created_at` - Timestamp

### Analytics Table
- `id` - Primary key
- `habit_id` - Foreign key to Habits
- `current_streak` - Current consecutive completions
- `longest_streak` - Best streak ever
- `total_completions` - Total check-ins completed
- `success_rate` - Percentage of attempted completions
- `best_day_of_week` - Most productive day
- `last_completed` - Last check-in date

---

## 🎨 UI Features

### Dashboard
- Real-time habit statistics
- Quick check-in buttons
- Habit cards with performance metrics
- Daily completion counter

### Habit Detail Page
- Full habit information
- Check-in history with notes
- Analytics cards showing streaks and stats
- Quick check-in form
- Delete check-in functionality

### Analytics Page
- Success rate comparison chart
- Streak comparison chart
- Category distribution pie chart
- Summary statistics
- Top 5 performing habits

### Reports Page
- Select multiple habits for reporting
- Generate comprehensive PDF reports
- Report includes:
  - Summary statistics
  - Individual habit metrics
  - Success rates and streaks
  - Best days of the week

---

## 🔐 API Examples

### Create a Habit
```bash
curl -X POST http://localhost:8000/api/habits \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Meditation",
    "description": "10 minutes of meditation",
    "frequency": "daily",
    "category": "mental_health"
  }'
```

### Create a Check-in
```bash
curl -X POST http://localhost:8000/api/habits/1/check-ins \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true,
    "notes": "Great session today!"
  }'
```

### Get Analytics
```bash
curl http://localhost:8000/api/habits/1/analytics
```

### Generate Report
```bash
curl http://localhost:8000/api/reports/progress?habit_ids=1,2,3 \
  -o report.pdf
```

---

## 🌱 Future Enhancements

- [ ] User authentication & multi-user support
- [ ] Habit recommendations based on AI
- [ ] Mood & motivation trend analysis
- [ ] Google Calendar integration
- [ ] Push notifications and reminders
- [ ] Social features (friend tracking, challenges)
- [ ] Habit templates library
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Multiple data export formats (CSV, JSON)

---

## 🐛 Troubleshooting

### Backend Issues

**Port 8000 already in use**
```bash
# Change port
python -m uvicorn main:app --port 8001
```

**Database errors**
```bash
# Delete existing database and recreate
rm habit_hero.db
python main.py
```

**Import errors**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Issues

**API connection errors**
- Ensure backend is running on port 8000
- Check `.env` file has correct `REACT_APP_API_URL`
- Clear browser cache

**Module not found**
```bash
# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Usage Tips

1. **Create Habits** - Start with 3-5 core habits you want to track
2. **Daily Check-ins** - Check in at the same time each day for consistency
3. **Add Notes** - Use notes to track what worked or challenges you faced
4. **Review Analytics** - Check charts weekly to identify patterns
5. **Generate Reports** - Use PDF reports to celebrate progress and adjust goals

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review API documentation at `/docs`

---

## 🎯 Made with ❤️ for Better Habits

Build consistency, one day at a time.

**Start tracking your habits today!** 🚀
