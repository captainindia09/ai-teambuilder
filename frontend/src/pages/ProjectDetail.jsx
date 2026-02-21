import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axiosClient'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const load = () => api.get(`/projects/${id}`).then(r => setProject(r.data))
  useEffect(() => { load() }, [id])

  if (!project) return <p className="muted">Loading...</p>

  const isCreator = project.creator?._id === currentUser.id
  const myMembership = project.members?.find(m => m.user?._id === currentUser.id)
  const accepted = project.members?.filter(m => m.status === 'accepted') || []
  const pending = project.members?.filter(m => m.status === 'pending') || []

  const join = async () => {
    await api.post(`/projects/${id}/join`, { role: 'member' })
    load()
  }
  const accept = async (userId) => {
    await api.post(`/projects/${id}/accept/${userId}`)
    load()
  }
  const reject = async (userId) => {
    await api.post(`/projects/${id}/reject/${userId}`)
    load()
  }
  const leave = async () => {
    if (!confirm('Leave this team?')) return
    await api.post(`/projects/${id}/leave`)
    load()
  }

  return (
    <div className="project-detail">
      <div className="project-hero">
        <div>
          <span className="badge badge-open">{project.status}</span>
          <span className="badge">{project.domain}</span>
          <h1>{project.title}</h1>
          <p className="muted">by <Link to={`/profile/${project.creator?._id}`}>{project.creator?.name}</Link></p>
        </div>
        {!myMembership && project.status === 'open' && (
          <button className="btn btn-primary" onClick={join}>Request to Join</button>
        )}
        {myMembership?.status === 'pending' && <span className="badge badge-pending">Pending</span>}
        {myMembership?.status === 'accepted' && !isCreator && (
          <button className="btn btn-outline" onClick={leave}>Leave Team</button>
        )}
      </div>

      {project.description && <div className="detail-section"><h3>Description</h3><p>{project.description}</p></div>}

      <div className="detail-section">
        <h3>Skills Needed</h3>
        <div className="skill-tags">
          {project.skillsNeeded?.map((s, i) => <span key={i} className="tag tag-lg">{s}</span>)}
        </div>
      </div>

      <div className="detail-section">
        <h3>Team ({accepted.length}/{project.teamSize})</h3>
        <div className="team-list">
          {accepted.map(m => (
            <div key={m.user?._id} className="team-member">
              <div className="avatar">{m.user?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <Link to={`/profile/${m.user?._id}`}><strong>{m.user?.name}</strong></Link>
                <p className="muted">{m.role} · {m.user?.skills?.slice(0, 3).join(', ')}</p>
              </div>
            </div>
          ))}
          {Array.from({ length: Math.max(0, project.teamSize - accepted.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="team-member empty">
              <div className="avatar avatar-empty">?</div>
              <div><p className="muted">Open slot</p></div>
            </div>
          ))}
        </div>
      </div>

      {isCreator && pending.length > 0 && (
        <div className="detail-section">
          <h3>Pending Requests ({pending.length})</h3>
          <div className="team-list">
            {pending.map(m => (
              <div key={m.user?._id} className="team-member pending-member">
                <div className="avatar">{m.user?.name?.charAt(0).toUpperCase()}</div>
                <div className="pending-info">
                  <Link to={`/profile/${m.user?._id}`}><strong>{m.user?.name}</strong></Link>
                  <p className="muted">{m.user?.skills?.join(', ')}</p>
                </div>
                <div className="pending-actions">
                  <button className="btn btn-sm btn-primary" onClick={() => accept(m.user?._id)}>Accept</button>
                  <button className="btn btn-sm btn-outline" onClick={() => reject(m.user?._id)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="detail-section">
        <Link to="/ai" className="btn btn-accent">🤖 Find more teammates with AI</Link>
      </div>
    </div>
  )
}
