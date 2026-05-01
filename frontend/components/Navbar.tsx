import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import api from '../lib/api';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const { t } = useLanguage();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        }
    }, []);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-7xl z-[100]">
            <nav className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border border-white/20 dark:border-gray-700/30 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden">
                <div className="px-8 flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tight leading-none uppercase italic">Research</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mt-1">Ecosystem</span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden lg:flex items-center gap-1">
                        {[
                            { href: '/browse-papers', label: 'Library' },
                            { href: '/faculty', label: 'Scholars' },
                            { href: '/insights', label: 'Insights' },
                            { href: '/events', label: 'Ecosystem Events' },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300"
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Departments Link & Dropdown */}
                        <div className="relative group p-1">
                            <Link
                                href="/departments"
                                className="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 flex items-center gap-2 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-all"
                            >
                                Departments
                                <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                            </Link>
                            <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-72 rounded-[32px] shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/20 dark:border-gray-700/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-50 overflow-hidden translate-y-4 group-hover:translate-y-0">
                                <div className="p-4 grid gap-1">
                                    <DepartmentsList />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Controls */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                            <button className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 transition-all relative group">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white dark:border-slate-800 group-hover:scale-150 transition-transform"></span>
                            </button>
                            <LanguageSelector />
                            <ThemeToggle />
                        </div>

                        {user ? (
                            <Link
                                href={user.role === 'admin' ? '/dashboard/admin' : `/dashboard/${user.role}`}
                                className="px-8 py-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:scale-95"
                            >
                                Workspace
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="hidden sm:inline-block px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all"
                                >
                                    Access
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-8 py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                >
                                    Join Core
                                </Link>
                            </div>
                        )}

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 transition-all active:scale-90"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Content */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden p-4 border-t border-white/10 dark:border-gray-800/50 animate-fade-in-down">
                        <div className="grid gap-2 mb-4">
                            {[
                                { href: '/browse-papers', label: 'Library' },
                                { href: '/faculty', label: 'Scholars' },
                                { href: '/insights', label: 'Insights' },
                                { href: '/events', label: 'Events' },
                                { href: '/departments', label: 'Departments' }
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-[28px]">
                            <LanguageSelector />
                            <ThemeToggle />
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
}

function DepartmentsList() {
    const [depts, setDepts] = useState([]);
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/departments');
                setDepts(res.data);
            } catch (e) { }
        };
        fetch();
    }, []);

    return (
        <>
            {depts.length === 0 ? (
                <div className="px-6 py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Awaiting Institutional Data...</div>
            ) : depts.map((d: any) => (
                <Link
                    key={d._id}
                    href={`/department/${d._id}`}
                    className="flex items-center gap-3 px-6 py-3.5 rounded-2xl hover:bg-blue-600 hover:text-white group transition-all duration-300"
                >
                    <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-black group-hover:bg-white/20 group-hover:text-white transition-colors">
                        {d.code}
                    </div>
                    <span className="text-sm font-bold tracking-tight">{d.name}</span>
                </Link>
            ))}
        </>
    );
}

