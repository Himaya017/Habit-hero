from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, Enum, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class FrequencyEnum(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"

class CategoryEnum(str, enum.Enum):
    HEALTH = "health"
    WORK = "work"
    LEARNING = "learning"
    FITNESS = "fitness"
    MENTAL_HEALTH = "mental_health"
    PRODUCTIVITY = "productivity"
    OTHER = "other"

class Habit(Base):
    __tablename__ = "habits"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    frequency = Column(Enum(FrequencyEnum), default="daily")
    category = Column(Enum(CategoryEnum), default="other")
    start_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    check_ins = relationship("CheckIn", back_populates="habit", cascade="all, delete-orphan")
    analytics = relationship("HabitAnalytics", back_populates="habit", uselist=False, cascade="all, delete-orphan")

class CheckIn(Base):
    __tablename__ = "check_ins"
    
    id = Column(Integer, primary_key=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    check_in_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    completed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    habit = relationship("Habit", back_populates="check_ins")

class HabitAnalytics(Base):
    __tablename__ = "habit_analytics"
    
    id = Column(Integer, primary_key=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False, unique=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_completions = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    best_day_of_week = Column(String(20), nullable=True)
    last_completed = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    habit = relationship("Habit", back_populates="analytics")
