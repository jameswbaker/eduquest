import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactSession } from "react-client-session";
import axios from "axios";
import confetti from "canvas-confetti";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  // Profile info state
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [email, setEmail] = useState('(no email for now)');
  const [courses, setCourses] = useState([]);

  // States for Goals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({
    goal_title: "",
    description: "",
    deadline: "",
    assignedBy: "",
  });

  // Check session and fetch data on mount
  useEffect(() => {
    const user = ReactSession.get('user');
    console.log("User is:", user);
    if (!user) {
      alert("Please log in first");
      navigate('/');
    } else {
      fetchStudentAccountInfo();
      fetchStudentCanvasInfo();
      fetchCourses();
      fetchGoals(user);
    }
  }, [navigate]);


  useEffect(() => {
    const enrollmentType = ReactSession.get("enrollmentType");
    console.log(enrollmentType);
      if (enrollmentType === "TeacherEnrollment") {
        alert("Not authorized to access teacher page");
        navigate('/teacherBoard');
      }
    }, [navigate]);
    

  // Fetch student account info
  const fetchStudentAccountInfo = async () => {
    try {
      const response = await axios.get('http://localhost:4000/protected-route', {
        withCredentials: true,
      });
      setUsername(response.data.username);
      setAccountId(response.data.userId);
    } catch (error) {
      console.error('Error fetching student account info:', error.response ? error.response.data : error.message);
    }
  };

  // Fetch student canvas info
  const fetchStudentCanvasInfo = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/users/user-details', {
        withCredentials: true,
      });
      setFullName(response.data.name);
    } catch (error) {
      console.error('Error fetching student canvas info:', error.response ? error.response.data : error.message);
    }
  };

  // Fetch courses info
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

  // Format ISO date string to MM-DD-YYYY
  function formatDate(isoString) {
    if (!isoString) return;
    const date = new Date(isoString);
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${month}-${day}-${year}`;
  }

  // Helper to determine if deadline is overdue or within 7 days from now
  const isDeadlineRed = (deadlineStr) => {
    console.log(deadlineStr);
    if (!deadlineStr || deadlineStr === "N/A") return false;
    const [month, day, year] = deadlineStr.split("-");
    const deadlineDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate - today;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    console.log(diffDays);
    // Red if overdue (diffDays < 0) or deadline is within 7 days (including today)
    return diffDays <= 0;
  };

  const fetchGoals = async (user) => {
    try {
      const response = await axios.get(`http://localhost:5001/get-goals?account_id=${user}`, {
        withCredentials: true,
      });
      console.log("Fetched goals:", response.data); // Check structure in console
  
      const formattedGoals = response.data.map(goal => ({
        ...goal,
        description: goal.description ? goal.description : "no description",
        deadline: goal.deadline ? formatDate(goal.deadline) : "no deadline",
        completed: goal.completed ? true : false,
      }));
  
  
      const getDeadlineValue = (deadlineStr) => {
        if (deadlineStr === "no deadline") {
          return Infinity;
        }
        const [month, day, year] = deadlineStr.split("-");
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
      };
  
     
      formattedGoals.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        const aDeadline = getDeadlineValue(a.deadline);
        const bDeadline = getDeadlineValue(b.deadline);
        return aDeadline - bDeadline;
      });
  
      setGoals(formattedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error.response ? error.response.data : error.message);
    }
  };
  

  // Handler for input changes in the modal form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add a new goal
  const addGoal = async () => {
    if (!formData.goal_title.trim()) {
      alert("Goal title is required.");
      return;
    }
    if (!accountId) {
      alert("User ID empty");
      return;
    }
    try {
      const goalData = {
        goal_title: formData.goal_title,
        description: formData.description,
        deadline: formData.deadline || null,
        account_id: accountId,
      };
      const response = await axios.post('http://localhost:5001/add-goal', goalData, {
        withCredentials: true,
      });
  
      alert(response.data.message);
      setFormData({ goal_title: "", description: "", deadline: "", assignedBy: "student" });
      setIsModalOpen(false);
      // Refetch goals after adding a new goal
      fetchGoals(accountId);
    } catch (error) {
      console.error("Error adding goal: ", error.response ? error.response.data : error.message);
      alert("Error adding goal. Please try again.");
    }
  };

  // Handler when a goal is marked as achieved
  const handleGoalAchieved = async (goalId) => {
    try {
      // Update goal in the database to mark it as completed
      await axios.post('http://localhost:5001/update-goal', { goalId, completed: true }, { withCredentials: true });
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      // Refetch goals to update the list and sort completed goals to the end
      fetchGoals(accountId);
    } catch (error) {
      console.error("Error updating goal: ", error.response ? error.response.data : error.message);
      alert("Failed to update goal status");
    }
  };

  // Determine the CSS class for a goal card based on its status
  const getGoalCardClass = (goal) => {
    if (goal.completed) return "completed-green";
    if (!goal.completed && goal.deadline !== "N/A" && isDeadlineRed(goal.deadline)) return "deadline-red";
    return "incomplete-blue";
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
            <img src="/image/loopy_profile.jpg" alt="Profile Pic" className="profile-image" />
            <h2>{fullName || "Your Name"}</h2>
            <p><strong>Username: </strong>{username || "N/A"}</p>
            {/*<p>Email: {email}</p>*/}
            {/*  <button className="edit-profile-btn">Edit Profile</button> */}
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
          <div className="goals-container">
            <div className="goals-list">
              {goals.map((goal, index) => (
                <div
                  className={`goal-card ${goal.assignedBy === "teacher" ? "teacher-goal" : "student-goal"} ${getGoalCardClass(goal)}`}
                  key={goal.goal_id || index}
                >
                  <h3>{goal.goal_title}</h3>
                  <p>{goal.deadline}</p>
                  {!goal.completed && (
                    <button 
                      className="goal-achieved-btn" 
                      onClick={() => handleGoalAchieved(goal.goal_id)}
                    >
                      Completed
                    </button>
                  )}
                  {goal.completed && (
                    <p className="goal-completed-text"><strong>Completed!</strong></p>
                  )}
                </div>
              ))}
            </div>
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
                  name="goal_title"
                  value={formData.goal_title}
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
