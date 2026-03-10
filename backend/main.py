from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import io

from config import get_db, init_db
from database import Habit, CheckIn, HabitAnalytics
from schemas import (
    HabitCreate, HabitUpdate, HabitResponse, HabitListResponse,
    CheckInCreate, CheckInUpdate, CheckInResponse,
    AnalyticsResponse, DashboardResponse
)
from services import HabitService, CheckInService, AnalyticsService
from pdf_utils import PDFReportGenerator

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title="Habit Hero API",
    description="A habit tracker API to build better routines",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== HABITS ====================

@app.post("/api/habits", response_model=HabitResponse)
def create_habit(habit: HabitCreate, db: Session = Depends(get_db)):
    """Create a new habit"""
    return HabitService.create_habit(db, habit)

@app.get("/api/habits", response_model=list[HabitListResponse])
def list_habits(active_only: bool = Query(False), db: Session = Depends(get_db)):
    """Get all habits"""
    habits = HabitService.get_all_habits(db, active_only=active_only)
    return habits

@app.get("/api/habits/{habit_id}", response_model=HabitResponse)
def get_habit(habit_id: int, db: Session = Depends(get_db)):
    """Get a specific habit with its check-ins"""
    habit = HabitService.get_habit(db, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit

@app.put("/api/habits/{habit_id}", response_model=HabitResponse)
def update_habit(habit_id: int, habit: HabitUpdate, db: Session = Depends(get_db)):
    """Update a habit"""
    updated_habit = HabitService.update_habit(db, habit_id, habit)
    if not updated_habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return updated_habit

@app.delete("/api/habits/{habit_id}")
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    """Delete a habit"""
    if not HabitService.delete_habit(db, habit_id):
        raise HTTPException(status_code=404, detail="Habit not found")
    return {"message": "Habit deleted successfully"}

# ==================== CHECK-INS ====================

@app.post("/api/habits/{habit_id}/check-ins", response_model=CheckInResponse)
def create_check_in(habit_id: int, check_in: CheckInCreate, db: Session = Depends(get_db)):
    """Create a check-in for a habit"""
    result = CheckInService.create_check_in(db, habit_id, check_in)
    if not result:
        raise HTTPException(status_code=404, detail="Habit not found")
    return result

@app.get("/api/habits/{habit_id}/check-ins", response_model=list[CheckInResponse])
def get_check_ins(habit_id: int, days: int = Query(30), db: Session = Depends(get_db)):
    """Get check-ins for a habit"""
    habit = HabitService.get_habit(db, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return CheckInService.get_check_ins(db, habit_id, days)

@app.put("/api/check-ins/{check_in_id}", response_model=CheckInResponse)
def update_check_in(check_in_id: int, check_in: CheckInUpdate, db: Session = Depends(get_db)):
    """Update a check-in"""
    updated = CheckInService.update_check_in(db, check_in_id, check_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Check-in not found")
    return updated

@app.delete("/api/check-ins/{check_in_id}")
def delete_check_in(check_in_id: int, db: Session = Depends(get_db)):
    """Delete a check-in"""
    if not CheckInService.delete_check_in(db, check_in_id):
        raise HTTPException(status_code=404, detail="Check-in not found")
    return {"message": "Check-in deleted successfully"}

# ==================== ANALYTICS ====================

@app.get("/api/habits/{habit_id}/analytics", response_model=AnalyticsResponse)
def get_analytics(habit_id: int, db: Session = Depends(get_db)):
    """Get analytics for a habit"""
    habit = HabitService.get_habit(db, habit_id)
    if not habit or not habit.analytics:
        raise HTTPException(status_code=404, detail="Analytics not found")
    return habit.analytics

@app.post("/api/habits/{habit_id}/analytics/refresh")
def refresh_analytics(habit_id: int, db: Session = Depends(get_db)):
    """Refresh analytics for a habit"""
    habit = HabitService.get_habit(db, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    analytics = AnalyticsService.update_analytics(db, habit_id)
    return analytics

# ==================== DASHBOARD ====================

@app.get("/api/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """Get dashboard with summary stats and habits"""
    stats = AnalyticsService.get_dashboard_stats(db)
    habits = HabitService.get_all_habits(db, active_only=True)
    
    return {
        "total_habits": stats["total_habits"],
        "active_habits": stats["active_habits"],
        "today_completed": stats["today_completed"],
        "best_performing_habit": stats["best_performing_habit"],
        "all_habits": habits
    }

# ==================== REPORTS ====================

@app.get("/api/reports/progress")
def generate_progress_report(habit_ids: str = Query(None), db: Session = Depends(get_db)):
    """Generate a PDF progress report"""
    habit_id_list = None
    if habit_ids:
        habit_id_list = [int(id) for id in habit_ids.split(",")]
    
    pdf_bytes = PDFReportGenerator.generate_progress_report(db, habit_id_list)
    
    return FileResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        filename=f"habit_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    )

# ==================== HEALTH ====================

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
