from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

class FrequencyEnum(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"

class CategoryEnum(str, Enum):
    HEALTH = "health"
    WORK = "work"
    LEARNING = "learning"
    FITNESS = "fitness"
    MENTAL_HEALTH = "mental_health"
    PRODUCTIVITY = "productivity"
    OTHER = "other"

# CheckIn Schemas
class CheckInCreate(BaseModel):
    notes: Optional[str] = None
    completed: bool = True

class CheckInUpdate(BaseModel):
    notes: Optional[str] = None
    completed: Optional[bool] = None

class CheckInResponse(BaseModel):
    id: int
    habit_id: int
    check_in_date: datetime
    notes: Optional[str]
    completed: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Analytics Schemas
class AnalyticsResponse(BaseModel):
    id: int
    habit_id: int
    current_streak: int
    longest_streak: int
    total_completions: int
    success_rate: float
    best_day_of_week: Optional[str]
    last_completed: Optional[datetime]

    class Config:
        from_attributes = True

# Habit Schemas
class HabitCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    frequency: FrequencyEnum = FrequencyEnum.DAILY
    category: CategoryEnum = CategoryEnum.OTHER
    start_date: Optional[datetime] = None

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[FrequencyEnum] = None
    category: Optional[CategoryEnum] = None
    is_active: Optional[bool] = None

class HabitResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    frequency: FrequencyEnum
    category: CategoryEnum
    start_date: datetime
    created_at: datetime
    updated_at: datetime
    is_active: bool
    check_ins: List[CheckInResponse] = []
    analytics: Optional[AnalyticsResponse] = None

    class Config:
        from_attributes = True

class HabitListResponse(BaseModel):
    id: int
    name: str
    frequency: FrequencyEnum
    category: CategoryEnum
    is_active: bool
    analytics: Optional[AnalyticsResponse] = None

    class Config:
        from_attributes = True

# Dashboard Schema
class DashboardResponse(BaseModel):
    total_habits: int
    active_habits: int
    today_completed: int
    best_performing_habit: Optional[HabitListResponse]
    all_habits: List[HabitListResponse]
