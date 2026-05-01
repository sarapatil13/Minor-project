import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/api';

interface Department {
    _id: string;
    name: string;
}

export default function UploadPaper() {
    const [step, setStep] = useState(1);

    // Step 1: Metadata
    const [title, setTitle] = useState('');
    const [abstract, setAbstract] = useState('');
    const [authors, setAuthors] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [type, setType] = useState('Research Paper');
    const [venue, setVenue] = useState('');

    // Step 2: File & Check
    const [file, setFile] = useState<File | null>(null);
    const [plagiarismChecked, setPlagiarismChecked] = useState(false);
    const [plagiarismResult, setPlagiarismResult] = useState<any>(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);

    // General
    const [departments, setDepartments] = useState<Department[]>([]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('/departments');
                setDepartments(res.data);
            } catch (err) { console.error(err); }
        };
        fetchDepartments();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setPlagiarismChecked(false); // Reset check if file changes
            setPlagiarismResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return setError('Please upload a file first.');
        setAnalysisLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Use the analyze endpoint we created in backend
            const res = await api.post('/papers/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setPlagiarismResult(res.data);
            setPlagiarismChecked(true); // Enable submit button
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Analysis failed. Please try again.');
        } finally {
            setAnalysisLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!plagiarismChecked) return setError('You must check plagiarism before submitting.');
        setSubmitLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('abstract', abstract);
            // formData.append('summary', summary); // Optional
            const authorsArray = authors.split(',').map(a => a.trim()).filter(a => a);
            formData.append('authors', JSON.stringify(authorsArray));
            formData.append('departmentId', departmentId);
            formData.append('year', year.toString());
            formData.append('type', type);
            formData.append('venue', venue);
            formData.append('file', file!);
            if (plagiarismResult) {
                formData.append('plagiarismScore', plagiarismResult.score);
                formData.append('plagiarismReport', plagiarismResult.report);
            }

            await api.post('/papers', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Redirect based on role
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'admin') router.push('/dashboard/admin');
            else if (user.role === 'student') router.push('/dashboard/student');
            else if (user.role === 'faculty') router.push('/dashboard/faculty');
            else router.push(`/dashboard/${user.role}`); // Dynamic fallback

        } catch (err: any) {
            setError(err.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white">
                    <h1 className="text-2xl font-bold">Submit Research Paper</h1>
                    <p className="opacity-80 text-sm mt-1">Step {step} of 2</p>
                </div>

                {error && <div className="bg-red-50 text-red-700 p-4 border-l-4 border-red-500 m-6">{error}</div>}

                <div className="p-8">
                    {/* Step 1: Metadata */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Paper Details</h2>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Paper Title</label>
                                    <input type="text" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" value={title} onChange={e => setTitle(e.target.value)} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Abstract</label>
                                    <textarea className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 h-32" value={abstract} onChange={e => setAbstract(e.target.value)} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Authors (comma separated)</label>
                                        <input type="text" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" value={authors} onChange={e => setAuthors(e.target.value)} placeholder="e.g. Dr. A. Smith, R. Jones" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
                                            <option value="">Select Department</option>
                                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                        <input type="number" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" value={year} onChange={e => setYear(parseInt(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" value={type} onChange={e => setType(e.target.value)}>
                                            <option value="Research Paper">Research Paper</option>
                                            <option value="Journal">Journal</option>
                                            <option value="Conference">Conference</option>
                                            <option value="Thesis">Thesis</option>
                                            <option value="Patent">Patent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
                                        <input type="text" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" value={venue} onChange={e => setVenue(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => {
                                        if (!title || !abstract || !departmentId || !authors) setError("Please fill all fields");
                                        else { setError(''); setStep(2); }
                                    }}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Next: Upload PDF &rarr;
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Upload & Check */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Upload & Verify</h2>

                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                                <label className="block text-sm font-medium text-blue-900 mb-2">Upload Paper (PDF)</label>
                                <input type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" />
                            </div>

                            {file && (
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h3 className="font-bold text-gray-700 mb-4">Plagiarism Check (Required)</h3>

                                    {!plagiarismChecked ? (
                                        <div className="text-center py-6">
                                            <p className="text-gray-500 mb-4">You must run a plagiarism check before submitting.</p>
                                            <button
                                                onClick={handleAnalyze}
                                                disabled={analysisLoading}
                                                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 shadow-sm disabled:opacity-50"
                                            >
                                                {analysisLoading ? (
                                                    <span className="flex items-center justify-center">
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                        Analyzing PDF...
                                                    </span>
                                                ) : 'Check Plagiarism Now'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-bold text-green-800">Analysis Complete</h4>
                                                    <p className="text-sm text-green-700 mt-1">Score: <strong>{plagiarismResult?.score}%</strong> Likelihood</p>
                                                    <p className="text-xs text-green-600 mt-1">{plagiarismResult?.report}</p>
                                                </div>
                                                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                                    ✓
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-between pt-4 border-t">
                                <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-900 px-4">
                                    &larr; Back to Details
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!plagiarismChecked || submitLoading}
                                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition transform hover:-translate-y-0.5"
                                >
                                    {submitLoading ? 'Submitting...' : 'Submit Paper'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

