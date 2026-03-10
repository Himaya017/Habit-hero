from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import Habit, CheckIn, HabitAnalytics, FrequencyEnum
from typing import Optional, List
from calendar import day_name

class HabitService:
    @staticmethod
    def create_habit(db: Session, habit_data) -> Habit:
        """Create a new habit and initialize analytics"""
        habit = Habit(
            name=habit_data.name,
            description=habit_data.description,
            frequency=habit_data.frequency,
            category=habit_data.category,
            start_date=habit_data.start_date or datetime.utcnow()
        )
        db.add(habit)
        db.flush()
        
        # Create analytics record
        analytics = HabitAnalytics(habit_id=habit.id)
        db.add(analytics)
        db.commit()
        db.refresh(habit)
        return habit
    
    @staticmethod
    def get_habit(db: Session, habit_id: int) -> Optional[Habit]:
        """Get a habit by ID"""
        return db.query(Habit).filter(Habit.id == habit_id).first()
    
    @staticmethod
    def get_all_habits(db: Session, active_only: bool = False) -> List[Habit]:
        """Get all habits with optional filter for active"""
        query = db.query(Habit)
        if active_only:
            query = query.filter(Habit.is_active == True)
        return query.all()
    
    @staticmethod
    def update_habit(db: Session, habit_id: int, habit_data) -> Optional[Habit]:
        """Update a habit"""
        habit = db.query(Habit).filter(Habit.id == habit_id).first()
        if not habit:
            return None
        
        update_data = habit_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(habit, field, value)
        
        habit.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(habit)
        return habit
    
    @staticmethod
    def delete_habit(db: Session, habit_id: int) -> bool:
        """Delete a habit and its related data"""
        habit = db.query(Habit).filter(Habit.id == habit_id).first()
        if not habit:
            return False
        
        db.delete(habit)
        db.commit()
        return True

class CheckInService:
    @staticmethod
    def create_check_in(db: Session, habit_id: int, check_in_data) -> Optional[CheckIn]:
        """Create a check-in for a habit"""
        habit = db.query(Habit).filter(Habit.id == habit_id).first()
        if not habit:
            return None
        
        check_in = CheckIn(
            habit_id=habit_id,
            notes=check_in_data.notes,
            completed=check_in_data.completed,
            check_in_date=datetime.utcnow()
        )
        db.add(check_in)
        db.commit()
        db.refresh(check_in)
        
        # Update analytics
        AnalyticsService.update_analytics(db, habit_id)
        
        return check_in
    
    @staticmethod
    def get_check_ins(db: Session, habit_id: int, days: int = 30) -> List[CheckIn]:
        """Get check-ins for a habit in the last N days"""
        start_date = datetime.utcnow() - timedelta(days=days)
        return db.query(CheckIn).filter(
            CheckIn.habit_id == habit_id,
            CheckIn.check_in_date >= start_date
        ).order_by(CheckIn.check_in_date.desc()).all()
    
    @staticmethod
    def update_check_in(db: Session, check_in_id: int, check_in_data) -> Optional[CheckIn]:
        """Update a check-in"""
        check_in = db.query(CheckIn).filter(CheckIn.id == check_in_id).first()
        if not check_in:
            return None
        
        update_data = check_in_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(check_in, field, value)
        
        db.commit()
        db.refresh(check_in)
        
        # Update analytics
        AnalyticsService.update_analytics(db, check_in.habit_id)
        
        return check_in
    
    @staticmethod
    def delete_check_in(db: Session, check_in_id: int) -> bool:
        """Delete a check-in"""
        check_in = db.query(CheckIn).filter(CheckIn.id == check_in_id).first()
        if not check_in:
            return False
        
        habit_id = check_in.habit_id
        db.delete(check_in)
        db.commit()
        
        # Update analytics
        AnalyticsService.update_analytics(db, habit_id)
        
        return True

class AnalyticsService:
    @staticmethod
    def update_analytics(db: Session, habit_id: int) -> Optional[HabitAnalytics]:
        """Update analytics for a habit"""
        habit = db.query(Habit).filter(Habit.id == habit_id).first()
        if not habit:
            return None
        
        analytics = db.query(HabitAnalytics).filter(HabitAnalytics.habit_id == habit_id).first()
        if not analytics:
            analytics = HabitAnalytics(habit_id=habit_id)
            db.add(analytics)
        
        # Get all check-ins
        check_ins = db.query(CheckIn).filter(
            CheckIn.habit_id == habit_id,
            CheckIn.completed == True
        ).order_by(CheckIn.check_in_date.desc()).all()
        
        # Update total completions
        analytics.total_completions = len(check_ins)
        
        # Update last completed
        if check_ins:
            analytics.last_completed = check_ins[0].check_in_date
        
        # Calculate current streak
        analytics.current_streak = AnalyticsService._calculate_current_streak(db, habit_id)
        
        # Calculate longest streak
        analytics.longest_streak = AnalyticsService._calculate_longest_streak(db, habit_id)
        
        # Calculate success rate
        all_check_ins = db.query(CheckIn).filter(CheckIn.habit_id == habit_id).count()
        analytics.success_rate = (analytics.total_completions / all_check_ins * 100) if all_check_ins > 0 else 0.0
        
        # Find best day of week
        analytics.best_day_of_week = AnalyticsService._find_best_day_of_week(db, habit_id)
        
        analytics.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(analytics)
        
        return analytics
    
    @staticmethod
    def _calculate_current_streak(db: Session, habit_id: int) -> int:
        """Calculate the current streak of completed check-ins"""
        check_ins = db.query(CheckIn).filter(
            CheckIn.habit_id == habit_id,
            CheckIn.completed == True
        ).order_by(CheckIn.check_in_date.desc()).all()
        
        if not check_ins:
            return 0
        
        streak = 0
        today = datetime.utcnow().date()
        
        for check_in in check_ins:
            check_in_date = check_in.check_in_date.date()
            if check_in_date == today or check_in_date == today - timedelta(days=streak):
                streak += 1
            else:
                break
        
        return streak
    
    @staticmethod
    def _calculate_longest_streak(db: Session, habit_id: int) -> int:
        """Calculate the longest streak ever achieved"""
        check_ins = db.query(CheckIn).filter(
            CheckIn.habit_id == habit_id,
            CheckIn.completed == True
        ).order_by(CheckIn.check_in_date).all()
        
        if not check_ins:
            return 0
        
        longest = 1
        current = 1
        
        for i in range(1, len(check_ins)):
            if (check_ins[i].check_in_date.date() - check_ins[i-1].check_in_date.date()).days == 1:
                current += 1
                longest = max(longest, current)
            else:
                current = 1
        
        return longest
    
    @staticmethod
    def _find_best_day_of_week(db: Session, habit_id: int) -> Optional[str]:
        """Find the day of week with most completions"""
        check_ins = db.query(CheckIn).filter(
            CheckIn.habit_id == habit_id,
            CheckIn.completed == True
        ).all()
        
        if not check_ins:
            return None
        
        day_counts = {i: 0 for i in range(7)}
        for check_in in check_ins:
            day_counts[check_in.check_in_date.weekday()] += 1
        
        best_day_index = max(day_counts, key=day_counts.get)
        return day_name[best_day_index]
    
    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        """Get dashboard statistics"""
        all_habits = db.query(Habit).all()
        active_habits = db.query(Habit).filter(Habit.is_active == True).all()
        
        # Count today's completions
        today = datetime.utcnow().date()
        today_completed = db.query(CheckIn).filter(
            CheckIn.check_in_date >= datetime.combine(today, datetime.min.time()),
            CheckIn.check_in_date < datetime.combine(today + timedelta(days=1), datetime.min.time()),
            CheckIn.completed == True
        ).count()
        
        # Find best performing habit
        best_habit = None
        if active_habits:
            best_habit = max(active_habits, key=lambda h: h.analytics.success_rate if h.analytics else 0)
        
        return {
            "total_habits": len(all_habits),
            "active_habits": len(active_habits),
            "today_completed": today_completed,
            "best_performing_habit": best_habit
        }
