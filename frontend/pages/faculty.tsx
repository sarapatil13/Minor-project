import { useState, useEffect } from 'react';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function FacultyDirectory() {
    const [faculty, setFaculty] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users'); // Reuse the admin/users endpoint for now
            setFaculty(res.data.filter((u: any) => u.role === 'faculty' || u.role === 'hod' || u.role === 'committee_member'));
        } catch (err) {
            console.error('Failed to fetch faculty');
        } finally {
            setLoading(false);
        }
    };

    const filteredFaculty = faculty.filter(f =>
        f.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.departmentId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-20">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-44 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Faculty Directory</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Meet the researchers driving innovation across our campus.</p>
                    </div>
                    <div className="w-full md:w-96 relative">
                        <input
                            type="text"
                            placeholder="Search by name or department..."
                            className="w-full px-6 py-4 rounded-2xl border-none shadow-xl focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredFaculty.map((member) => (
                        <Link
                            key={member._id}
                            href={`/faculty/${member._id}`}
                            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[40px] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white/20 dark:border-slate-800/50 group cursor-pointer block"
                        >
                            <div className="relative mb-8 flex justify-center">
                                <div className="w-28 h-28 rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-4xl font-black text-white shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 overflow-hidden">
                                    {member.profilePicture ? (
                                        <img src={member.profilePicture} alt={member.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        member.fullName[0]
                                    )}
                                </div>
                                {member.role === 'hod' && (
                                    <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white p-2 rounded-[20px] shadow-xl border-4 border-white dark:border-slate-900 animate-bounce-slow">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    </div>
                                )}
                            </div>

                            <div className="text-center">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                    {member.fullName}
                                </h3>
                                <div className="inline-flex px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 mb-6">
                                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">
                                        {member.role === 'hod' ? 'Head of Faculty' : (member.role === 'committee_member' ? 'Committee Chair' : 'Distinguished Faculty')}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-8 h-10">
                                    {member.bio || `Specializing in ${member.departmentId?.name || 'Advanced Research'} and institutional innovation.`}
                                </p>

                                <div className="flex flex-wrap justify-center gap-2 mb-8">
                                    {(member.researchInterests?.slice(0, 2) || ['Ecosystems', 'Innovation']).map((interest: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                            {interest}
                                        </span>
                                    ))}
                                </div>

                                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-6">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white">A+</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Publications</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white">{member.departmentId ? '12+' : '5+'}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {filteredFaculty.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-gray-400 font-medium">No faculty found matching your search.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
