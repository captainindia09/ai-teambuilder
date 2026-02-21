import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axiosClient'

export default function Profile() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [msg, setMsg] = useState('')

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isOwn = !id || id === currentUser.id

  useEffect(() => {
    const url = isOwn ? '/users/me' : `/users/${id}`
    api.get(url).then(r => { setUser(r.data); setForm(r.data) })
  }, [id])

  const set = (key, val) => setForm({ ...form, [key]: val })

  const save = async () => {
    try {
      const payload = { ...form, skills: typeof form.skills === 'string' ? form.skills : form.skills?.join(', ') }
      const { data } = await api.put('/users/me', payload)
      setUser(data)
      setEditing(false)
      setMsg('Saved!')
      setTimeout(() => setMsg(''), 2000)
    } catch { setMsg('Failed to save') }
  }

  if (!user) return <p className="muted">Loading...</p>

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="avatar avatar-lg">{user.name?.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="muted">{user.college} {user.year ? `· Year ${user.year}` : ''}</p>
          <span className={`badge badge-${user.availability === 'available' ? 'open' : 'muted'}`}>{user.availability}</span>
        </div>
        {isOwn && !editing && <button className="btn btn-outline" onClick={() => setEditing(true)}>Edit Profile</button>}
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      {editing ? (
        <div className="edit-form">
          <div className="form-group"><label>Name</label><input value={form.name || ''} onChange={e => set('name', e.target.value)} /></div>
          <div className="form-group"><label>Bio</label><textarea value={form.bio || ''} onChange={e => set('bio', e.target.value)} rows={3} /></div>
          <div className="form-group"><label>College</label><input value={form.college || ''} onChange={e => set('college', e.target.value)} /></div>
          <div className="form-group"><label>Year</label>
            <select value={form.year || 1} onChange={e => set('year', e.target.value)}>
              {[1,2,3,4,5].map(y => <option key={y} value={y}>{y === 5 ? 'Post-grad' : `Year ${y}`}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Skills (comma separated)</label><input value={typeof form.skills === 'string' ? form.skills : form.skills?.join(', ')} onChange={e => set('skills', e.target.value)} /></div>
          <div className="form-group"><label>Availability</label>
            <select value={form.availability || 'available'} onChange={e => set('availability', e.target.value)}>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="in-team">In a Team</option>
            </select>
          </div>
          <div className="form-group"><label>GitHub</label><input value={form.github || ''} onChange={e => set('github', e.target.value)} /></div>
          <div className="form-group"><label>LinkedIn</label><input value={form.linkedin || ''} onChange={e => set('linkedin', e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={save}>Save</button>
            <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {user.bio && <div className="profile-section"><h3>About</h3><p>{user.bio}</p></div>}
          <div className="profile-section">
            <h3>Skills</h3>
            <div className="skill-tags">
              {user.skills?.length === 0 && <p className="muted">No skills added</p>}
              {user.skills?.map((s, i) => <span key={i} className="tag tag-lg">{s}</span>)}
            </div>
          </div>
          {(user.github || user.linkedin) && (
            <div className="profile-section">
              <h3>Links</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {user.github && <a href={user.github} target="_blank" className="btn btn-sm btn-outline">GitHub</a>}
                {user.linkedin && <a href={user.linkedin} target="_blank" className="btn btn-sm btn-outline">LinkedIn</a>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
