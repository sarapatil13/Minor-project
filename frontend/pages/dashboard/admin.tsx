import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1'];

export default function AdminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>({});
    const [papers, setPapers] = useState<any[]>([]);
    const [pendingPapers, setPendingPapers] = useState<any[]>([]);
    const [loadingPending, setLoadingPending] = useState(true);

    // Modal Review State
    const [selectedPaper, setSelectedPaper] = useState<any>(null);
    const [pdfViewed, setPdfViewed] = useState(false);
    const [comments, setComments] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchStats();
        fetchPapers();
        fetchPendingPapers();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            const data = res.data;
            const statusData = [
                { name: 'Approved', value: data.approved },
                { name: 'Pending', value: data.pending },
                { name: 'Rejected', value: data.rejected }
            ];
            setStats({
                total: data.total,
                approved: data.approved,
                pending: data.pending,
                rejected: data.rejected,
                papersPerDept: data.papersPerDept,
                statusData: statusData,
                totalParticipants: data.totalParticipants || 0
            });
        } catch (err: any) {
            console.error('Failed to fetch stats', err);
            setStats({ total: 0, approved: 0, pending: 0, rejected: 0, papersPerDept: [], statusData: [] });
        }
    };

    const fetchPapers = async () => {
        try {
            const res = await api.get('/papers');
            setPapers(res.data.slice(0, 5));
        } catch (err: any) { console.error('Failed to fetch papers'); }
    };

    const fetchPendingPapers = async () => {
        try {
            setLoadingPending(true);
            const res = await api.get('/papers/pending');
            setPendingPapers(res.data);
        } catch (err: any) { console.error('Failed to fetch pending papers'); }
        finally { setLoadingPending(false); }
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
            fetchStats();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-44">
                {/* Admin Header */}
                <div className="bg-slate-900 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden mb-12">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-none italic uppercase">
                            Institutional <span className="text-blue-500 underline decoration-8 underline-offset-8">Intelligence</span>
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl opacity-80">
                            Command Control V2.0. Overseeing {stats.total} publications across the ecosystem.
                        </p>
                    </div>
                </div>

                {/* Primary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
                    {[
                        { label: 'Total Archives', value: stats.total, color: 'blue' },
                        { label: 'Live Submissions', value: stats.approved, color: 'emerald' },
                        { label: 'Pending Review', value: stats.pending, color: 'amber' },
                        { label: 'Rejected', value: stats.rejected, color: 'red' },
                        { label: 'RSVP Index', value: stats.totalParticipants, color: 'purple' }
                    ].map((m, i) => (
                        <div key={i} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[40px] border border-white/20 dark:border-slate-800/30 shadow-xl">
                            <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-4">{m.label}</p>
                            <p className={`text-4xl font-black text-${m.color}-600 dark:text-${m.color}-400`}>{m.value || 0}</p>
                        </div>
                    ))}
                </div>

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[48px] border border-white/20 dark:border-slate-800/30 shadow-2xl">
                        <h3 className="text-xl font-black mb-8 tracking-tight text-slate-900 dark:text-white uppercase">Departmental Distribution</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.papersPerDept || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" fill="#3B82F6" radius={[10, 10, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[48px] border border-white/20 dark:border-slate-800/30 shadow-2xl">
                        <h3 className="text-xl font-black mb-8 tracking-tight text-slate-900 dark:text-white uppercase">Archive Health</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.statusData || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {(stats.statusData || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.1)" />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Command Grid */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Annual Report', icon: '📊', color: 'blue', link: '/admin/report' },
                        { label: 'Departments', icon: '🏢', color: 'indigo', link: '/admin/departments' },
                        { label: 'Users', icon: '👥', color: 'emerald', link: '/admin/users' },
                        { label: 'Create Event', icon: '📅', color: 'amber', link: '/admin/events/create' }
                    ].map((c, i) => (
                        <Link key={i} href={c.link} className={`p-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[40px] border border-white/20 dark:border-slate-800/30 shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-center group`}>
                            <div className="text-5xl mb-6 group-hover:scale-125 transition-transform">{c.icon}</div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{c.label}</h3>
                        </Link>
                    ))}
                </div>

                {/* Final Review Queue */}
                <div className="grid lg:grid-cols-12 gap-12 mb-12">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex justify-between items-center px-4">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Institutional Queue</h3>
                            <button onClick={fetchPendingPapers} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                                <svg className={`w-4 h-4 text-slate-400 ${loadingPending ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                        </div>

                        {loadingPending ? (
                            <div className="p-12 text-center opacity-40">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Scanning Protocol...</p>
                            </div>
                        ) : pendingPapers.length === 0 ? (
                            <div className="p-16 text-center bg-white dark:bg-slate-900/40 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px]">Registry Clear</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {pendingPapers.map(p => (
                                    <button
                                        key={p._id}
                                        onClick={() => { setSelectedPaper(p); setPdfViewed(false); }}
                                        className={`w-full text-left p-6 rounded-[32px] border transition-all duration-300 group ${selectedPaper?._id === p._id
                                            ? 'bg-blue-600 border-blue-600 shadow-2xl shadow-blue-500/30'
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

                    <div className="lg:col-span-8">
                        {selectedPaper ? (
                            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[48px] border border-white/20 dark:border-slate-800/30 shadow-2xl overflow-hidden flex flex-col h-[700px]">
                                <div className="p-8 border-b border-white/10 flex justify-between items-start bg-white/50 dark:bg-slate-900/20">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Final Authorization</span>
                                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Plagiarism: {selectedPaper.plagiarismScore}%</span>
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedPaper.title}</h2>
                                    </div>
                                    <button onClick={() => setSelectedPaper(null)} className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-2xl transition-all">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <div className="flex-1 bg-slate-950 relative">
                                    {!pdfViewed ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                                            <button
                                                onClick={() => { setPdfViewed(true); }}
                                                className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/40 hover:scale-105 transition-all"
                                            >
                                                Initialize Review
                                            </button>
                                        </div>
                                    ) : (
                                        <object data={selectedPaper.pdfUrl} type="application/pdf" className="w-full h-full">
                                            <iframe src={selectedPaper.pdfUrl} className="w-full h-full"></iframe>
                                        </object>
                                    )}
                                </div>

                                <div className="p-8 bg-white dark:bg-slate-900 flex flex-col gap-6">
                                    <textarea
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-slate-600 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 h-20"
                                        placeholder="Admin decision log..."
                                        value={comments}
                                        onChange={e => setComments(e.target.value)}
                                    ></textarea>
                                    <div className="flex gap-4">
                                        <button onClick={() => handleAction('approve')} disabled={!pdfViewed || actionLoading} className="flex-1 px-8 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all">
                                            {actionLoading ? 'Saving...' : 'Approve & Publish'}
                                        </button>
                                        <button onClick={() => handleAction('request_revision')} disabled={actionLoading} className="px-8 py-5 bg-amber-500 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all">
                                            Revise
                                        </button>
                                        <button onClick={() => handleAction('reject')} disabled={actionLoading} className="px-8 py-5 bg-red-600 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[48px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-8">
                                    <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Awaiting Command</h3>
                                <p className="text-slate-300 dark:text-slate-700 mt-2">Papers requiring institutional authorization will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Final Archive Tracking */}
                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-12">
                        <div className="flex justify-between items-end mb-8 px-4">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Registry <span className="text-blue-600">Feed</span></h2>
                            <Link href="/browse-papers" className="text-xs font-black text-blue-600 uppercase tracking-widest hover:gap-3 transition-all flex items-center gap-2">
                                Full Archive <span>→</span>
                            </Link>
                        </div>

                        <div className="grid gap-6">
                            {papers.map(paper => (
                                <div key={paper._id} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[40px] border border-white/20 dark:border-slate-800/30 shadow-sm flex items-center justify-between group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{paper.departmentId?.name}</span>
                                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{new Date(paper.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition">{paper.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border ${paper.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800' :
                                            paper.status === 'pending' || paper.status.startsWith('pending_') ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800' :
                                                'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-800'
                                            }`}>
                                            {paper.status.replace('pending_', '').toUpperCase()}
                                        </span>
                                        <Link href={`/paper/${paper._id}`} className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-white rounded-2xl transition-all">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
