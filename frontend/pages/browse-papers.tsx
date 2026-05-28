import { useState, useEffect } from 'react';
import api from '../lib/api';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function BrowsePapersPage() {
    const [papers, setPapers] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        keyword: '',
        department: '',
        year: '',
        type: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDepartments();
        fetchPapers();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
        } catch (err: any) {
            console.error('Failed to fetch departments');
        }
    };

    const fetchPapers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.keyword) params.append('keyword', filters.keyword);
            if (filters.department) params.append('department', filters.department);
            if (filters.year) params.append('year', filters.year);
            if (filters.type) params.append('type', filters.type);

            const res = await api.get(`/papers/search?${params.toString()}`);
            setPapers(res.data);
        } catch (err: any) {
            console.error('Failed to fetch papers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPapers();
    };

    const handleDownload = (fileUrl: string) => {
        window.open(fileUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-44">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        Research <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Explorer</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Search across our comprehensive institutional repository of approved scholarly works.</p>
                </div>

                {/* Glassmorphic Search & Filters */}
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[40px] border border-white/20 dark:border-slate-800/30 shadow-2xl mb-12">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-5 relative">
                            <input
                                type="text"
                                placeholder="Search by title, author, keys..."
                                value={filters.keyword}
                                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                            />
                            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>

                        <div className="md:col-span-2">
                            <select
                                value={filters.department}
                                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                className="w-full px-4 py-4 bg-white dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                            >
                                <option value="">Wings</option>
                                {departments.map((dept: any) => (
                                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <select
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                className="w-full px-4 py-4 bg-white dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                            >
                                <option value="">Year</option>
                                {[2025, 2024, 2023, 2022, 2021].map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="w-full px-4 py-4 bg-white dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                            >
                                <option value="">Format</option>
                                <option value="Journal">Journal</option>
                                <option value="Conference">Conference</option>
                                <option value="Research Paper">Research Paper</option>
                                <option value="Thesis">Thesis</option>
                                <option value="Patent">Patent</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="md:col-span-1 bg-blue-600 dark:bg-blue-500 text-white p-4 rounded-2xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Scouring Repository...</p>
                    </div>
                ) : papers.length === 0 ? (
                    <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[48px] border-2 border-dashed dark:border-slate-800">
                        <p className="text-xl font-bold text-slate-400">No institutional matches found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {papers.map((paper: any) => (
                            <div key={paper._id} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all border border-slate-100 dark:border-slate-800 group">
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-800/50">
                                                {paper.type}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{paper.year}</span>
                                            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                                    <span className="text-[10px] font-bold text-slate-500">{paper.readsCount || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    <span className="text-[10px] font-bold text-slate-500">{paper.citationsCount || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(paper.fileUrl)}
                                            className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        </button>
                                    </div>

                                    <Link href={`/paper/${paper._id}`} className="group-hover:text-blue-600 transition-colors">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 line-clamp-2 tracking-tight">{paper.title}</h3>
                                    </Link>

                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 line-clamp-3 leading-relaxed flex-grow">
                                        {paper.abstract}
                                    </p>

                                    <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black">
                                                {paper.submittedBy?.fullName?.[0] || 'A'}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{paper.submittedBy?.fullName || 'Anonymous'}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{paper.departmentId?.name || 'Central Data'}</p>
                                            </div>
                                        </div>
                                        <Link href={`/paper/${paper._id}`} className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline">
                                            View Report →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
