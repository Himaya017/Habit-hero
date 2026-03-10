# 🚀 Deployment Guide

## Option 1: Vercel + Railway

### Deploy Frontend to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Habit Hero"
   git remote add origin https://github.com/yourusername/habit-hero.git
   git push -u origin main
   ```

2. **Deploy Frontend**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Set `Root Directory` to `frontend`
   - Add environment variable: `REACT_APP_API_URL=YOUR_RAILWAY_API_URL`
   - Click "Deploy"

### Deploy Backend to Railway

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "GitHub Repo"
   - Connect your repository

2. **Configure Backend Service**
   - Select the repository
   - Railway will detect `requirements.txt`
   - Set `Root Directory` to `backend`
   - Add environment variable: `DATABASE_URL=sqlite:///./habit_hero.db`

3. **Deploy**
   - Click "Deploy"
   - Railway will automatically deploy on git push

4. **Get API URL**
   - Go to your Railway project
   - Copy the domain URL
   - This is your `REACT_APP_API_URL` for Vercel

---

## Option 2: Docker Deployment

### Build and Run Locally

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Access the app
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Deploy to Docker Hub

1. **Build images**
   ```bash
   docker build -t yourusername/habit-hero-backend:latest ./backend
   docker build -t yourusername/habit-hero-frontend:latest ./frontend
   ```

2. **Push to Docker Hub**
   ```bash
   docker push yourusername/habit-hero-backend:latest
   docker push yourusername/habit-hero-frontend:latest
   ```

3. **Deploy using docker-compose**
   ```bash
   docker-compose up -d
   ```

---

## Option 3: Traditional VPS (AWS, DigitalOcean, Linode)

### Backend Deployment

1. **SSH into server**
   ```bash
   ssh root@your_server_ip
   ```

2. **Install Python & dependencies**
   ```bash
   apt update && apt upgrade -y
   apt install python3-pip python3-venv
   ```

3. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/habit-hero.git
   cd habit-hero/backend
   ```

4. **Setup Python environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Run with Gunicorn**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 main:app
   ```

### Frontend Deployment

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt install -y nodejs
   ```

2. **Build and serve**
   ```bash
   cd habit-hero/frontend
   npm install
   npm run build
   npm install -g serve
   serve -s build -l 3000
   ```

3. **Setup Nginx reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           proxy_pass http://localhost:3000;
       }

       location /api {
           proxy_pass http://localhost:8000;
       }
   }
   ```

---

## Option 4: Heroku (if git push deployment preferred)

### Procfile for Backend
```
web: gunicorn -w 4 -b 0.0.0.0:$PORT main:app
```

### Deploy
```bash
heroku create habit-hero-api
git subtree push --prefix backend heroku main
```

---

## Environment Variables

### Production Backend
```
DATABASE_URL=postgresql://user:pass@host:port/db
CORS_ORIGINS=https://yourdomain.com
DEBUG=False
```

### Production Frontend
```
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## Database Migrations

For production with PostgreSQL:

```bash
# Install psycopg2
pip install psycopg2-binary

# Update DATABASE_URL in config.py
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/habit_hero")

# Create tables
python -c "from database import Base; from config import engine; Base.metadata.create_all(engine)"
```

---

## SSL Certificate

Use Let's Encrypt with Certbot:

```bash
apt install certbot python3-certbot-nginx
certbot certonly --nginx -d yourdomain.com
```

---

## Monitoring & Logging

### Enable application logging
```bash
# Backend logs
tail -f /var/log/habit-hero.log

# Frontend errors
# Check browser console
```

---

## Backup Strategy

### Database Backup
```bash
# SQLite
cp habit_hero.db habit_hero.backup.db

# PostgreSQL
pg_dump dbname > backup.sql
```

### Automated Backup (Cron)
```bash
# Add to crontab
0 2 * * * cp /path/to/habit_hero.db /backups/habit_hero.$(date +\%Y\%m\%d).db
```

---

## Troubleshooting

### CORS Issues
- Ensure frontend URL is in backend CORS origins
- Check API endpoint configuration

### Database Connection Errors
- Verify DATABASE_URL format
- Check database is accessible
- Ensure migrations are run

### Port Already in Use
```bash
# Find and kill process
lsof -i :8000
kill -9 <PID>
```

---

## Helpful Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)
