import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import api from '../../../lib/api';

export default function CreateEvent() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        type: 'Webinar',
        date: '',
        time: '',
        venue: '',
        organizer: '',
        description: '',
        maxParticipants: '',
        image: null as File | null
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e: any) => {
        if (e.target.files) {
            setFormData({ ...formData, image: e.target.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'image' && formData.image) {
                    data.append('file', formData.image);
                } else {
                    // @ts-ignore
                    data.append(key, formData[key]);
                }
            });

            await api.post('/events/create', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Event Created Successfully!');
            router.push('/dashboard/admin');
        } catch (err) {
            alert('Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <Head>
                <title>Create Event | Admin</title>
            </Head>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Event</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Event Title</label>
                        <input name="title" required className="w-full border rounded p-2" onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Type</label>
                            <select name="type" className="w-full border rounded p-2" onChange={handleChange}>
                                <option>Webinar</option>
                                <option>Workshop</option>
                                <option>Seminar</option>
                                <option>Conference</option>
                                <option>Hackathon</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Max Participants</label>
                            <input name="maxParticipants" type="number" className="w-full border rounded p-2" onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Date</label>
                            <input name="date" type="date" required className="w-full border rounded p-2" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Time</label>
                            <input name="time" type="time" required className="w-full border rounded p-2" onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Venue (or URL)</label>
                        <input name="venue" required className="w-full border rounded p-2" onChange={handleChange} />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Organizer (Dept/Club)</label>
                        <input name="organizer" required className="w-full border rounded p-2" onChange={handleChange} />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Description</label>
                        <textarea name="description" required rows={4} className="w-full border rounded p-2" onChange={handleChange}></textarea>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Banner Image</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                </form>
            </div>
        </div>
    );
}
