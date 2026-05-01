import React, { useState, useEffect, useRef } from 'react'
import { db, storage } from '../firebase'
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Award, Search, Download, Loader2, CheckCircle } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import '../styles/Certificates.css'

const Certificates = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [template, setTemplate] = useState('modern') // 'modern' or 'classic'
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  
  const certificateRef = useRef(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, 'users'))
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

  const handleUserChange = (userId) => {
    setSelectedUser(userId)
    const user = users.find(u => u.id === userId)
    if (user && user.enrolled_courses) {
      setEnrolledCourses(user.enrolled_courses)
      if (user.enrolled_courses.length > 0) {
        setSelectedCourse(user.enrolled_courses[0].title || user.enrolled_courses[0])
      } else {
        setSelectedCourse('')
      }
    } else {
      setEnrolledCourses([])
      setSelectedCourse('')
    }
  }

  const generateCertificate = async () => {
    if (!selectedUser || !selectedCourse) {
      alert("Please select a user and a course.")
      return
    }

    setGenerating(true)
    setSuccessMsg('')

    try {
      const user = users.find(u => u.id === selectedUser)
      const element = certificateRef.current
      
      // Capture the HTML element as a canvas
      const canvas = await html2canvas(element, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      
      // Create PDF
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      const pdfBlob = pdf.output('blob')

      // Upload to Firebase Storage
      const certId = `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      const storageRef = ref(storage, `certificates/${user.id}/${certId}.pdf`)
      
      await uploadBytes(storageRef, pdfBlob)
      const downloadURL = await getDownloadURL(storageRef)

      // Update user document
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      const newCert = {
        id: certId,
        course: typeof selectedCourse === 'string' ? selectedCourse : selectedCourse.title,
        date: today,
        status: 'Verified',
        pdfUrl: downloadURL
      }

      await updateDoc(doc(db, 'users', user.id), {
        certificates: arrayUnion(newCert)
      })

      setSuccessMsg(`Certificate successfully generated and assigned to ${user.name}!`)
      
    } catch (error) {
      console.error("Error generating certificate:", error)
      alert("Failed to generate certificate. Check console for details.")
    } finally {
      setGenerating(false)
    }
  }

  const currentUser = users.find(u => u.id === selectedUser)
  const currentCourseName = typeof selectedCourse === 'object' ? selectedCourse.title : selectedCourse
  const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="certificates-page">
      <div className="page-header">
        <div>
          <h1>Generate Certificates</h1>
          <p>Issue verified credentials to students for completed courses.</p>
        </div>
      </div>

      <div className="certificates-content">
        <div className="controls-panel glass">
          <h3>Certificate Details</h3>
          
          <div className="form-group">
            <label>Select Student</label>
            <select 
              value={selectedUser} 
              onChange={(e) => handleUserChange(e.target.value)}
              className="dark-select"
            >
              <option value="">-- Choose a Student --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Course</label>
            <select 
              value={typeof selectedCourse === 'string' ? selectedCourse : (selectedCourse?.title || '')} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="dark-select"
              disabled={!selectedUser}
            >
              <option value="">-- Choose a Course --</option>
              {enrolledCourses.map((course, idx) => {
                const courseName = typeof course === 'string' ? course : course.title;
                return (
                  <option key={idx} value={courseName}>{courseName}</option>
                )
              })}
            </select>
            {selectedUser && enrolledCourses.length === 0 && (
              <small className="help-text text-warning">This user has no enrolled courses.</small>
            )}
          </div>

          <div className="form-group">
            <label>Template Style</label>
            <div className="template-options">
              <button 
                className={`template-btn ${template === 'modern' ? 'active' : ''}`}
                onClick={() => setTemplate('modern')}
              >
                Modern Cyber
              </button>
              <button 
                className={`template-btn ${template === 'classic' ? 'active' : ''}`}
                onClick={() => setTemplate('classic')}
              >
                Classic Shield
              </button>
              <button 
                className={`template-btn ${template === 'premium' ? 'active' : ''}`}
                onClick={() => setTemplate('premium')}
              >
                Premium Gold
              </button>
            </div>
          </div>

          <button 
            className="generate-btn"
            onClick={generateCertificate}
            disabled={!selectedUser || !selectedCourse || generating}
          >
            {generating ? (
              <><Loader2 size={20} className="spin" /> Generating PDF...</>
            ) : (
              <><Award size={20} /> Generate & Assign Certificate</>
            )}
          </button>

          {successMsg && (
            <div className="success-message">
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        <div className="preview-panel">
          <h3>Live Preview</h3>
          <div className="preview-wrapper">
            <div 
              className={`certificate-template ${template}`} 
              ref={certificateRef}
            >
              {template === 'premium' ? (
                <>
                  <div className="premium-border-outer"></div>
                  <div className="premium-border-inner"></div>
                  <div className="premium-corner-tl"></div>
                  <div className="premium-corner-tr"></div>
                  <div className="premium-corner-bl"></div>
                  <div className="premium-corner-br"></div>
                  
                  <div className="premium-content">
                    <div className="premium-iso">AN ISO 9001:2015 Certified</div>
                    <div className="premium-badge-left">
                      <Award size={60} color="#b8860b" />
                      <span className="premium-badge-text">ISO<br/>CERTIFIED</span>
                    </div>

                    <div className="premium-title">CERTIFICATE</div>
                    <div className="premium-subtitle">IN {currentCourseName ? currentCourseName.toUpperCase() : 'COURSE NAME'}</div>
                    <div className="premium-divider"></div>

                    <div className="premium-certify-text">This is to certify that</div>
                    <h2 className="premium-recipient">{currentUser ? currentUser.name : 'Student Name'}</h2>
                    <p className="premium-reason">
                      has successfully completed the {currentCourseName || 'Course'} Certification Program conducted by CyberWebShield
                    </p>

                    <div className="premium-footer-grid">
                      <div className="premium-footer-left">
                        <div className="qr-placeholder">
                          <div className="qr-inner"></div>
                        </div>
                        <div className="premium-duration-text">{issueDate}</div>
                        <div className="premium-duration-label">DURATION</div>
                      </div>

                      <div className="premium-footer-center">
                        <div className="premium-cert-id">Certificate ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                        <img src="/logo.png" alt="Logo" className="premium-center-logo" onError={(e) => e.target.style.display='none'} />
                        <div className="premium-brand-text">CYBER WEB SHIELD</div>
                      </div>

                      <div className="premium-footer-right">
                        <div className="premium-seal">
                          <Award size={50} color="#4b0082" />
                          <span>CWS</span>
                        </div>
                        <div className="premium-signature-line"></div>
                        <div className="premium-signature-label">Managing Director</div>
                      </div>
                    </div>

                    <div className="premium-verify-text">
                      To verify this certificate status kindly log on : www.cyberwebshield.com
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="cert-border"></div>
                  <div className="cert-corner top-left"></div>
                  <div className="cert-corner top-right"></div>
                  <div className="cert-corner bottom-left"></div>
                  <div className="cert-corner bottom-right"></div>

                  <div className="cert-content">
                    <div className="cert-header">
                      <img src="/logo.png" alt="Logo" className="cert-logo" onError={(e) => e.target.style.display='none'} />
                      <div className="cert-brand">CyberWebShield</div>
                    </div>

                    <div className="cert-title">CERTIFICATE</div>
                    <div className="cert-subtitle">OF COMPLETION</div>

                    <div className="cert-body">
                      <p className="cert-presented">This is presented to</p>
                      <h2 className="cert-recipient">{currentUser ? currentUser.name : 'Student Name'}</h2>
                      <p className="cert-reason">for successfully completing the course</p>
                      <h3 className="cert-course">{currentCourseName || 'Course Title'}</h3>
                    </div>

                    <div className="cert-footer">
                      <div className="cert-signature">
                        <div className="signature-line"></div>
                        <p>Lead Instructor</p>
                      </div>
                      <div className="cert-date-seal">
                        <div className="cert-seal">
                          <Award size={40} color={template === 'modern' ? '#db95fc' : '#ffd700'} />
                        </div>
                        <p className="cert-date">Date: {issueDate}</p>
                      </div>
                      <div className="cert-signature">
                        <div className="signature-line"></div>
                        <p>Director of Training</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Certificates
