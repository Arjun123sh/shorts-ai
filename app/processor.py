import os
import asyncio
from typing import Optional, Callable
from pytubefix import YouTube
import PIL.Image
if not hasattr(PIL.Image, 'ANTIALIAS'):
    PIL.Image.ANTIALIAS = PIL.Image.LANCZOS

from moviepy.editor import VideoFileClip, vfx
from app.models import ShortSegment


class VideoProcessor:
    def __init__(self, output_dir: str = "./output"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def download_video(self, url: str, job_id: str, 
                            progress_callback: Optional[Callable] = None) -> tuple[str, str, str, float]:
        """Download YouTube video/audio separately and return paths, title, duration"""
        try:
            yt = YouTube(url)
            
            if progress_callback:
                yt.register_on_progress_callback(
                    lambda stream, chunk, bytes_remaining: progress_callback(
                        int(100 - (bytes_remaining / stream.filesize * 100))
                    )
                )
            
            # Get highest resolution video stream (often has no audio)
            video_stream = yt.streams.filter(adaptive=True, type="video", file_extension="mp4").order_by('resolution').desc().first()
            if not video_stream:
                video_stream = yt.streams.filter(type="video").order_by('resolution').desc().first()
                
            # Get highest quality audio stream
            audio_stream = yt.streams.filter(adaptive=True, type="audio").order_by('abr').desc().first()
            if not audio_stream:
                audio_stream = yt.streams.filter(type="audio").first()
                
            if not video_stream or not audio_stream:
                raise Exception("Could not find both video and audio streams")
            
            video_filename = f"{job_id}_video_raw.mp4"
            audio_filename = f"{job_id}_audio_raw.mp4"
            
            video_path = os.path.join(self.output_dir, video_filename)
            audio_path = os.path.join(self.output_dir, audio_filename)
            
            video_stream.download(output_path=self.output_dir, filename=video_filename)
            audio_stream.download(output_path=self.output_dir, filename=audio_filename)
            
            clip = VideoFileClip(video_path)
            duration = clip.duration
            title = yt.title
            clip.close()
            
            return video_path, audio_path, title, duration
            
        except Exception as e:
            raise Exception(f"Failed to download high-quality video: {str(e)}")

    def process_short(self, video_path: str, audio_path: str, segment: ShortSegment, 
                            job_id: str, index: int,
                            progress_callback: Optional[Callable] = None) -> str:
        """Process a single short segment from the video"""
        try:
            output_filename = f"{job_id}_short_{index}.mp4"
            output_path = os.path.join(self.output_dir, output_filename)
            
            clip = VideoFileClip(video_path)
            subclip = clip.subclip(segment.start_time, segment.end_time)
            
            # Attach highest quality audio
            from moviepy.editor import AudioFileClip
            audio_clip = AudioFileClip(audio_path)
            audio_subclip = audio_clip.subclip(segment.start_time, segment.end_time)
            subclip = subclip.set_audio(audio_subclip)
            
            target_width = 1080
            target_height = 1920
            
            current_aspect = clip.w / clip.h
            
            if current_aspect > 9/16:
                new_width = int(clip.h * 9 / 16)
                x_center = clip.w / 2
                subclip = subclip.crop(
                    x1=x_center - new_width/2,
                    x2=x_center + new_width/2
                )
            else:
                new_height = int(clip.w * 16 / 9)
                y_center = clip.h / 2
                subclip = subclip.crop(
                    y1=y_center - new_height/2,
                    y2=y_center + new_height/2
                )
            
            subclip = subclip.resize(newsize=(target_width, target_height))
            
            subclip.write_videofile(
                output_path,
                codec="libx264",
                audio_codec="aac",
                fps=24,
                preset="fast",
                verbose=False,
                logger=None
            )
            
            clip.close()
            audio_clip.close()
            subclip.close()
            
            if progress_callback:
                progress_callback(100)
            
            return output_filename
            
        except Exception as e:
            print(f"Error processing short {index}: {e}")
            raise Exception(f"Failed to process segment: {str(e)}")

    def process_all_shorts(self, video_path: str, audio_path: str, segments: list[ShortSegment],
                                  job_id: str, 
                                  progress_callback: Optional[Callable] = None) -> list[ShortSegment]:
        """Process all segments into shorts"""
        processed_shorts = []
        total_segments = len(segments)
        
        for i, segment in enumerate(segments):
            try:
                file_path = self.process_short(
                    video_path, audio_path, segment, job_id, i + 1,
                    lambda p: progress_callback((i * 100 + p) // total_segments) if progress_callback else None
                )
                
                processed_segment = ShortSegment(
                    start_time=segment.start_time,
                    end_time=segment.end_time,
                    title=segment.title,
                    description=segment.description,
                    file_path=file_path
                )
                processed_shorts.append(processed_segment)
                
            except Exception as e:
                print(f"Failed to process segment {i}: {e}")
                continue
        
        return processed_shorts

    def cleanup_temp_files(self, paths: list[str]):
        """Clean up temporary files"""
        for path in paths:
            try:
                if path and os.path.exists(path):
                    os.remove(path)
            except Exception as e:
                print(f"Cleanup error for {path}: {e}")
