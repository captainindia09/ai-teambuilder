import { Link } from 'react-router-dom'

export default function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project._id}`} className="project-card">
      <div className="project-meta">
        <span className="badge badge-open">{project.status}</span>
        <span className="muted">{project.domain}</span>
      </div>
      <h3>{project.title}</h3>
      <p className="card-desc">{project.description?.substring(0, 100)}...</p>
      <div className="skill-tags">
        {project.skillsNeeded?.map((s, i) => <span key={i} className="tag">{s}</span>)}
      </div>
      <div className="card-footer">
        <span>by {project.creator?.name || 'Unknown'}</span>
        <span>Team of {project.teamSize}</span>
      </div>
    </Link>
  )
}
