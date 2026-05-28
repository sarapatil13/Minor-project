import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function StudentDashboard() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const [myPapers, setMyPapers] = useState<any[]>([]);
    const [myEvents, setMyEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchDashboardData(parsedUser);
    }, []);

    const fetchDashboardData = async (currentUser: any) => {
        try {
            setLoading(true);
            const [papersRes, eventsRes] = await Promise.all([
                api.get('/papers/my'),
                api.get('/events/my')
            ]);
            setMyPapers(papersRes.data);
            setMyEvents(eventsRes.data);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const stats = {
        totalPapers: myPapers.length,
        approved: myPapers.filter(p => p.status === 'approved' || p.status === 'published').length,
        upcomingEvents: myEvents.length,
        impactScore: 'B+'
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-44">
                {/* Welcome Hero */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden mb-12">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-none italic">
                            Research <span className="text-blue-200">Hub</span>
                        </h1>
                        <p className="text-xl text-blue-100 font-medium max-w-2xl opacity-80">
                            Welcome back, {user.fullName.split(' ')[0]}. You have {stats.totalPapers} active submissions in the institutional repository.
                        </p>
                    </div>
                    <div className="absolute bottom-12 right-12 hidden lg:flex gap-4">
                        <Link href="/upload/paper" className="px-10 py-5 bg-white text-blue-700 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-xl">
                            New Submission
                        </Link>
                    </div>
                </div>

                {/* Impact Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Submissions', value: stats.totalPapers, color: 'blue' },
                        { label: 'Approved', value: stats.approved, color: 'emerald' },
                        { label: 'Events', value: stats.upcomingEvents, color: 'purple' },
                        { label: 'Impact Rank', value: stats.impactScore, color: 'amber' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[40px] border border-white/20 dark:border-slate-800/30 shadow-xl">
                            <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.3em] mb-4">{stat.label}</p>
                            <p className={`text-4xl font-black text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Submission Queue */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex justify-between items-end mb-4">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Active Repository</h2>
                            <Link href="/browse-papers" className="text-xs font-black text-blue-600 uppercase tracking-widest hover:gap-3 transition-all flex items-center gap-2">
                                Explorer <span>→</span>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-[48px] border-2 border-dashed dark:border-slate-800">
                                <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Archives...</p>
                            </div>
                        ) : myPapers.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 p-20 rounded-[48px] border-2 border-dashed dark:border-slate-800 text-center">
                                <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] mb-8">No institutional records found</p>
                                <Link href="/upload/paper" className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-110 transition-transform shadow-2xl">
                                    Initiate First Submission
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {myPapers.map(paper => (
                                    <div key={paper._id} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[40px] border border-white/20 dark:border-slate-800/30 shadow-sm hover:shadow-2xl transition-all group">
                                        <div className="flex justify-between items-start gap-8 mb-6">
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-blue-600 transition">
                                                    {paper.title}
                                                </h3>
                                                <div className="flex flex-wrap gap-3">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${paper.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800' :
                                                        paper.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-800' :
                                                            'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800'
                                                        }`}>
                                                        {paper.status.replace('_', ' ')}
                                                    </span>
                                                    <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                        {paper.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link href={`/paper/${paper._id}`} className="p-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all transform hover:rotate-12 hover:scale-110">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Events & Profiles */}
                    <div className="lg:col-span-4 space-y-12">
                        <section className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
                            <h3 className="text-xl font-black mb-6 tracking-tight">Researcher Card</h3>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-2xl font-black border-4 border-white/10">
                                    {user.fullName[0]}
                                </div>
                                <div>
                                    <p className="font-black text-lg group-hover:text-blue-400 transition">{user.fullName}</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">{user.role}</p>
                                </div>
                            </div>
                            <button onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                router.push('/login');
                            }} className="w-full py-4 bg-white/10 hover:bg-red-500/20 hover:text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Terminate Session
                            </button>
                        </section>

                        <section>
                            <div className="flex justify-between items-center mb-8 px-4">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Ecosystem Events</h3>
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{myEvents.length} Active</span>
                            </div>
                            <div className="space-y-4">
                                {myEvents.map(event => (
                                    <div key={event._id} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-6 rounded-[32px] border border-white/20 dark:border-slate-800/30 shadow-sm flex items-center justify-between group">
                                        <div>
                                            <p className="font-black text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition">{event.title}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{new Date(event.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                ))}
                                {myEvents.length === 0 && (
                                    <div className="text-center py-8 opacity-40">
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Active RSVP</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
