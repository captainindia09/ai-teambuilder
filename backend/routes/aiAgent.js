const router = require('express').Router();
const User = require('../models/User');
const Project = require('../models/Project');
const auth = require('../middleware/authMiddleware');

// ── AI Provider ──
async function callAI(prompt) {
  const provider = process.env.AI_PROVIDER || 'gemini';

  if (provider === 'groq') {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048
      })
    });
    const data = await res.json();
    if (data.error) {
      console.error('Groq Error:', data.error);
      return 'AI unavailable (Groq Error)';
    }
    return data.choices?.[0]?.message?.content || 'AI unavailable';
  }

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
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'AI unavailable';
  }

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 2048 })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'AI unavailable';
  }

  if (provider === 'claude') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.CLAUDE_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2048, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json();
    return data.content?.[0]?.text || 'AI unavailable';
  }

  return 'No AI provider configured';
}

// ── AI Chat ──
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    const currentUser = await User.findById(req.userId).select('-password');
    const availableUsers = await User.find({ _id: { $ne: req.userId }, availability: 'available' })
      .sort({ createdAt: -1 })
      .select('name skills college year bio aiScore questionsAnswered').limit(30);
    const openProjects = await Project.find({ status: 'open' })
      .populate('creator', 'name').select('title description skillsNeeded domain teamSize').limit(20);

    const prompt = `You are the "TeamBuilder AI Concierge" - an expert at assembling winning hackathon teams.
Role: Your job is to match the current user with the best possible teammates from the list below.

CURRENT USER (Lead):
- Name: ${currentUser.name}
- Skills: ${currentUser.skills.join(', ') || 'Not specified'}
- College: ${currentUser.college || 'Not specified'}

AVAILABLE TALENT POOL:
${availableUsers.map((u, i) => `${i + 1}. ${u.name} [ID: ${u._id}] | Skills: ${u.skills.join(', ')} | Verified AI Score: ${u.aiScore || 0}% | Questions Answered: ${u.questionsAnswered || 0}/3 | College: ${u.college} | Bio: ${u.bio || 'N/A'}`).join('\n')}

OPEN PROJECTS TO JOIN:
${openProjects.map((p, i) => `${i + 1}. "${p.title}" | Creator: ${p.creator?.name} | Missing Skills: ${p.skillsNeeded.join(', ')} | Domain: ${p.domain}`).join('\n')}

USER REQUEST: ${message}
${context ? `CONTEXT: ${context}` : ''}

SCORING CRITERIA:
1. Technical Synergy: Do their skills complement the lead's or project's needs? (e.g. Frontend lead needs Backend/Design).
2. Domain Relevance: Do they have experience in the project's domain (Fintech, Healthtech, etc.)?
3. Team Balance: Ensure a mix of Dev, Design, and Strategy/Pitch.

RESPONSE GUIDELINES:
- Identify 2-3 specific individuals that create an "Optimized Team".
*   Highlight "Perfect Fit" attributes (e.g. "Aditya is a perfect fit because his ML skills complement your React frontend").
- BE SURE TO MENTION their Verified AI Score and how many questions they answered to build trust (e.g. "They scored a verified 95% on their skills assessment").
- Be proactive: suggested a roles for each person (e.g. CTO, Design Lead).
- Maintain a premium, professional, yet encouraging tone.
- Return interactive buttons (implied) by mentioning names clearly.
- Keep output concise and formatted with bold headers.`;

    const aiResponse = await callAI(prompt);

    // Extract mentioned users
    const mentionedUsers = availableUsers.filter(u => aiResponse.toLowerCase().includes(u.name.toLowerCase()));

    const enhancedMatches = mentionedUsers.map(u => {
      // Instead of random math, give them their actual AI score from the db onboarding!
      return {
        id: u._id,
        name: u.name,
        skills: u.skills,
        compatibilityScore: u.aiScore || 0,
        questionsAnswered: u.questionsAnswered || 0
      };
    }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json({
      response: aiResponse,
      mentionedUsers: enhancedMatches
    });
  } catch (err) {
    console.error('AI error:', err);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

// ── AI Draft Message ──
router.post('/draft', auth, async (req, res) => {
  try {
    const { receiverId, projectContext } = req.body;
    const sender = await User.findById(req.userId);
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ error: 'User not found' });

    const prompt = `Draft a short friendly hackathon team invite from ${sender.name} (skills: ${sender.skills.join(', ')}) to ${receiver.name} (skills: ${receiver.skills.join(', ')}).
${projectContext ? `Project: ${projectContext}` : ''}
Keep it under 3 sentences. Mention why their skills match. Return ONLY the message text.`;

    const draft = await callAI(prompt);
    res.json({ draft, receiverName: receiver.name });
  } catch (err) {
    res.status(500).json({ error: 'Draft failed' });
  }
});

module.exports = router;
