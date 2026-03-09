import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Youtube, Wand2, Loader2 } from 'lucide-react';
import { createJob } from '../api';

export default function Home() {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!url) return;

        setIsLoading(true);
        setError(null);
        try {
            const job = await createJob(url);
            navigate(`/job/${job.id}`);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || "Failed to create job");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
            <div className="w-full max-w-2xl text-center space-y-8">

                <div className="space-y-4">
                    <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full mb-4">
                        <Youtube className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                        AI Shorts Generator
                    </h1>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto">
                        Transform your long-form YouTube videos into viral, bite-sized shorts automatically using local AI logic.
                    </p>
                </div>

                <div className="glass p-8 rounded-3xl mt-12 bg-slate-900/50">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="relative">
                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Paste YouTube Video URL here..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {error && <div className="text-red-400 text-sm text-left px-2">{error}</div>}

                        <button
                            type="submit"
                            disabled={isLoading || !url}
                            className="group relative flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating Job...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    Generate Shorts
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
