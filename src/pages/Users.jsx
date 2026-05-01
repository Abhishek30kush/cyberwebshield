import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { Mail, Phone, Calendar, Shield, Search } from 'lucide-react'
import '../styles/Users.css'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1>Student Directory</h1>
          <p>Monitor and manage registered users and their progress.</p>
        </div>
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loader">Loading users data...</div>
      ) : (
        <div className="users-table-container glass">
          <table className="users-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Contact info</th>
                <th>Enrolled</th>
                <th>Joined Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-profile-cell">
                      <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} />
                      <div>
                        <span className="user-name">{user.name}</span>
                        <span className="user-role">{user.role || 'Student'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-contact">
                      <div className="contact-item"><Mail size={14} /> {user.email}</div>
                      <div className="contact-item"><Phone size={14} /> {user.phone || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <span className="enrolled-count">{user.enrolled_courses?.length || 0} Courses</span>
                  </td>
                  <td>
                    <div className="joined-date">
                      <Calendar size={14} />
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge active`}>Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="no-results">No students found matching your search.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default Users
