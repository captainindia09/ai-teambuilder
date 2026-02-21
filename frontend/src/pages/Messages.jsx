import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosClient'

export default function Messages() {
  const [data, setData] = useState({ received: [], sent: [] })

  useEffect(() => {
    api.get('/match/my-messages').then(r => setData(r.data)).catch(() => {})
  }, [])

  return (
    <div>
      <h1>Messages</h1>

      <section className="section">
        <h2>Received</h2>
        {data.received.length === 0 ? (
          <div className="empty-state">
            <p className="muted">No messages yet</p>
            <Link to="/ai" className="btn btn-accent">🤖 Find Teammates</Link>
          </div>
        ) : (
          <div className="message-list">
            {data.received.map(m => (
              <div key={m._id} className="message-card unread">
                <div className="message-header">
                  <Link to={`/profile/${m.requester?._id}`}><strong>{m.requester?.name}</strong></Link>
                  {m.isAiDrafted && <span className="badge badge-accent">AI Drafted</span>}
                  <span className="muted">{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
                {m.project && <p className="muted">Re: {m.project?.title}</p>}
                <p>{m.message}</p>
                {m.suggestedRole && <p className="muted">Suggested role: {m.suggestedRole}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>Sent</h2>
        {data.sent.length === 0 ? <p className="muted">No sent messages</p> : (
          <div className="message-list">
            {data.sent.map(m => (
              <div key={m._id} className="message-card">
                <div className="message-header">
                  <span>To: <Link to={`/profile/${m.matched?._id}`}><strong>{m.matched?.name}</strong></Link></span>
                  {m.isAiDrafted && <span className="badge badge-accent">AI Drafted</span>}
                  <span className="muted">{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
                <p>{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
