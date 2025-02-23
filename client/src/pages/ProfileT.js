import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactSession } from "react-client-session";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  // Profile info state
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [email, setEmail] = useState('(no email for now)');
  const [courses, setCourses] = useState([]); // Optional: if you need to fetch courses

  // Teacher summary state
  const [totalStudents, setTotalStudents] = useState("n/a");
  const [totalAssignments, setTotalAssignments] = useState("n/a");

  useEffect(() => {
    const user = ReactSession.get('user');
    console.log("User is:", user);
    if (!user) {
      alert("Please log in first");
      navigate('/');
    } else {
      fetchTeacherAccountInfo();
      fetchTeacherCanvasInfo();
      fetchCourses();
      fetchTeacherSummary(user);
    }
  }, [navigate]);


  useEffect(() => {
    const enrollmentType = ReactSession.get("enrollmentType");
    console.log(enrollmentType);
      if (enrollmentType === "StudentEnrollment") {
        alert("Not authorized to access teacher page");
        navigate('/dashboard/:studentId');
      }
    }, [navigate]);
    
  // Fetch teacher account info
  const fetchTeacherAccountInfo = async () => {
    try {
      const response = await axios.get('http://localhost:4000/protected-route', {
        withCredentials: true,
      });
      setUsername(response.data.username);
      setAccountId(response.data.userId);
    } catch (error) {
      console.error('Error fetching teacher account info:', error.response ? error.response.data : error.message);
    }
  };

  // Fetch teacher canvas info
  const fetchTeacherCanvasInfo = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/users/user-details', {
        withCredentials: true,
      });
      setFullName(response.data.name);
    } catch (error) {
      console.error('Error fetching teacher canvas info:', error.response ? error.response.data : error.message);
    }
  };

  // Fetch courses info (optional)
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

  // Fetch teacher summary info (total students and total assignments)
  const fetchTeacherSummary = async (user) => {
    try {
      // Adjust this endpoint and response parsing as needed
      const response = await axios.get(`http://localhost:5001/teacher-summary?teacher_id=${user}`, {
        withCredentials: true,
      });
      // Assume response.data is an object with keys totalStudents and totalAssignments
      setTotalStudents(response.data.totalStudents);
      setTotalAssignments(response.data.totalAssignments);
    } catch (error) {
      console.error('Error fetching teacher summary:', error.response ? error.response.data : error.message);
    }
  };

  // Optional: A helper function to format ISO dates if needed
  const formatDate = (isoString) => {
    if (!isoString) return;
    const date = new Date(isoString);
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${month}-${day}-${year}`;
  };

  return (
    <div className="profile-board-container">
      {/* Header */}
      <header className="profile-header">
        <h1>My Profile</h1>
      </header>

      {/* Profile Section */}
      <div className="profile-goals-container">
        <section className="profile-section">
          <div className="profile-card">
            <img src="/image/loopy_profile.jpg" alt="Profile Pic" className="profile-image" />
            <h2>{fullName || "Your Name"}</h2>
            <p><strong>Username: </strong>{username || "N/A"}</p>
          </div>
        </section>
      </div>

      {/* Summary Section: Only total students and total assignments */}
      <div className="summary-progress-container">
        <section className="summary-section">
          <h2>Summary</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <p>{totalStudents}</p>
              <span>Total Students</span>
            </div>
            <div className="summary-card">
              <p>{totalAssignments}</p>
              <span>Total Assignments</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
