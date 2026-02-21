import { Link } from 'react-router-dom'

export default function SkillCard({ user }) {
  return (
    <Link to={`/profile/${user._id}`} className="user-card">
      <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>
      <h3>{user.name}</h3>
      <p className="muted">{user.college} {user.year ? `· Year ${user.year}` : ''}</p>
      <div className="skill-tags">
        {user.skills?.slice(0, 4).map((s, i) => <span key={i} className="tag">{s}</span>)}
        {user.skills?.length > 4 && <span className="tag tag-more">+{user.skills.length - 4}</span>}
      </div>
    </Link>
  )
}
