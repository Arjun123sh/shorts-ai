from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ShortSegment(BaseModel):
    start_time: float
    end_time: float
    title: str
    description: str
    file_path: Optional[str] = None


class Job(BaseModel):
    id: str
    youtube_url: str
    status: JobStatus = JobStatus.PENDING
    progress: int = 0
    video_title: Optional[str] = None
    video_duration: Optional[float] = None
    shorts: List[ShortSegment] = []
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class JobCreate(BaseModel):
    youtube_url: str
    num_shorts: int = 5
    short_duration: int = 60


class JobUpdate(BaseModel):
    status: Optional[JobStatus] = None
    progress: Optional[int] = None
    video_title: Optional[str] = None
    video_duration: Optional[float] = None
    shorts: Optional[List[ShortSegment]] = None
    error: Optional[str] = None
