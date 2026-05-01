import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [departments, setDepartments] = useState<any[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('/departments');
                setDepartments(res.data);
            } catch (err: any) {
                console.error('Failed to fetch departments');
            }
        };
        fetchDepartments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            const role = res.data.user.role;

            if (role === 'admin') router.push('/dashboard/admin');
            else if (role === 'student') router.push('/dashboard/student');
            else if (role === 'faculty') router.push('/dashboard/faculty');
            else if (role === 'alumni') router.push('/dashboard/alumni');
            else router.push('/');

        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 transition-colors">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {t('login.backToHome')}
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('login.title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('login.subtitle')}
                    </p>
                </div>

                <div className="card bg-white dark:bg-gray-800">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                {t('login.email')}
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition"
                                placeholder={t('login.email.placeholder') || 'you@college.edu'}
                                required
                                aria-describedby="email-helper"
                                autoComplete="email"
                            />
                            <p id="email-helper" className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                                {t('login.email.helper')}
                            </p>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                {t('login.password')}
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition"
                                placeholder={t('login.password.placeholder') || 'Enter your password'}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <div>
                            <label htmlFor="department" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                {t('login.department')} <span className="text-gray-400 font-normal">{t('login.department.optional')}</span>
                            </label>
                            <select
                                id="department"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition"
                            >
                                <option value="">{t('login.department.placeholder') || 'Select your department'}</option>
                                {departments.map((dept: any) => (
                                    <option key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3.5 rounded-lg font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('login.submitting')}
                                </span>
                            ) : (
                                t('login.submit')
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('login.noAccount')}{' '}
                            <Link href="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                {t('login.createAccount')}
                            </Link>
                        </p>
                        <p className="text-sm">
                            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:underline">
                                {t('login.forgotPassword') || 'Forgot your password?'}
                            </a>
                        </p>
                    </div>
                </div>

                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t('login.needHelp')}{' '}
                    <a href="mailto:support@college.edu" className="text-blue-600 dark:text-blue-400 hover:underline">
                        support@college.edu
                    </a>
                </p>
            </div>
        </div>
    );
}
