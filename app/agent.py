import json
from typing import List, Optional
from ollama import Client
from app.models import ShortSegment


class AIAgent:
    def __init__(self, model: str = "gpt-oss:120b-cloud"):
        self.client = Client(host="http://localhost:11434")
        self.model = model

    def analyze_video(self, video_title: str, video_description: str, 
                      video_duration: float, num_shorts: int) -> List[ShortSegment]:
        """
        Analyze video content and identify segments suitable for shorts.
        Uses AI to determine optimal segment boundaries.
        """
        try:
            prompt = self._build_analysis_prompt(
                video_title, video_description, video_duration, num_shorts
            )
            
            response = self.client.chat(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert video analyst that identifies viral-worthy segments from YouTube videos. You analyze video content to find engaging, standalone moments that can work as short-form content (30-60 seconds). Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                stream=False
            )
            
            content = response['message']['content']
            if not content:
                return self._generate_fallback_segments(video_duration, num_shorts)
            
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            result = json.loads(content)
            segments = self._parse_segments(result, video_duration)
            return segments
            
        except Exception as e:
            print(f"AI Analysis Error: {e}")
            return self._generate_fallback_segments(video_duration, num_shorts)

    def _build_analysis_prompt(self, title: str, description: str, 
                                duration: float, num_shorts: int) -> str:
        return f"""Analyze this YouTube video and identify the best {num_shorts} segments to turn into viral shorts/reels.

Video Title: {title}
Video Description: {description}
Total Duration: {duration:.1f} seconds ({duration/60:.1f} minutes)

Based on the title and description, identify {num_shorts} segments that would work well as standalone short-form content. Look for:
- Self-contained topics or ideas
- Engaging/memorable moments
- Tips, tricks, or valuable insights
- Emotional or exciting parts
- Clear start and end points

Return your analysis as a JSON object with this structure:
{{
    "segments": [
        {{
            "start_time": <start in seconds>,
            "end_time": <end in seconds>,
            "title": "<short, catchy title>",
            "description": "<brief description of what's in this segment>"
        }}
    ]
}}

Make sure segments are {30}-{60} seconds long and are distributed throughout the video."""

    def _parse_segments(self, result: dict, max_duration: float) -> List[ShortSegment]:
        segments = []
        if "segments" in result:
            for seg in result["segments"]:
                try:
                    start = float(seg.get("start_time", 0))
                    end = float(seg.get("end_time", start + 45))
                    duration = end - start
                    
                    if 20 <= duration <= 90 and start < max_duration:
                        segments.append(ShortSegment(
                            start_time=start,
                            end_time=min(end, start + 60),
                            title=seg.get("title", "Short"),
                            description=seg.get("description", "")
                        ))
                except (ValueError, TypeError):
                    continue
        
        return segments[:10]

    def _generate_fallback_segments(self, duration: float, num_shorts: int) -> List[ShortSegment]:
        """Generate evenly distributed segments if AI fails"""
        segment_duration = min(45, duration / num_shorts)
        segments = []
        
        for i in range(num_shorts):
            start = i * (duration / num_shorts)
            end = min(start + segment_duration, duration)
            if end - start >= 20:
                segments.append(ShortSegment(
                    start_time=start,
                    end_time=end,
                    title=f"Short {i+1}",
                    description=f"Segment from {start:.0f}s to {end:.0f}s"
                ))
        
        return segments
