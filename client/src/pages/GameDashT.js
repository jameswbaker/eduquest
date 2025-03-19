// GameDashT.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ReactSession } from 'react-client-session';
import axios from 'axios';
import "./GameDashT.css";
import { domain } from "../const.js";

const GameDashT = () => {
  const navigate = useNavigate();
  
  // Store courses & errors from backend
  const [games, setGames] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = ReactSession.get('user');
    console.log("User is:", user);
    if (!user) {
      alert("Please log in first");
      navigate('/');
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

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setError("");
    try {
      const response = await axios.get(`${domain}:5001/api/games`, {
        withCredentials: true,
      });
      setGames(response.data);
    } catch (error) {
      console.error(
        "Error fetching games:",
        error.response ? error.response.data : error.message
      );
      setError("Error fetching games. Please check your token and permissions.");
    }
  };

  // 3. Color cycle array
  const colorOrder = ["yellow", "blue", "red", "pink", "green"];

  // Example: Student View button logic
  const studentId = 0;
  const handleStudentView = () => {
    const idToNavigate = studentId || 0;  
    navigate(`/dashboard/${idToNavigate}`);
  };

  return (
    <div className="t-game-dashboard-container">
      {/* Header */}
      <header className="t-dashboard-header">
        <h1>Teacher's Game Dashboard</h1>
        {/* <div className="t-header-icons">
          <button className="t-icon-button" onClick={handleStudentView}>
            Student View
          </button>
        </div> */}
      </header>


      <a href={"/createGame"}> 
        <button> Create New Game </button>
      </a>

      {/* Show error (if any) */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Main Content */}
      <div className="t-dashboard-main">
        {/* Games Section */}
        <div className="t-courses-section">
          <h2>Games</h2>
          <div className="t-courses-list">
            {/* Dynamically render courses */}
            {games.map((game, index) => {
              const color = colorOrder[index % colorOrder.length];
              return (
                <CourseCard
                  key={game.id}
                  courseName={game.name}
                  instructor={game.type}
                  color={color}
                  courseId={game.course_id}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseCard = ({ courseName, instructor, color, courseId }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dataDashboard/${courseId}`);
  };

  return (
    <div className="t-course-card" onClick={handleClick}>
      <div className={`t-color-section ${color}`}></div>
      <div className={`t-text-section ${color}`}>
        <h3>{courseName}</h3>
        <p>{instructor}</p>
      </div>
    </div>
  );
};

export default GameDashT;
