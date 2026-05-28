const express = require('express');
const router = express.Router();

// POST /summary
// Rate Limiting Note: In a production app, use express-rate-limit here to prevent abuse.
router.post('/summary', async (req, res) => {
    try {
        const { abstract } = req.body;

        if (!abstract) {
            return res.status(400).json({ message: 'Abstract is required' });
        }

        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'none') {
            // Fallback if no key provided
            console.log('No OpenAI API Key found, using fallback summary.');
            const sentences = abstract.split('.').filter(s => s.trim().length > 0);
            const summary = sentences.slice(0, 3).join('.') + (sentences.length > 3 ? '.' : '');
            return res.json({ summary: `(Auto-generated fallback) ${summary}` });
        }

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant that summarizes academic paper abstracts into 3 concise sentences." },
                    { role: "user", content: abstract }
                ],
                max_tokens: 150
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('OpenAI API Error:', data);
            throw new Error(data.error?.message || 'Failed to fetch summary from OpenAI');
        }

        const summary = data.choices[0].message.content.trim();
        const { text, title } = req.body;
        if (!text) return res.status(400).json({ message: 'Text content is required' });

        // 1. Internal Database Check (Simple overlap)
        // Find other papers (excluding this one if it exists)
        const allPapers = await Paper.find({ status: 'approved' }).select('abstract title');

        let highestMatch = 0;
        let matchedPaper = null;

        // Very basic Jaccard similarity or substring check for demonstration
        // In production, use a vector DB or specialized library
        const inputWords = new Set(text.toLowerCase().split(/\s+/));

        for (const paper of allPapers) {
            if (paper.title === title) continue; // Skip self if updating
            if (!paper.abstract) continue;

            const paperWords = new Set(paper.abstract.toLowerCase().split(/\s+/));
            const intersection = new Set([...inputWords].filter(x => paperWords.has(x)));
            const union = new Set([...inputWords, ...paperWords]);

            const similarity = intersection.size / union.size;

            if (similarity > highestMatch) {
                highestMatch = similarity;
                matchedPaper = paper;
            }
        }

        const internalScore = Math.round(highestMatch * 100);

        // 2. AI Analysis (if key exists)
        let aiAnalysis = "AI check unavailable.";
        let aiScore = 0;

        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'none') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are a plagiarism detection assistant. Analyze the following text and estimate a 'likelihood of being AI generated or plagiarized' from 0 to 100. Return ONLY a JSON object: { score: number, analysis: string }." },
                        { role: "user", content: text.substring(0, 2000) } // Limit length
                    ]
                })
            });
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                try {
                    const result = JSON.parse(data.choices[0].message.content);
                    aiScore = result.score;
                    aiAnalysis = result.analysis;
                } catch (e) {
                    aiAnalysis = "Could not parse AI response.";
                }
            }
        }

        // Weighted average or max
        const finalScore = Math.max(internalScore, aiScore);

        res.json({
            score: finalScore,
            details: {
                internalMatch: internalScore,
                matchedPaper: matchedPaper ? matchedPaper.title : "None",
                aiScore: aiScore,
                aiAnalysis: aiAnalysis
            }
        });

    } catch (err) {
        console.error('Plagiarism Check Error:', err);
        res.status(500).json({ message: 'Server error checking plagiarism' });
    }
});


// POST /plagiarism
router.post('/plagiarism', async (req, res) => {
    try {
        const { text, title } = req.body;
        if (!text) return res.status(400).json({ message: 'Text content is required' });

        // 1. Internal Database Check (Simple overlap)
        const allPapers = await Paper.find({ status: 'approved' }).select('abstract title');

        let highestMatch = 0;
        let matchedPaper = null;

        const inputWords = new Set(text.toLowerCase().split(/\s+/));

        for (const paper of allPapers) {
            if (paper.title === title) continue;
            if (!paper.abstract) continue;

            const paperWords = new Set(paper.abstract.toLowerCase().split(/\s+/));
            const intersection = new Set([...inputWords].filter(x => paperWords.has(x)));
            const union = new Set([...inputWords, ...paperWords]);

            const similarity = intersection.size / union.size;

            if (similarity > highestMatch) {
                highestMatch = similarity;
                matchedPaper = paper;
            }
        }

        const internalScore = Math.round(highestMatch * 100);

        // 2. AI Analysis (if key exists)
        let aiAnalysis = "AI check unavailable.";
        let aiScore = 0;

        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'none') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are a plagiarism detection assistant. Analyze the following text and estimate a 'likelihood of being AI generated or plagiarized' from 0 to 100. Return ONLY a JSON object: { score: number, analysis: string }." },
                        { role: "user", content: text.substring(0, 2000) }
                    ]
                })
            });
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                try {
                    const result = JSON.parse(data.choices[0].message.content);
                    aiScore = result.score;
                    aiAnalysis = result.analysis;
                } catch (e) {
                    aiAnalysis = "Could not parse AI response.";
                }
            }
        }

        const finalScore = Math.max(internalScore, aiScore);

        res.json({
            score: finalScore,
            details: {
                internalMatch: internalScore,
                matchedPaper: matchedPaper ? matchedPaper.title : "None",
                aiScore: aiScore,
                aiAnalysis: aiAnalysis
            }
        });

    } catch (err) {
        console.error('Plagiarism Check Error:', err);
        res.status(500).json({ message: 'Server error checking plagiarism' });
    }
});


const Paper = require('../models/Paper');
const Event = require('../models/Event');
const Department = require('../models/Department');

// POST /chat - Enhanced AI Chat with General Q&A Support
router.post('/chat', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ message: 'Question is required' });

        const lowerQ = question.toLowerCase();
        let answerText = "";
        let results = [];

        // Check for greetings first
        const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
        if (greetings.some(g => lowerQ.startsWith(g))) {
            answerText = "Hello! I'm your Campus Paper Portal Assistant. I can help you with:\n\n" +
                "📄 Papers - Search papers, get stats by department/year\n" +
                "📅 Events - Find upcoming or past events\n" +
                "🎓 Portal Features - Learn about submission, approval workflows\n" +
                "❓ General Questions - Ask me anything about the portal!\n\n" +
                "Try asking: 'How do I submit a paper?' or 'Papers from CSE in 2024'";
            return res.json({ answerText, results });
        }

        // Try specific intent-based queries first (for data retrieval)
        let intent = 'unknown';
        let params = {};

        // Simple pattern matching for specific data queries
        if (lowerQ.includes('paper') && (lowerQ.includes('cse') || lowerQ.includes('ece') || lowerQ.includes('me') || lowerQ.includes('department'))) {
            intent = 'papers_by_dept_year';
            if (lowerQ.includes('cse')) params.department = 'CSE';
            else if (lowerQ.includes('ece')) params.department = 'ECE';
            else if (lowerQ.includes('me')) params.department = 'ME';

            const yearMatch = lowerQ.match(/\d{4}/);
            if (yearMatch) params.year = parseInt(yearMatch[0]);
        } else if ((lowerQ.includes('how many') || lowerQ.includes('count') || lowerQ.includes('total')) && lowerQ.includes('paper')) {
            intent = 'total_approved_papers';
        } else if (lowerQ.includes('event') || lowerQ.includes('workshop') || lowerQ.includes('seminar') || lowerQ.includes('conference')) {
            intent = 'events_query';
            const yearMatch = lowerQ.match(/\d{4}/);
            if (yearMatch) params.year = parseInt(yearMatch[0]);
        }

        // Execute specific data queries
        if (intent === 'papers_by_dept_year') {
            const dept = await Department.findOne({ code: params.department });
            if (dept) {
                const query = { departmentId: dept._id, status: { $in: ['approved', 'published'] } };
                if (params.year) query.year = params.year;

                results = await Paper.find(query).select('title year').limit(5);
                answerText = `I found **${results.length}** approved research papers for the ${dept.name} department${params.year ? ' from ' + params.year : ''}.`;
                if (results.length > 0) {
                    answerText += "\n\nKey publications include:\n";
                    results.forEach(p => {
                        answerText += `\n• **${p.title}** (${p.year})`;
                    });
                }
                answerText += "\n\nYou can find more in the **Browse Papers** section.";
            } else {
                answerText = `I couldn't identify a specific department. Please mention CSE, ECE, or ME.`;
            }
        } else if (intent === 'total_approved_papers') {
            const count = await Paper.countDocuments({ status: { $in: ['approved', 'published'] } });
            answerText = `The institutional repository currently archives **${count}** peer-reviewed and approved research publications.`;
            results = [{ count }];
        } else if (intent === 'events_query') {
            const today = new Date();
            const query = { status: 'approved' };
            if (params.year) {
                const start = new Date(`${params.year}-01-01`);
                const end = new Date(`${params.year}-12-31`);
                query.date = { $gte: start, $lte: end };
            } else {
                query.date = { $gte: today };
            }
            results = await Event.find(query).select('title date venue type organizer').sort({ date: 1 }).limit(5);

            if (results.length > 0) {
                answerText = `Found ${results.length} institutional events:\n`;
                results.forEach(e => {
                    const dateStr = new Date(e.date).toLocaleDateString();
                    answerText += `\n• **${e.title}** (${e.type}) - ${dateStr} at ${e.venue}`;
                });
            } else {
                answerText = "No upcoming institutional research events are currently scheduled.";
            }
        } else {
            // Use OpenAI for general questions
            if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'none') {
                try {
                    const systemPrompt = `You are a helpful AI assistant for the Campus Paper Management Portal. 

The portal features include:
- Paper submission and management (students can submit research papers)
- Multi-level approval workflow (faculty and admin approval required)
- Department-wise organization (CSE, ECE, ME, etc.)
- Event management (faculty can create events)
- Public paper browsing and search
- Annual report generation
- Alumni connection features
- AI-powered plagiarism detection
- Automatic paper summaries

Answer questions about how to use the portal, its features, workflows, and general academic/research topics. Be helpful, concise, and friendly. If asked about specific data (papers, events, stats), suggest they ask specific queries like "Papers from CSE in 2024" or "How many approved papers?".`;

                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                        },
                        body: JSON.stringify({
                            model: "gpt-3.5-turbo",
                            messages: [
                                { role: "system", content: systemPrompt },
                                { role: "user", content: question }
                            ],
                            max_tokens: 300,
                            temperature: 0.7
                        })
                    });

                    const data = await response.json();

                    if (response.ok && data.choices && data.choices[0]) {
                        answerText = data.choices[0].message.content.trim();
                    } else {
                        throw new Error('OpenAI API error');
                    }
                } catch (err) {
                    console.error('OpenAI Error:', err);
                    // Fallback to search if OpenAI fails
                    answerText = await performFallbackSearch(question);
                }
            } else {
                // No OpenAI key - use fallback search
                answerText = await performFallbackSearch(question);
            }
        }

        res.json({ answerText, results });

    } catch (err) {
        console.error('Chat Error:', err);
        res.status(500).json({ message: 'Server error processing chat' });
    }
});

// Helper function for fallback search when OpenAI is not available
async function performFallbackSearch(question) {
    const searchResults = await Paper.find({
        status: 'approved',
        $or: [
            { title: { $regex: question, $options: 'i' } },
            { abstract: { $regex: question, $options: 'i' } }
        ]
    }).limit(5).select('title year');

    if (searchResults.length > 0) {
        let answer = `I found ${searchResults.length} papers matching your query:\n`;
        searchResults.forEach(p => {
            answer += `\n• ${p.title} (${p.year})`;
        });
        return answer;
    } else {
        return "I'm here to help! You can ask me:\n\n" +
            "• About specific papers: 'Papers from CSE in 2024'\n" +
            "• About events: 'Events in 2024'\n" +
            "• General stats: 'How many approved papers?'\n" +
            "• How to use features: 'How do I submit a paper?'\n\n" +
            "What would you like to know?";
    }
}

// GET /analytics/trends - Time-series research trends
router.get('/analytics/trends', async (req, res) => {
    try {
        const trends = await Paper.aggregate([
            { $match: { status: 'approved' } },
            {
                $group: {
                    _id: { year: "$year", type: "$type" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1 } }
        ]);

        // Format for Recharts
        const formatted = {};
        trends.forEach(t => {
            const y = t._id.year;
            if (!formatted[y]) formatted[y] = { name: y.toString() };
            formatted[y][t._id.type] = t.count;
        });

        res.json(Object.values(formatted));
    } catch (err) {
        res.status(500).json({ message: 'Error fetching trends' });
    }
});

// GET /analytics/collaboration - Matrix of department collaborations
router.get('/analytics/collaboration', async (req, res) => {
    try {
        // Mock logic: Count papers where multiple departments or external authors exist
        // For demo: Just return counts of papers per department relative to each other
        const depts = await Department.find({});
        const papers = await Paper.find({ status: 'approved' }).populate('departmentId');

        const nodes = depts.map(d => ({ id: d.name, group: 1 }));
        const links = [];

        // Simple link generation for visual demo
        for (let i = 0; i < depts.length; i++) {
            for (let j = i + 1; j < depts.length; j++) {
                const strength = Math.floor(Math.random() * 10); // Simulation
                if (strength > 2) {
                    links.push({ source: depts[i].name, target: depts[j].name, value: strength });
                }
            }
        }

        res.json({ nodes, links });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching collaboration map' });
    }
});

// POST /predict-impact - Predict citation/impact score
router.post('/predict-impact', async (req, res) => {
    try {
        const { abstract, venue, type } = req.body;
        // AI Logic Simulation
        let score = 50; // Baseline
        if (venue && (venue.toLowerCase().includes('ieee') || venue.toLowerCase().includes('acm'))) score += 30;
        if (type === 'Journal') score += 15;
        if (abstract && abstract.length > 500) score += 5;

        score = Math.min(100, Math.max(0, score + (Math.random() * 10 - 5)));

        res.json({
            score: Math.round(score),
            level: score > 80 ? 'High' : score > 50 ? 'Moderate' : 'Developing',
            reasoning: "Based on publication venue prestige and detail level of abstract analysis."
        });
    } catch (err) {
        res.status(500).json({ message: 'Error predicting impact' });
    }
});

module.exports = router;


