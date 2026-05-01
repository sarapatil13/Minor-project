import { useState, useEffect } from 'react';
import api from '../../lib/api';
import Link from 'next/link';

export default function Users() {
    const [users, setUsers] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ role: '', departmentId: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, deptsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/departments')
            ]);
            setUsers(usersRes.data);
            setDepartments(deptsRes.data);
        } catch (err) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: any) => {
        setEditingUser(user._id);
        setEditForm({
            role: user.role,
            departmentId: user.departmentId?._id || ''
        });
    };

    const handleSave = async (userId: string) => {
        setSaving(true);
        try {
            await api.patch(`/admin/user/${userId}`, editForm);
            setEditingUser(null);
            fetchData();
        } catch (err) {
            alert('Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Curation Center</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage institutional roles and departmental wings</p>
                    </div>
                    <Link href="/dashboard/admin" className="px-6 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 text-sm font-black uppercase tracking-widest hover:shadow-md transition-all flex items-center gap-2 text-gray-700 dark:text-gray-200">
                        <span>←</span> Dashboard
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl border dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Researcher Info</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Role</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Departmental Home</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {loading ? (
                                    <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400">Loading collective data...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400">Institutional record is empty.</td></tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg">
                                                        {user.fullName[0]}
                                                    </div>
                                                    <div>
                                                        <div className="text-base font-bold text-gray-900 dark:text-white">{user.fullName}</div>
                                                        <div className="text-xs text-gray-500 font-medium tracking-tight">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {editingUser === user._id ? (
                                                    <select
                                                        value={editForm.role}
                                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                                        className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all py-2 px-4"
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="faculty">Faculty</option>
                                                        <option value="hod">HOD</option>
                                                        <option value="committee_member">Committee</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                            user.role === 'hod' || user.role === 'faculty' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                {editingUser === user._id ? (
                                                    <select
                                                        value={editForm.departmentId}
                                                        onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                                                        className="bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-all py-2 px-4 w-full max-w-[200px]"
                                                    >
                                                        <option value="">No Department</option>
                                                        {departments.map(dept => (
                                                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        {user.departmentId ? (
                                                            <>
                                                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{user.departmentId.name}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 font-medium italic">Unassigned</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {editingUser === user._id ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleSave(user._id)}
                                                            disabled={saving}
                                                            className="p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all font-bold text-xs px-4"
                                                        >
                                                            {saving ? 'Saving...' : 'Confirm'}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingUser(null)}
                                                            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-bold text-xs px-4"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-3 bg-gray-50 dark:bg-gray-900/50 text-blue-600 dark:text-blue-400 rounded-2xl opacity-0 group-hover:opacity-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2 ml-auto font-black text-[10px] uppercase tracking-widest"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        Modify
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
