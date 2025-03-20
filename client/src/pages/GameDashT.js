// GameDashT.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ReactSession } from 'react-client-session';
import axios from 'axios';
import "./GameDashT.css";
import { domain } from "../const.js";
import CardComponent from "../components/Card";  // Adjust path if necessary


const GameDashT = () => {
  const navigate = useNavigate();
  
  // Store courses & errors from backend
  const [courseIds, setCourseIds] = useState([]);
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
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchGames(courseIds);
  }, [courseIds]);

  const fetchCourses = async () => {
    setError("");
    try {
      const response = await axios.get(`${domain}:4000/api/courses`, {
        withCredentials: true,
      });
      const courseIdsArray = response.data.map(course => course.id);
      setCourseIds(courseIdsArray);
    } catch (error) {
      console.error(
        "Error fetching courses:",
        error.response ? error.response.data : error.message
      );
      setError("Error fetching courses. Please check your token and permissions.");
    }
  };

  const fetchGames = async (courseIds) => {
    setError("");
    if (!courseIds || courseIds.length === 0) {
      setError("No course IDs provided.");
      return;
    }
    try {
      const courseIdsString = courseIds.join(',');
      const response = await axios.get(`${domain}:5001/get-games?course_ids=${courseIdsString}`, {
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
      <div className="create-game-container">
        <a href="/createGame">
          <button className="start-btn">Create New Game</button>
        </a>
      </div>

      {/* Show error (if any) */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Main Content */}
      <div className="t-dashboard-main">
        {/* Games Section */}
        <div className="t-courses-section">
          <h2>Games</h2>
          <div className="t-courses-list">
            {/* Dynamically render courses */}
            <div className="game-grid">
              {games.slice()
                .sort((a, b) => b.game_id - a.game_id)
                .map((game, index) => {
                  const colorKey = colorOrder[index % colorOrder.length];
                  const colors = colorMapping[colorKey];

                  return (
                    <CardComponent
                      key={game.game_id}
                      title={game.name}
                      subtitle={game.type}
                      date={game.due_date || "No due date"}
                      progress={0}
                      progressText={"0%"}
                      backgroundColor={colors.primary} // Use primary color
                      link={`/playGame?gameId=${game.game_id}&gameName=${game.name}&type=${game.type}&courseId=${game.course_id}`}
                    />
                  );
                })}
            </div>
            
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


const colorMapping = {
  yellow: { primary: "#F2C100", lighter: "#FBE79F" },
  blue: { primary: "#5586E0", lighter: "#A9C6F5" },
  red: { primary: "#E54B32", lighter: "#F6A79B" },
  pink: { primary: "#EA97B3", lighter: "#F7C3D1" },
  green: { primary: "#8FCE5D", lighter: "#C5E6A0" },
};

// Maintain a cycle of colors for the games
const colorOrder = ["yellow", "blue", "red", "pink", "green"];

export default GameDashT;