import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AlumniDashboard() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(userData));
    }, []);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Alumni Dashboard</h1>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            router.push('/login');
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>

                <div className="bg-white p-6 rounded shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-2">Welcome, {user.fullName}!</h2>
                    <p className="text-gray-600">Role: {user.role}</p>
                    <p className="text-sm text-gray-500 mt-2">As an alumni, you can contribute to the repository and stay updated with campus research.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/upload/paper" className="block p-6 bg-blue-600 text-white rounded shadow-lg hover:bg-blue-700 transition text-center">
                        <h3 className="text-2xl font-bold mb-2">Upload Paper</h3>
                        <p>Submit your research for review</p>
                    </Link>

                    <Link href="/papers" className="block p-6 bg-green-600 text-white rounded shadow-lg hover:bg-green-700 transition text-center">
                        <h3 className="text-2xl font-bold mb-2">Browse Papers</h3>
                        <p>Search and view approved publications</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
