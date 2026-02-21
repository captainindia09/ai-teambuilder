import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosClient'
import ProjectCard from '../components/ProjectCard'
import SkillCard from '../components/SkillCard'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [myProjects, setMyProjects] = useState({ created: [], joined: [] })

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data))
    api.get('/users').then(r => setUsers(r.data))
    api.get('/projects/user/mine').then(r => setMyProjects(r.data)).catch(() => {})
  }, [])

  return (
    <div className="dashboard">
      <div className="dash-header">
        <h1>Dashboard</h1>
        <div className="dash-actions">
          <Link to="/projects" className="btn btn-primary">+ New Project</Link>
          <Link to="/ai" className="btn btn-accent">🤖 AI Agent</Link>
        </div>
      </div>

      {(myProjects.created.length > 0 || myProjects.joined.length > 0) && (
        <section className="section">
          <h2>My Teams</h2>
          <div className="card-grid">
            {myProjects.created.map(p => (
              <Link key={p._id} to={`/projects/${p._id}`} className="project-card owned">
                <span className="badge badge-accent">Creator</span>
                <h3>{p.title}</h3>
                <p className="muted">{p.domain} · {p.teamSize} members</p>
              </Link>
            ))}
            {myProjects.joined.map(p => (
              <Link key={p._id} to={`/projects/${p._id}`} className="project-card">
                <span className="badge">Member</span>
                <h3>{p.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2>Open Projects</h2>
        {projects.length === 0 ? <p className="muted">No projects yet</p> : (
          <div className="card-grid">
            {projects.map(p => <ProjectCard key={p._id} project={p} />)}
          </div>
        )}
      </section>

      <section className="section">
        <h2>Available Teammates</h2>
        {users.length === 0 ? <p className="muted">No users yet</p> : (
          <div className="card-grid">
            {users.slice(0, 12).map(u => <SkillCard key={u._id} user={u} />)}
          </div>
        )}
      </section>
    </div>
  )
}
