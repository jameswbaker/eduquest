import React, { useState } from "react";
import "./Profile.css";

const Profile = () => {

  const [firstName, setFirstname] = useState('Grace');
  const [lastName, setLastname] = useState('Thang');
  const [email, setEmail] = useState('chanyat@rism.ac.th');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  // use starter dummy data for now
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    assignedBy: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addGoal = () => {
    setGoals([...goals, formData]); // Add new goal to the list
    setFormData({ title: "", description: "", deadline: "", assignedBy: "student" }); // Reset form
    setIsModalOpen(false); // Close modal
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
            <img
              className="profile-image"
              src="https://via.placeholder.com/100"
              alt="Profile"
            />
            <h2>{firstName} {lastName}</h2>
            <p>{email}</p>
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
                className={`goal-card ${
                  goal.assignedBy === "teacher" ? "teacher-goal" : "student-goal"
                }`}
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

      {/* Summary Section */}
      <section className="summary-section">
        <h2>Summary</h2>
        <div className="summary-cards">
          <div className="summary-card">
            <p>50</p>
            <span>Total Courses Enrolled</span>
          </div>
          <div className="summary-card">
            <p>13</p>
            <span>Courses Completed</span>
          </div>
          <div className="summary-card">
            <p>37</p>
            <span>Courses Ongoing</span>
          </div>
          <div className="summary-card">
            <p>85%</p>
            <span>Average Score</span>
          </div>
        </div>
      </section>

      {/* Progress Chart */}
      <section className="progress-section">
        <h2>Progress of Courses</h2>
        <div className="progress-chart">
          <div className="chart-placeholder">
            <p>Chart Here</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
