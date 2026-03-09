from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router

app = FastAPI(
    title="YouTube Shorts Generator API",
    description="AI-powered backend for generating YouTube shorts from long videos",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api", tags=["jobs"])


@app.get("/")
async def root():
    return {
        "message": "YouTube Shorts Generator API",
        "docs": "/docs",
        "endpoints": {
            "create_job": "POST /api/jobs",
            "get_all_jobs": "GET /api/jobs",
            "get_job": "GET /api/jobs/{job_id}",
            "delete_job": "DELETE /api/jobs/{job_id}",
            "process_job": "POST /api/jobs/{job_id}/process",
            "download": "GET /api/download/{filename}"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
