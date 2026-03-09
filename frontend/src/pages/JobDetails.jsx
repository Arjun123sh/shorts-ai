import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJob, processJob, getDownloadUrl, getZipDownloadUrl } from '../api';
import { Loader2, PlayCircle, Download, ArrowLeft, AlertCircle, Archive, Settings2 } from 'lucide-react';

export default function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [numShorts, setNumShorts] = useState(5);
    const wasProcessingRef = useRef(false);

    useEffect(() => {
        let active = true;
        let timer;

        const fetchJob = async () => {
            try {
                const data = await getJob(id);
                if (!active) return;

                if (data.status === 'processing') {
                    wasProcessingRef.current = true;
                    // Keep polling
                    timer = setTimeout(fetchJob, 2000);
                } else if (data.status === 'completed' && wasProcessingRef.current) {
                    navigate('/dashboard');
                    return;
                }

                setJob(data);
            } catch (err) {
                if (active) setError(err.message || 'Failed to fetch job');
            }
        };

        // Start polling initially
        fetchJob();

        // Also expose a way to manually trigger fetch (useful after starting processing)
        const checkStatus = () => {
            clearTimeout(timer);
            fetchJob();
        };

        // Let's attach this to the window temporarily so we don't have to rewrite everything
        window.__triggerJobPoll = checkStatus;

        return () => {
            active = false;
            clearTimeout(timer);
            delete window.__triggerJobPoll;
        };
    }, [id, navigate]);

    const handleStartProcessing = async () => {
        try {
            setIsProcessing(true);
            setError(null);
            await processJob(id, numShorts);
            setIsProcessing(false);

            setJob(prev => ({ ...prev, status: 'processing', progress: 5 }));
            wasProcessingRef.current = true;

            // Trigger the main polling loop
            if (window.__triggerJobPoll) {
                setTimeout(window.__triggerJobPoll, 1500);
            }

        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to start processing');
            setIsProcessing(false);
        }
    };

    const handleDownload = (filename) => {
        // Basic trick to trigger a download
        const link = document.createElement('a');
        link.href = getDownloadUrl(filename);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleZipDownload = () => {
        const link = document.createElement('a');
        link.href = getZipDownloadUrl(id);
        link.setAttribute('download', `shorts_${id}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    if (error) return (
        <div className="flex flex-col items-center justify-center p-12 text-center text-red-400 glass rounded-3xl mt-8 mx-auto max-w-2xl bg-red-500/10">
            <AlertCircle className="w-12 h-12 mb-4" />
            <h2 className="text-xl font-bold">Error Loading Job</h2>
            <p>{error}</p>
            <Link to="/dashboard" className="text-white mt-6 underline">Return to Dashboard</Link>
        </div>
    );

    if (!job) return (
        <div className="flex justify-center p-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>

            <div className="glass p-8 rounded-3xl bg-slate-900/60 border-slate-700/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {job.video_title || "YouTube Video"}
                            {job.status === 'completed' && <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider">Done</span>}
                            {job.status === 'failed' && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider">Error</span>}
                        </h1>
                        <p className="text-slate-400 text-sm mt-1 break-all flex items-center gap-2">
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">{job.id}</span>
                            <a href={job.youtube_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Source Video</a>
                            {job.video_duration && <span>• {Math.floor(job.video_duration / 60)}:{Math.floor(job.video_duration % 60).toString().padStart(2, '0')}</span>}
                        </p>
                    </div>

                    {job.status === 'pending' && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
                                <Settings2 className="w-4 h-4 text-slate-400" />
                                <label htmlFor="numShorts" className="text-sm font-medium text-slate-300">
                                    Number of Shorts:
                                </label>
                                <input
                                    id="numShorts"
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={numShorts}
                                    onChange={(e) => setNumShorts(Math.max(1, parseInt(e.target.value) || 1))}
                                    disabled={isProcessing}
                                    className="w-16 bg-transparent text-white border-b border-slate-600 focus:border-blue-500 focus:outline-none text-center disabled:opacity-50"
                                />
                            </div>

                            <button
                                onClick={handleStartProcessing}
                                disabled={isProcessing}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                                {isProcessing ? "Starting..." : "Start Processing"}
                            </button>
                        </div>
                    )}
                </div>

                {job.status === 'processing' && (
                    <div className="mt-8 space-y-3">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-blue-400 animate-pulse">AI is working its magic...</span>
                            <span>{job.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700 relative shadow-inner">
                            <div
                                className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                style={{ width: `${job.progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {job.status === 'failed' && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                        <strong>Error:</strong> {job.error || "An unknown error occurred during generation."}
                    </div>
                )}
            </div>

            {job.status === 'completed' && job.shorts?.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            Generated Shorts <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">{job.shorts.length}</span>
                        </h2>
                        <button
                            onClick={handleZipDownload}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-slate-700"
                        >
                            <Archive className="w-4 h-4 text-slate-300" />
                            Download ZIP
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {job.shorts.map((short, idx) => (
                            <div key={idx} className="glass rounded-3xl overflow-hidden bg-slate-800/40 flex flex-col hover:border-slate-600 transition-colors">
                                <div className="relative aspect-[9/16] bg-black group">
                                    <video
                                        src={getDownloadUrl(short.file_path)}
                                        controls
                                        playsInline
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-semibold text-lg line-clamp-2 leading-tight">{short.title}</h3>
                                    <p className="text-slate-400 text-sm mt-2 line-clamp-3 mb-4 flex-1">
                                        {short.description}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-auto">
                                        <span className="text-xs text-slate-500 font-mono tracking-wider">
                                            {Math.floor(short.start_time)}s - {Math.floor(short.end_time)}s
                                        </span>
                                        <button
                                            onClick={() => handleDownload(short.file_path)}
                                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors p-2 hover:bg-blue-500/10 rounded-lg"
                                        >
                                            <Download className="w-4 h-4" /> Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
