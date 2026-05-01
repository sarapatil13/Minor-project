import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';

export default function SubmitEvent() {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Hackathon');
    const [organizer, setOrganizer] = useState('');
    const [date, setDate] = useState('');
    const [venue, setVenue] = useState('');
    const [outcome, setOutcome] = useState('Participation');
    const [teamMembers, setTeamMembers] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('type', type);
            formData.append('organizer', organizer);
            formData.append('date', date);
            formData.append('venue', venue);
            formData.append('outcome', outcome);
            formData.append('description', description);

            const members = teamMembers.split(',').map(m => m.trim()).filter(m => m);
            formData.append('teamMembers', JSON.stringify(members));

            if (file) formData.append('certificate', file);

            await api.post('/events', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            router.push('/events/my');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit Event Participation</h1>

                {error && <div className="bg-red-50 text-red-600 p-3 mb-4 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Event Title</label>
                        <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={title} onChange={e => setTitle(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={type} onChange={e => setType(e.target.value)}>
                                <option>Hackathon</option>
                                <option>Workshop</option>
                                <option>Conference</option>
                                <option>Competition</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Organizer / Institution</label>
                        <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={organizer} onChange={e => setOrganizer(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Venue / Location</label>
                        <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={venue} onChange={e => setVenue(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Team Members (if any)</label>
                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            placeholder="Comma separated names"
                            value={teamMembers} onChange={e => setTeamMembers(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Outcome / Achievement</label>
                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            placeholder="e.g. 1st Prize, Certified"
                            value={outcome} onChange={e => setOutcome(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm h-24"
                            value={description} onChange={e => setDescription(e.target.value)}></textarea>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Certificate/Proof</label>
                        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                        {loading ? 'Submitting...' : 'Submit Participation'}
                    </button>
                </form>
            </div>
        </div>
    );
}
