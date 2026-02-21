import { useState, useRef, useEffect } from 'react'
import api from '../api/axiosClient'

export default function AIAgent() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hey! I'm your AI Team Concierge. Try:\n\n→ "Build my team for a fintech hack, need React + backend"\n→ "Find someone who knows Python and ML"\n→ "Draft a message to invite someone"\n→ "What projects match my skills?"`, users: [] }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState(null) // { userId, userName, text }
  const chatRef = useRef(null)
  const context = useRef('')

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight) }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)

    try {
      const { data } = await api.post('/ai/chat', { message: msg, context: context.current })
      context.current += `\nUser: ${msg}\nAI: ${data.response?.substring(0, 300)}`
      setMessages(prev => [...prev, { role: 'ai', text: data.response, users: data.mentionedUsers || [] }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, AI is temporarily unavailable. Try again.', users: [] }])
    }
    setLoading(false)
  }

  const draftMessage = async (userId, userName) => {
    setDraft({ userId, userName, text: 'Generating...' })
    try {
      const { data } = await api.post('/ai/draft', { receiverId: userId })
      setDraft({ userId, userName, text: data.draft })
    } catch {
      setDraft({ userId, userName, text: `Hey ${userName}! I think your skills would be great for my hackathon project. Interested in joining?` })
    }
  }

  const sendDraft = async () => {
    if (!draft) return
    try {
      await api.post('/match/send', { matchedId: draft.userId, message: draft.text, isAiDrafted: true })
      setMessages(prev => [...prev, { role: 'ai', text: `✅ Message sent to ${draft.userName}!`, users: [] }])
      setDraft(null)
    } catch {
      alert('Failed to send')
    }
  }

  return (
    <div className="ai-page">
      <div className="ai-header">
        <h1>🤖 AI Team Concierge</h1>
        <p className="muted">Tell me what you need and I'll find your dream team</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages" ref={chatRef}>
          {messages.map((m, i) => (
            <div key={i} className={`msg msg-${m.role}`}>
              <div className="msg-avatar">{m.role === 'ai' ? '🤖' : '👤'}</div>
              <div className="msg-body">
                <div dangerouslySetInnerHTML={{ __html: m.text?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                {m.users?.length > 0 && (
                  <div className="ai-actions-grid">
                    {m.users.map(u => (
                      <div key={u.id} className="ai-match-card">
                        <div className="ai-match-info">
                          <span className="ai-match-name">{u.name}</span>
                          <span className="ai-score-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            {u.compatibilityScore}% Match
                            {u.questionsAnswered !== undefined && (
                              <span style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '2px' }}>
                                {u.questionsAnswered}/3 Qs Answered
                              </span>
                            )}
                          </span>
                        </div>
                        <button className="btn btn-sm btn-primary" onClick={() => draftMessage(u.id, u.name)}>
                          ✉ Invite
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="msg msg-ai">
              <div className="msg-avatar">🤖</div>
              <div className="msg-body typing"><span className="dot" /><span className="dot" /><span className="dot" /></div>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <div className="quick-prompts">
            <button className="quick-btn" onClick={() => send('Build my team for a fintech hack — need React, Node.js backend, and someone for pitch')}>🚀 Build team</button>
            <button className="quick-btn" onClick={() => send('Find people who know Python or Machine Learning')}>🔍 Find ML devs</button>
            <button className="quick-btn" onClick={() => send('What open projects match my skills?')}>📂 Match projects</button>
            <button className="quick-btn" onClick={() => send('Tips for building a winning hackathon team')}>💡 Strategy</button>
          </div>
          <div className="chat-input">
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={2} placeholder="Tell me what you need..."
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
            <button className="btn btn-primary" onClick={() => send()} disabled={loading}>Send</button>
          </div>
        </div>
      </div>

      {/* Approval modal */}
      {draft && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📨 Message to {draft.userName}</h3>
              <button className="btn-icon" onClick={() => setDraft(null)}>✕</button>
            </div>
            <textarea rows={4} value={draft.text} onChange={e => setDraft({ ...draft, text: e.target.value })} />
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setDraft(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendDraft}>✅ Approve & Send</button>
            </div>
            <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>Edit freely. AI never sends without your approval.</p>
          </div>
        </div>
      )}
    </div>
  )
}
