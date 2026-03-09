import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllJobs } from '../api';
import { Clock, CheckCircle2, XCircle, Loader2, Play } from 'lucide-react';

const StatusBadge = ({ status }) => {
    switch (status) {
        case 'completed': return <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-medium"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
        case 'processing': return <span className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full text-xs font-medium"><Loader2 className="w-3 h-3 animate-spin" /> Processing</span>;
        case 'failed': return <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-3 py-1 rounded-full text-xs font-medium"><XCircle className="w-3 h-3" /> Failed</span>;
        default: return <span className="flex items-center gap-1 text-slate-400 bg-slate-400/10 px-3 py-1 rounded-full text-xs font-medium"><Clock className="w-3 h-3" /> Pending</span>;
    }
};

export default function Dashboard() {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;
        getAllJobs()
            .then(data => {
                if (active) {
                    setJobs(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
                    setIsLoading(false);
                }
            })
            .catch(console.error);
        return () => active = false;
    }, []);

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Job Dashboard</h2>
                <div className="text-sm text-slate-400">{jobs.length} total jobs</div>
            </div>

            {jobs.length === 0 ? (
                <div className="glass p-12 text-center rounded-3xl">
                    <div className="text-slate-400 mb-4">You have no active or completed jobs.</div>
                    <Link to="/" className="text-blue-400 hover:text-blue-300 font-medium">Create your first shorts -{'>'}</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map(job => (
                        <Link key={job.id} to={`/job/${job.id}`} className="group block">
                            <div className="glass bg-slate-900/40 hover:bg-slate-800/60 p-6 rounded-3xl transition-all border border-slate-800 hover:border-slate-700 group-hover:-translate-y-1">
                                <div className="flex justify-between items-start mb-4">
                                    <StatusBadge status={job.status} />
                                    <span className="text-xs text-slate-500">
                                        {new Date(job.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                                    {job.video_title || job.youtube_url}
                                </h3>

                                {job.status === 'completed' && job.shorts && (
                                    <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
                                        <Play className="w-4 h-4" />
                                        <span>{job.shorts.length} shorts generated</span>
                                    </div>
                                )}

                                {job.status === 'processing' && (
                                    <div className="mt-4">
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${job.progress}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
