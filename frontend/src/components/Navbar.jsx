import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar({ theme, toggleTheme }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
    window.location.reload()
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="nav-brand">⚡ TeamBuilder</Link>
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        <Link to="/projects" onClick={() => setMenuOpen(false)}>Projects</Link>
        <Link to="/ai" onClick={() => setMenuOpen(false)}>🤖 AI Agent</Link>
        <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
        <Link to="/messages" onClick={() => setMenuOpen(false)}>✉</Link>
        <button onClick={toggleTheme} className="btn-icon" title="Toggle theme">◑</button>
        <button onClick={logout} className="btn btn-sm">Logout</button>
      </div>
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
    </nav>
  )
}
