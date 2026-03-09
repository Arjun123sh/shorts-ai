import json
import os
from typing import List, Optional
from datetime import datetime
from app.models import Job, JobStatus

STORAGE_FILE = "jobs.json"


class Storage:
    def __init__(self, storage_path: str = STORAGE_FILE):
        self.storage_path = storage_path
        self._ensure_storage()

    def _ensure_storage(self):
        if not os.path.exists(self.storage_path):
            self._save_jobs([])

    def _load_jobs(self) -> List[Job]:
        try:
            with open(self.storage_path, "r") as f:
                data = json.load(f)
                return [Job(**job) for job in data]
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def _save_jobs(self, jobs: List[Job]):
        with open(self.storage_path, "w") as f:
            json.dump([job.model_dump(mode="json") for job in jobs], f, indent=2, default=str)

    def create_job(self, job: Job) -> Job:
        jobs = self._load_jobs()
        jobs.append(job)
        self._save_jobs(jobs)
        return job

    def get_job(self, job_id: str) -> Optional[Job]:
        jobs = self._load_jobs()
        for job in jobs:
            if job.id == job_id:
                return job
        return None

    def get_all_jobs(self) -> List[Job]:
        return self._load_jobs()

    def update_job(self, job_id: str, job_update: Job) -> Optional[Job]:
        jobs = self._load_jobs()
        for i, job in enumerate(jobs):
            if job.id == job_id:
                jobs[i] = job_update
                self._save_jobs(jobs)
                return job_update
        return None

    def delete_job(self, job_id: str) -> bool:
        jobs = self._load_jobs()
        original_len = len(jobs)
        jobs = [j for j in jobs if j.id != job_id]
        if len(jobs) < original_len:
            self._save_jobs(jobs)
            return True
        return False


storage = Storage()
