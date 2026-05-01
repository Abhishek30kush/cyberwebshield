import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { Users, BookOpen, Clock, TrendingUp } from 'lucide-react'
import '../styles/Dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    activeLearners: 124, // Mock for now
    totalHours: 1250 // Mock for now
  })

  const [recentUsers, setRecentUsers] = useState([])
  const [health, setHealth] = useState({
    database: 'checking',
    storage: 'checking',
    auth: 'checking'
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'))
        const coursesSnap = await getDocs(collection(db, 'courses'))
        
        setStats(prev => ({
          ...prev,
          users: usersSnap.size,
          courses: coursesSnap.size
        }))

        // Fetch recent users
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5))
        const recentSnap = await getDocs(q)
        const recent = recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setRecentUsers(recent)

        setHealth({ database: 'online', storage: 'online', auth: 'online' })
      } catch (err) {
        console.error("Dashboard fetch error:", err)
        setHealth({ database: 'offline', storage: 'offline', auth: 'offline' })
      }
    }
    fetchDashboardData()
  }, [])

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome Back, Admin</h1>
        <p>Here's what's happening with CyberWebShield today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon users">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="label">Total Students</span>
            <span className="value">{stats.users}</span>
          </div>
          <div className="stat-trend positive">
            <TrendingUp size={16} />
            <span>+12%</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon courses">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <span className="label">Active Courses</span>
            <span className="value">{stats.courses}</span>
          </div>
          <div className="stat-trend positive">
            <TrendingUp size={16} />
            <span>+3%</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon learners">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="label">Learning Hours</span>
            <span className="value">{stats.totalHours}</span>
          </div>
          <div className="stat-trend positive">
            <TrendingUp size={16} />
            <span>+24%</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon sessions">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="label">Live Sessions</span>
            <span className="value">{stats.activeLearners}</span>
          </div>
          <div className="stat-trend negative">
            <TrendingUp size={16} style={{transform: 'rotate(180deg)'}} />
            <span>-5%</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="recent-activity glass">
          <h3>Recent Activity (New Signups)</h3>
          {recentUsers.length > 0 ? (
            <div className="activity-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentUsers.map(user => (
                <div key={user.id} className="activity-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="activity-icon" style={{ padding: '0.5rem', background: 'rgba(0, 255, 170, 0.1)', borderRadius: '8px', color: 'var(--neon-green)' }}><Users size={16} /></div>
                  <div className="activity-details">
                    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>{user.name}</strong> joined the platform</p>
                    <small style={{ color: 'var(--text-secondary)' }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Just now'}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="activity-placeholder">
               <p>No recent activity found...</p>
            </div>
          )}
        </div>
        
        <div className="system-health glass">
          <h3>System Health</h3>
          <div className="health-grid">
             <div className="health-item">
                <span>Database</span>
                <div className={`status-dot ${health.database}`}></div>
             </div>
             <div className="health-item">
                <span>Storage</span>
                <div className={`status-dot ${health.storage}`}></div>
             </div>
             <div className="health-item">
                <span>Auth Service</span>
                <div className={`status-dot ${health.auth}`}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
