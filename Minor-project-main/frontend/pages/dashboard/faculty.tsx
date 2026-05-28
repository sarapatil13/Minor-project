import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';

export default function FacultyDashboard() {
    const [user, setUser] = useState<any>(null);
    const [pendingPapers, setPendingPapers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Review Modal State
    const [selectedPaper, setSelectedPaper] = useState<any>(null);
    const [pdfViewed, setPdfViewed] = useState(false);
    const [comments, setComments] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchPendingPapers();
    }, []);

    const fetchPendingPapers = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await api.get('/papers/pending');
            setPendingPapers(res.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to load papers');
        } finally { setLoading(false); }
    };

    const openReview = (paper: any) => {
        setSelectedPaper(paper);
        setPdfViewed(false);
        setComments('');
    };

    const handleAction = async (action: 'approve' | 'reject' | 'request_revision') => {
        if (!selectedPaper) return;
        if (action === 'approve' && !pdfViewed) {
            return alert('You must view the PDF before approving.');
        }

        setActionLoading(true);
        try {
            await api.put(`/papers/${selectedPaper._id}/status`, {
                action,
                comments
            });
            setSelectedPaper(null);
            fetchPendingPapers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-44">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic mb-2">
                            Review <span className="text-blue-600">Command</span>
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">Manage institutional submissions and scholarly impact.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-8 py-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[28px] border border-white/20 dark:border-slate-800/30 shadow-xl text-center">
                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Queue</p>
                            <p className="text-2xl font-black text-blue-600">{pendingPapers.length}</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Review List */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex justify-between items-center px-4">
                            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Pending Protocol</h3>
                            <button onClick={fetchPendingPapers} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                                <svg className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center opacity-40">
                                <p className="text-[10px] font-black uppercase tracking-widest">Scanning Repository...</p>
                            </div>
                        ) : pendingPapers.length === 0 ? (
                            <div className="p-16 text-center bg-white dark:bg-slate-900/40 rounded-[40px] border-2 border-dashed dark:border-slate-800">
                                <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px]">Queue Clear</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {pendingPapers.map(p => (
                                    <button
                                        key={p._id}
                                        onClick={() => openReview(p)}
                                        className={`w-full text-left p-6 rounded-[32px] border transition-all duration-300 group ${selectedPaper?._id === p._id
                                            ? 'bg-blue-600 border-blue-600 shadow-2xl shadow-blue-500/30 translate-x-2'
                                            : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-blue-400'
                                            }`}
                                    >
                                        <p className={`font-black tracking-tight mb-2 line-clamp-2 ${selectedPaper?._id === p._id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                            {p.title}
                                        </p>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${selectedPaper?._id === p._id ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                                                }`}>
                                                {p.type}
                                            </span>
                                            <span className={`text-[10px] font-bold ${selectedPaper?._id === p._id ? 'text-white/60' : 'text-slate-400'}`}>
                                                {new Date(p.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Review Workspace */}
                    <div className="lg:col-span-8">
                        {selectedPaper ? (
                            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[48px] border border-white/20 dark:border-slate-800/30 shadow-2xl overflow-hidden flex flex-col h-[800px]">
                                {/* Workspace Header */}
                                <div className="p-8 border-b border-white/10 flex justify-between items-start bg-white/50 dark:bg-slate-900/20">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Awaiting Decision</span>
                                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Protocol V1.4</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{selectedPaper.title}</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-bold uppercase tracking-wider italic">Origin: {selectedPaper.submittedBy?.fullName}</p>
                                    </div>
                                    <button onClick={() => setSelectedPaper(null)} className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-2xl transition-all">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                {/* Viewer */}
                                <div className="flex-1 bg-slate-950 relative group">
                                    {!pdfViewed ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                                            <div className="w-20 h-20 rounded-full bg-blue-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">Institutional Security protocol: review original media</p>
                                            <button
                                                onClick={() => { setPdfViewed(true); }}
                                                className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/40 hover:scale-105 transition-all"
                                            >
                                                Initialize Review
                                            </button>
                                        </div>
                                    ) : (
                                        <object data={selectedPaper.pdfUrl} type="application/pdf" className="w-full h-full">
                                            <iframe src={selectedPaper.pdfUrl} className="w-full h-full">
                                                <div className="flex flex-col items-center justify-center h-full text-white p-12">
                                                    <p className="mb-4">Standard Embed failed.</p>
                                                    <a href={selectedPaper.pdfUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition">External Media Access</a>
                                                </div>
                                            </iframe>
                                        </object>
                                    )}
                                </div>

                                {/* Action Console */}
                                <div className="p-8 bg-white dark:bg-slate-900 flex flex-col gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Review Feedback</p>
                                            <textarea
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-slate-600 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 h-20"
                                                placeholder="Enter institutional feedback..."
                                                value={comments}
                                                onChange={e => setComments(e.target.value)}
                                            ></textarea>
                                        </div>
                                        <div className="w-px h-24 bg-slate-100 dark:border-slate-800 hidden md:block"></div>
                                        <div className="hidden md:block w-48">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Scan</p>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                                <p className="text-xs font-bold text-slate-500 mb-1">Similarity Index</p>
                                                <p className={`text-xl font-black ${selectedPaper.plagiarismScore > 20 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {selectedPaper.plagiarismScore}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={() => handleAction('approve')}
                                            disabled={!pdfViewed || actionLoading}
                                            className="flex-1 px-8 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 hover:scale-105 disabled:opacity-20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {actionLoading ? 'Decision Syncing...' : <>✓ Approve Paper</>}
                                        </button>
                                        <button
                                            onClick={() => handleAction('request_revision')}
                                            disabled={actionLoading}
                                            className="px-8 py-5 bg-amber-500 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-amber-500/20 hover:scale-105 disabled:opacity-20 transition-all"
                                        >
                                            ↺ Revise
                                        </button>
                                        <button
                                            onClick={() => handleAction('reject')}
                                            disabled={actionLoading}
                                            className="px-8 py-5 bg-red-600 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 hover:scale-105 disabled:opacity-20 transition-all"
                                        >
                                            ✗ Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[48px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center group">
                                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-700">
                                    <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <h3 className="text-xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Select Protocol from Queue</h3>
                                <p className="text-slate-300 dark:text-slate-700 mt-2 font-medium">Initialize review workflow to sync decisions.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

