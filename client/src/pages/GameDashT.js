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
            {games.slice() // creates a copy so the original array isn't mutated
            .sort((a, b) => b.game_id - a.game_id)
            .map((game, index) => {
              const color = colorOrder[index % colorOrder.length];
              return (
                <GameCard
                  key={game.game_id}
                  gameId={game.game_id}
                  gameName={game.name}
                  type={game.type}
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

async function getCourseFromCourseId(courseId) {
  try {
    const response = await fetch(`${domain}:4000/api/courses/${courseId}/name`, {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error("Failed to fetch course name");
    }
    const data = await response.json();
    return data.course_name;
  } catch (error) {
    console.error("Error fetching course name:", error);
    return "Unknown Course";
  }
}

const GameCard = ({ gameId, gameName, type, color, courseId }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/playGame?gameId=${gameId}&gameName=${gameName}&type=${type}&courseId=${courseId}`);
  };

  const [course, setCourse] = useState("");

  useEffect(() => {
    getCourseFromCourseId(courseId).then(setCourse);
  }, [courseId]);

  return (
    <div className="t-course-card" onClick={handleClick}>
      <div className={`t-color-section ${color}`}></div>
      <div className={`t-text-section ${color}`}>
        <h3>{gameName}</h3>
        <p>{type}</p>
        <p className="course-name">Course Name: {course}</p>
      </div>
    </div>
  );
};

export default GameDashT;
