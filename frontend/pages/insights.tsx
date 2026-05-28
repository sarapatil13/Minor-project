import { useState, useEffect } from 'react';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import {
    AreaChart, Area,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function Insights() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/papers/public/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-20">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-indigo-900 text-white pt-44 pb-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -mr-64 -mt-64"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -ml-48 -mb-48"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6">
                        Institutional <span className="text-blue-400">Impact</span>
                    </h1>
                    <p className="text-xl text-indigo-100/80 max-w-2xl mx-auto font-medium leading-relaxed">
                        Visualizing the evolution of research activity, departmental contributions, and global publishing reach of our academic ecosystem.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                        <div className="p-8 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Approved Papers</p>
                            <p className="text-4xl font-black">{stats.total}</p>
                        </div>
                        <div className="p-8 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-2">Research Wings</p>
                            <p className="text-4xl font-black">{stats.papersPerDept?.length || 0}</p>
                        </div>
                        <div className="p-8 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-2">Active Scholars</p>
                            <p className="text-4xl font-black">{stats.totalUsers}</p>
                        </div>
                        <div className="p-8 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-pink-300 mb-2">Impact Index</p>
                            <p className="text-4xl font-black">A+</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Research Timeline */}
                    <div className="bg-white dark:bg-gray-800 p-10 rounded-[48px] shadow-2xl border dark:border-gray-700">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Research Velocity</h3>
                                <p className="text-sm text-gray-500 font-medium">Annual publication volume across all wings</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.papersPerYear}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Departmental Comparison */}
                    <div className="bg-white dark:bg-gray-800 p-10 rounded-[48px] shadow-2xl border dark:border-gray-700">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Departmental Scale</h3>
                                <p className="text-sm text-gray-500 font-medium">Contribution by academic wings</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.papersPerDept}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" fill="#6366F1" radius={[10, 10, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Reach / Type Distribution */}
                    <div className="bg-white dark:bg-gray-800 p-10 rounded-[48px] shadow-2xl border dark:border-gray-700 lg:col-span-2">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                            <div className="max-w-sm">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-4">Institutional Reach</h3>
                                <p className="text-sm text-gray-500 font-medium mb-8">
                                    Our research is disseminated across various prestigious platforms. Journals and Patents underline our commitment to innovation.
                                </p>
                                <div className="space-y-4">
                                    {stats.papersByType?.map((type: any, idx: number) => (
                                        <div key={type.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">{type.name}</span>
                                            </div>
                                            <span className="text-sm font-black text-gray-400">{type.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="h-[400px] w-full flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.papersByType}
                                            innerRadius={100}
                                            outerRadius={140}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {stats.papersByType?.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
