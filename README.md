# 🎬 AI Shorts Generator

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

[![AI Shorts Generator Demo](https://img.youtube.com/vi/jZuBO-QdFTs/maxresdefault.jpg)](https://youtu.be/jZuBO-QdFTs)

Transform your long-form YouTube videos into viral, bite-sized vertical shorts automatically using local AI logic. This application downloads a YouTube video, uses local AI via Ollama to analyze the transcript and find the most engaging segments, and then automatically edits those segments into standalone `.mp4` shorts perfect for TikTok, YouTube Shorts, or Instagram Reels.

## ✨ Features

- **Automated Clipping:** AI analyzes the video context and automatically extracts the best segments.
- **Customizable Output:** Choose exactly how many shorts you want to generate per video.
- **Vertical Formatting:** Automatically crops and formats videos to a vertical 9:16 ratio.
- **Background Processing:** Generates videos asynchronously without blocking the user interface.
- **Dashboard:** Track the progress of your video generation jobs in real-time.
- **Bulk Download:** Download individual shorts or download all generated clips simultaneously as a ZIP archive.
- **Modern UI:** Built with React, Tailwind CSS, and Lucide icons for a sleek, responsive experience.

## 🛠️ Tech Stack

### Backend
* **[FastAPI](https://fastapi.tiangolo.com/):** High-performance backend web framework.
* **[MoviePy](https://zulko.github.io/moviepy/):** Video editing, cropping, and rendering.
* **[pytubefix](https://pytubefix.readthedocs.io/):** Downloading raw YouTube video and audio streams.
* **[Ollama](https://ollama.com/):** Local, privacy-first intelligent transcript analysis to find clip boundaries.

### Frontend
* **[React](https://reactjs.org/) & [Vite](https://vitejs.dev/):** Fast, modern frontend framework and build tool.
* **[Tailwind CSS](https://tailwindcss.com/):** Utility-first CSS framework for rapid UI styling.
* **[React Router](https://reactrouter.com/):** Client-side navigation.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

You will need the following installed:
* **Python 3.9+**
* **Node.js** (v16 or higher recommended)
* **FFmpeg:** Required by MoviePy for video processing. (Ensure it's installed and added to your system's PATH).
* **Ollama:** Required for local AI analysis. Ensure Ollama is installed and running (`http://localhost:11434`). You will need to pull your preferred model (e.g. `ollama run gpt-oss:120b-cloud` or `llama3`).

### 1. Clone the Repository

```bash
git clone https://github.com/Arjun123sh/shorts-ai.git
cd shorts-generator
```

### 2. Backend Setup

Open a terminal in the root directory and set up the Python environment:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install required dependencies
pip install fastapi uvicorn pydantic pytubefix moviepy ollama python-dotenv
```

#### Environment Variables (Optional)
If your Ollama instance is not running on the default `http://localhost:11434`, or if you wish to adjust other settings like the `OUTPUT_DIR` or `MAX_SHORTS`, copy the `.env.example` file and configure it:

```bash
cp .env.example .env
```

#### Run the Backend Server
```bash
# Start the FastAPI server (runs on port 8000 by default)
uvicorn app.main:app --reload
```

### 3. Frontend Setup

Open a **new** terminal window and navigate to the frontend directory:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the React development server
npm run dev
```

The frontend will typically be accessible at `http://localhost:5173`.

---

## 🎮 Usage

1. Open the web app in your browser.
2. Paste a valid **YouTube Video URL** into the input field and click "Generate Shorts".
3. On the Job Details page, select the **Number of Shorts** you want to generate (e.g., 5).
4. Click **Start Processing**. The app will download the video, contact the AI to find timestamps, and edit the clips.
5. Watch the progress bar! Once complete, you can preview the shorts directly in the browser and download them individually or as a `.zip` file.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
