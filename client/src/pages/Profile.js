// Profile.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactSession } from "react-client-session";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  // Profile info state from our backend and Canvas
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('(no email for now)'); 
  const [courses, setCourses] = useState([]);
  
  // States for Goals (already in your profile layout)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    assignedBy: "",
  });

  // Check for session on mount and fetch info
  useEffect(() => {
    const user = ReactSession.get('user');
    console.log("User is:", user);
    if (!user) {
      navigate('/');
      alert("Please log in first");
    } else {
      fetchStudentAccountInfo();
      fetchStudentCanvasInfo();
      fetchCourses();
    }
  }, [navigate]);

  // Fetch student info from our protected route
  const fetchStudentAccountInfo = async () => {
    try {
      const response = await axios.get('http://localhost:4000/protected-route', {
        withCredentials: true,
      });
      setUsername(response.data.username);
    } catch (error) {
      console.error('Error fetching student account info:', error.response ? error.response.data : error.message);
    }
  };

  // Fetch student info from Canvas API (for full name and possibly email)
  const fetchStudentCanvasInfo = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/users/user-details', {
        withCredentials: true,
      });
      setFullName(response.data.name);
      // Uncomment the next line if your response contains an email
      // setEmail(response.data.email);
    } catch (error) {
      console.error('Error fetching student canvas info:', error.response ? error.response.data : error.message);
    }
  };

  // Fetch courses to display number of active courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/courses', {
        withCredentials: true,
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error.response ? error.response.data : error.message);
    }
  };

  // Handlers for Goals section
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addGoal = () => {
    setGoals([...goals, formData]); // add new goal
    setFormData({ title: "", description: "", deadline: "", assignedBy: "student" }); // reset form
    setIsModalOpen(false);
  };

  return (
    <div className="profile-board-container">
      {/* Header */}
      <header className="profile-header">
        <h1>My Profile</h1>
      </header>

      {/* Profile and Goals Side by Side */}
      <div className="profile-goals-container">
        {/* Profile Section */}
        <section className="profile-section">
          <div className="profile-card">
            {/* Profile picture placeholder */}
            <img src="/image/loopy_profile.jpg" alt="Profile Pic" className="profile-image" />
            <h2>{fullName || "Your Name"}</h2>
            <p>Username: {username || "N/A"}</p>
            <p>Email: {email}</p>
        
            <button className="edit-profile-btn">Edit Profile</button>
          </div>
        </section>

        {/* Goals Section */}
        <section className="goals-section">
          <header className="goals-header">
            <h2>Goals</h2>
            <button className="add-goals-btn" onClick={() => setIsModalOpen(true)}>
              Add New Goals
            </button>
          </header>
          <div className="goals-list">
            {goals.map((goal, index) => (
              <div
                className={`goal-card ${goal.assignedBy === "teacher" ? "teacher-goal" : "student-goal"}`}
                key={index}
              >
                <h3>{goal.title}</h3>
                <p>{goal.description}</p>
                <p>Deadline: {goal.deadline}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal for Adding Goals */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Goal</h2>
            <form className="goal-form">
              <label>
                Goal Title:
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Description:
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Deadline:
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Assigned By:
                <select
                  name="assignedBy"
                  value={formData.assignedBy}
                  onChange={handleInputChange}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </label>
            </form>
            <div className="modal-actions">
              <button className="modal-btn save-btn" onClick={addGoal}>
                Save
              </button>
              <button className="modal-btn cancel-btn" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="summary-progress-container">
        {/* Summary Section */}
        <section className="summary-section">
          <h2>Summary</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <p>{courses.length}</p>
              <span>Total Courses Enrolled</span>
            </div>
            <div className="summary-card">
              <p>n/a</p>
              <span>Total Assignments Completed</span>
            </div>
            <div className="summary-card">
              <p>n/a</p>
              <span>Total Games Completed</span>
            </div>
            <div className="summary-card">
              <p>n/a</p>
              <span>Average Assignment Score</span>
            </div>
          </div>
        </section>

        {/* Progress Section */}
        <section className="progress-section">
          <h2>Progress of Course</h2>
          <div className="progress-chart">
            <div className="chart-placeholder">
              <p>Chart Here</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
