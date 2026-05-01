import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { LayoutDashboard, BookOpen, Users, LogOut, Shield, ChevronRight, Award } from 'lucide-react'
import '../styles/Layout.css'

const Layout = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await auth.signOut()
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Shield size={32} color="#db95fc" />
          <span>CYBER PANEL</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
            <ChevronRight size={16} className="chevron" />
          </NavLink>
          
          <NavLink to="/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BookOpen size={20} />
            <span>Manage Courses</span>
            <ChevronRight size={16} className="chevron" />
          </NavLink>

          <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Manage Users</span>
            <ChevronRight size={16} className="chevron" />
          </NavLink>

          <NavLink to="/certificates" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Award size={20} />
            <span>Certificates</span>
            <ChevronRight size={16} className="chevron" />
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header glass">
          <div className="header-search">
            <input type="text" placeholder="Search resources..." />
          </div>
          <div className="header-profile">
            <img src="https://ui-avatars.com/api/?name=Admin&background=00ff88&color=050505" alt="Admin" />
            <div className="profile-info">
              <span className="name">Admin Account</span>
              <span className="status">Online</span>
            </div>
          </div>
        </header>

        <div className="content-wrapper animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
