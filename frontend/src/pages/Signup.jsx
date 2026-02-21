import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', year: 3, skills: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const set = (key, val) => setForm({ ...form, [key]: val })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Join TeamBuilder</h2>
        <p className="muted">Create profile & start building teams</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Aryan Kumar" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="you@college.edu" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} placeholder="Min 6 characters" />
          </div>
          <div className="form-group">
            <label>College</label>
            <input value={form.college} onChange={e => set('college', e.target.value)} placeholder="BIT Mesra" />
          </div>
          <div className="form-group">
            <label>Year</label>
            <select value={form.year} onChange={e => set('year', e.target.value)}>
              {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y === 5 ? 'Post-grad' : `Year ${y}`}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="React, Node.js, Python" />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Create Account</button>
        </form>
        <p className="auth-switch">Have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}
