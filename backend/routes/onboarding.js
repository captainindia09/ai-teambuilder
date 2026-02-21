const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

async function callOnboardingAI(prompt) {
    const provider = process.env.AI_PROVIDER || 'gemini';

    if (provider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2048
            })
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
    }

    // Fallback for Gemini if used
    if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
            })
        });
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    return '';
}

// ── Generate Questions ──
router.get('/generate-questions', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // If user has no skills, give generic questions
        const skills = user.skills && user.skills.length > 0
            ? user.skills.join(', ')
            : 'general software engineering concepts';

        const prompt = `You are a technical interviewer for a hackathon team platform.
The user has listed the following skills: ${skills}.

Generate EXACTLY 3 technical assessment questions to test their knowledge of these skills.
Return ONLY a valid JSON array of strings containing the 3 questions. Do NOT wrap it in markdown code blocks.

Example output:
[
  "Explain the virtual DOM in React.",
  "What is the event loop in Node.js?",
  "How do you secure a REST API?"
]`;

        let aiResponse = await callOnboardingAI(prompt);

        // Clean up potential markdown blocks if AI ignored constraints
        aiResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        let questions;
        try {
            questions = JSON.parse(aiResponse);
            if (!Array.isArray(questions) || questions.length !== 3) {
                throw new Error("Invalid format");
            }
        } catch (e) {
            console.error('Failed to parse questions:', aiResponse);
            // Fallback
            questions = [
                "What is your strongest technical skill and how did you use it in a project?",
                "Describe a time you had to debug a difficult issue in your code.",
                "How do you ensure your code is maintainable for a team?"
            ];
        }

        res.json({ questions });
    } catch (err) {
        console.error('Question generation error:', err);
        res.status(500).json({ error: 'Failed to generate questions' });
    }
});

// ── Evaluate Answers ──
router.post('/evaluate-answers', auth, async (req, res) => {
    try {
        const { qaPairs } = req.body;
        // qaPairs = [{ question: "...", answer: "..." }, ...]

        if (!qaPairs || !Array.isArray(qaPairs) || qaPairs.length === 0) {
            return res.status(400).json({ error: 'Provide QA pairs format: [{question, answer}]' });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        let calculatedScore = 80; // Reasonable default if AI generation fails

        const prompt = `You are a senior technical interviewer scoring a candidate's answers.
Evaluate the following Questions and Answers provided by the candidate:
${qaPairs.map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`).join('\n\n')}

Analyze the depth, accuracy, and clarity of the answers.
Assign an overall score from 0 to 100 based on their performance.
You MUST return ONLY a single integer number between 0 and 100. Provide no other text.`;

        const aiResponse = await callOnboardingAI(prompt);

        const parsedScore = parseInt(aiResponse.trim(), 10);
        if (!isNaN(parsedScore)) {
            calculatedScore = Math.min(Math.max(parsedScore, 0), 100); // Clamp 0-100
        }

        // Update the database
        user.aiScore = calculatedScore;
        user.questionsAnswered = qaPairs.length;
        await user.save();

        res.json({ aiScore: user.aiScore, questionsAnswered: user.questionsAnswered });
    } catch (err) {
        console.error('Evaluation error:', err);
        res.status(500).json({ error: 'Failed to evaluate answers' });
    }
});

module.exports = router;
