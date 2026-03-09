# YouTube Shorts Generator - Specification

## Project Overview

- **Project Name**: YouTube Shorts Generator
- **Type**: Full-stack AI web application
- **Core Functionality**: AI-powered agent that automatically breaks down YouTube videos into viral-worthy shorts/reels with intelligent topic segmentation, captioning, and processing
- **Target Users**: Content creators, social media managers, video editors

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Streamlit     │────▶│   FastAPI       │
│   Frontend      │     │   Backend       │
└─────────────────┘     └─────────────────┘
                               │
                        ┌──────┴──────┐
                        ▼             ▼
                  ┌─────────┐   ┌─────────┐
                  │  AI     │   │ Video   │
                  │ Agent   │   │ Processing
                  └─────────┘   └─────────┘
```

---

## Tech Stack

- **Backend**: FastAPI
- **Frontend**: Streamlit
- **Video Processing**: moviepy, pytube
- **AI Agent**: OpenAI GPT-4o (for video analysis & segmentation)
- **Task Queue**: asyncio

---

## Functionality Specification

### 1. YouTube Video Download
- Accept YouTube URL input
- Download video using pytube
- Extract video metadata (title, duration, description)

### 2. AI Agent Video Analysis
- Analyze video content using GPT-4o with video frame sampling
- Identify engaging segments suitable for shorts
- Generate segment boundaries based on:
  - Topic changes
  - Key moments
  - High-engagement points
- Suggest optimal short durations (30-60 seconds)

### 3. Video Processing
- Segment videos into clips based on AI-identified boundaries
- Add vertical crop (9:16 aspect ratio)
- Generate captions/subtitles
- Add trending audio/music suggestions
- Export in MP4 format optimized for social media

### 4. Job Management
- Queue-based processing
- Progress tracking
- Status updates via polling/SSE
- Job history with re-download capability

---

## UI/UX Specification

### Streamlit Frontend

#### Layout
- **Header**: Logo + title "Shorts Generator"
- **Sidebar**: Settings (API keys, output preferences)
- **Main Area**: Video input + job list + results

#### Color Palette
- Primary: `#FF0000` (YouTube Red)
- Secondary: `#1A1A1A` (Dark background)
- Accent: `#00FF00` (Success Green)
- Text: `#FFFFFF` / `#B3B3B3`

#### Typography
- Font: Inter/System sans-serif
- Headings: Bold, 24-32px
- Body: Regular, 14-16px

#### Components
1. **URL Input**: Text field with YouTube URL + "Process" button
2. **Job Queue**: Table showing pending/processing/completed jobs
3. **Results Viewer**: Video player + download buttons
4. **Settings Panel**: API key inputs, output quality settings

---

## API Endpoints

### POST `/api/jobs`
Create new processing job
```json
{
  "youtube_url": "string",
  "num_shorts": 5,
  "short_duration": 60
}
```

### GET `/api/jobs/{job_id}`
Get job status and results

### GET `/api/jobs`
List all jobs

### DELETE `/api/jobs/{job_id}`
Delete a job

### GET `/api/download/{file_path}`
Download generated short

---

## Data Models

### Job
```python
{
  "id": "uuid",
  "youtube_url": "string",
  "status": "pending|processing|completed|failed",
  "progress": 0-100,
  "video_title": "string",
  "shorts": [
    {
      "start_time": float,
      "end_time": float,
      "title": "string",
      "file_path": "string"
    }
  ],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## Acceptance Criteria

1. ✅ User can input YouTube URL and start processing
2. ✅ AI agent analyzes video and identifies segments
3. ✅ Progress is shown in real-time
4. ✅ Generated shorts can be previewed and downloaded
5. ✅ Application handles errors gracefully
6. ✅ Multiple jobs can be queued
7. ✅ Jobs persist across sessions (JSON file storage)

---

## File Structure

```
shorts-generator/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app
│   ├── agent.py          # AI agent logic
│   ├── processor.py      # Video processing
│   ├── models.py         # Pydantic models
│   ├── storage.py        # Job persistence
│   └── routes.py         # API routes
├── frontend/
│   └── app.py            # Streamlit app
├── requirements.txt
├── .env.example
└── README.md
```
