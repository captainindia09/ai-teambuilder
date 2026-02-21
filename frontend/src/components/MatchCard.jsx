export default function MatchCard({ match, onMessage }) {
  return (
    <div className="match-card">
      <div className="match-header">
        <div className="avatar">{match.user?.name?.charAt(0).toUpperCase()}</div>
        <div>
          <h4>{match.user?.name}</h4>
          <p className="muted">{match.user?.college} · Year {match.user?.year}</p>
        </div>
        <span className="badge badge-accent">Score: {match.score}</span>
      </div>
      <div className="skill-tags">
        {match.matchedSkills?.map((s, i) => <span key={i} className="tag">{s}</span>)}
      </div>
      <p className="muted" style={{ marginTop: 8 }}>{match.user?.bio}</p>
      {onMessage && (
        <button className="btn btn-sm btn-accent" style={{ marginTop: 10 }}
          onClick={() => onMessage(match.user)}>
          ✉ Message
        </button>
      )}
    </div>
  )
}
