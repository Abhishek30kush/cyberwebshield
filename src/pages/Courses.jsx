import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Plus, Edit2, Trash2, X, Play, Image as ImageIcon } from 'lucide-react'
import '../styles/Courses.css'

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: 'Abhishek Kushwaha',
    duration: '',
    lessons: 0,
    price: '',
    image: '',
    videoUrl: '',
    category: 'Cyber Security'
  })

  const fetchCourses = React.useCallback(async () => {
    setLoading(true)
    const querySnapshot = await getDocs(collection(db, 'courses'))
    const coursesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    setCourses(coursesData)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), {
          ...formData,
          updatedAt: serverTimestamp()
        })
      } else {
        await addDoc(collection(db, 'courses'), {
          ...formData,
          createdAt: serverTimestamp()
        })
      }
      resetForm()
      fetchCourses()
      setShowModal(false)
    } catch (error) {
      console.error("Error saving course:", error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await deleteDoc(doc(db, 'courses', id))
      fetchCourses()
    }
  }

  const openEditModal = (course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      duration: course.duration,
      lessons: course.lessons,
      price: course.price,
      image: course.image,
      videoUrl: course.videoUrl || '',
      category: course.category
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingCourse(null)
    setFormData({
      title: '',
      description: '',
      instructor: 'Abhishek Kushwaha',
      duration: '',
      lessons: 0,
      price: '',
      image: '',
      videoUrl: '',
      category: 'Cyber Security'
    })
  }

  return (
    <div className="courses-page">
      <div className="page-header">
        <div>
          <h1>Manage Courses</h1>
          <p>Create and edit your security training modules.</p>
        </div>
        <button className="add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={20} />
          <span>Add New Course</span>
        </button>
      </div>

      {loading ? (
        <div className="loader">Loading Courses...</div>
      ) : (
        <div className="courses-list">
          {courses.map(course => (
            <div key={course.id} className="course-admin-card glass">
              <div className="course-img">
                {course.image ? <img src={course.image} alt={course.title} /> : <div className="img-placeholder"><ImageIcon /></div>}
                <div className="course-badge">{course.category}</div>
              </div>
              <div className="course-details">
                <h3>{course.title}</h3>
                <p className="instructor">By {course.instructor}</p>
                <div className="course-meta">
                  <span>{course.lessons} Lessons</span>
                  <span>{course.duration}</span>
                </div>
                <div className="course-actions">
                  <button className="action-btn edit" onClick={() => openEditModal(course)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(course.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade-in">
            <div className="modal-header">
              <h2>{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="course-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Course Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Ethical Hacking Masterclass"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Network Security">Network Security</option>
                    <option value="Web Hacking">Web Hacking</option>
                    <option value="Linux">Linux</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Course overview and objectives..."
                    rows="4"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Instructor</label>
                  <input 
                    type="text" 
                    value={formData.instructor} 
                    onChange={e => setFormData({...formData, instructor: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Duration (e.g. 12h 30m)</label>
                  <input 
                    type="text" 
                    value={formData.duration} 
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Number of Lessons</label>
                  <input 
                    type="number" 
                    value={formData.lessons} 
                    onChange={e => setFormData({...formData, lessons: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Price (e.g. ₹999 or Free)</label>
                  <input 
                    type="text" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Thumbnail Image URL</label>
                  <input 
                    type="text" 
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="form-group">
                  <label>Primary Video URL (YouTube/MP4)</label>
                  <input 
                    type="text" 
                    value={formData.videoUrl} 
                    onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">{editingCourse ? 'Update Course' : 'Publish Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Courses
