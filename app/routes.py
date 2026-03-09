from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
import os
import uuid
from datetime import datetime
import zipfile
import io
from app.models import Job, JobCreate, JobStatus, JobUpdate
from app.storage import storage
from app.agent import AIAgent
from app.processor import VideoProcessor

router = APIRouter()

OUTPUT_DIR = "./output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "f791182795f54016875c8104f9f55b97")


@router.post("/jobs", response_model=Job)
async def create_job(job_create: JobCreate):
    """Create a new video processing job"""
    job_id = str(uuid.uuid4())
    
    job = Job(
        id=job_id,
        youtube_url=job_create.youtube_url,
        status=JobStatus.PENDING,
        progress=0,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    storage.create_job(job)
    
    return job


@router.get("/jobs", response_model=List[Job])
async def get_all_jobs():
    """Get all jobs"""
    return storage.get_all_jobs()


@router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    """Get a specific job by ID"""
    job = storage.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    """Delete a job"""
    if not storage.delete_job(job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully"}


def run_processing_task(job_id: str, num_shorts: int):
    """Background task to run the video downloading and AI processing"""
    job = storage.get_job(job_id)
    if not job:
        return
        
    try:
        processor = VideoProcessor(OUTPUT_DIR)
        agent = AIAgent()
        
        job.progress = 5
        storage.update_job(job_id, job)
        
        video_path, audio_path, title, duration = processor.download_video(
            job.youtube_url, job_id,
            progress_callback=lambda p: (
                setattr(job, 'progress', 5 + int(p * 0.2)),
                storage.update_job(job_id, job)
            )
        )
        
        job.video_title = title
        job.video_duration = duration
        job.progress = 25
        storage.update_job(job_id, job)
        
        description = f"Video duration: {duration:.1f} seconds"
        segments = agent.analyze_video(title, description, duration, num_shorts)
        
        job.shorts = []
        job.progress = 30
        storage.update_job(job_id, job)
        
        processed_shorts = processor.process_all_shorts(
            video_path, audio_path, segments, job_id,
            progress_callback=lambda p: (
                setattr(job, 'progress', 30 + int(p * 0.65)),
                storage.update_job(job_id, job)
            )
        )
        
        job.shorts = processed_shorts
        job.status = JobStatus.COMPLETED
        job.progress = 100
        job.updated_at = datetime.now()
        storage.update_job(job_id, job)
        
        processor.cleanup_temp_files([video_path, audio_path])
        
    except Exception as e:
        job = storage.get_job(job_id)
        if job:
            job.status = JobStatus.FAILED
            job.error = str(e)
            job.updated_at = datetime.now()
            storage.update_job(job_id, job)


@router.post("/jobs/{job_id}/process")
async def process_job(job_id: str, background_tasks: BackgroundTasks, num_shorts: int = 5):
    """Start processing a job"""
    job = storage.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != JobStatus.PENDING:
        raise HTTPException(status_code=400, detail="Job already processed or processing")
    
    job.status = JobStatus.PROCESSING
    job.updated_at = datetime.now()
    storage.update_job(job_id, job)
    
    background_tasks.add_task(run_processing_task, job_id, num_shorts)
    
    return job


@router.get("/download/{filename}")
async def download_file(filename: str):
    """Download a processed short"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(filepath, media_type="video/mp4", filename=filename)


@router.get("/jobs/{job_id}/download-zip")
async def download_job_zip(job_id: str):
    """Download all shorts for a job as a zip file"""
    job = storage.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if not job.shorts or len(job.shorts) == 0:
        raise HTTPException(status_code=400, detail="No shorts generated for this job yet")
        
    from fastapi.responses import StreamingResponse
    
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for short in job.shorts:
            if short.file_path:
                file_path = os.path.join(OUTPUT_DIR, short.file_path)
                if os.path.exists(file_path):
                    zip_file.write(file_path, arcname=short.file_path)
                    
    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer, 
        media_type="application/zip", 
        headers={"Content-Disposition": f"attachment; filename=shorts_{job_id}.zip"}
    )
