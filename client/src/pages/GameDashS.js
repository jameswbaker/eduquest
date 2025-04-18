// GameDashT.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ReactSession } from 'react-client-session';
import axios from 'axios';
import "./GameDashT.css";
import CardComponent from "../components/Card";  // Adjust path if necessary

const domain = process.env.REACT_APP_API_BASE_URL || 'localhost';

const GameDashS = () => {
  const navigate = useNavigate();
  
  // Store courses & errors from backend
  const [courseIds, setCourseIds] = useState([]);
  const [games, setGames] = useState([]);
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState(""); // For full name

  useEffect(() => {
    const user = ReactSession.get('user');
    console.log("User is:", user);
    if (!user) {
      alert("Please log in first");
      navigate('/');
    }else {
      fetchStudentCanvasInfo();
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
      const response = await axios.get(`http://${domain}:4000/api/courses`, {
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
      const response = await axios.get(`http://${domain}:5001/get-games?course_ids=${courseIdsString}`, {
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

  const fetchStudentCanvasInfo = async () => {
    try {
      const response = await axios.get(`http://${domain}:4000/api/users/user-details`, {
        withCredentials: true,
      });
      setStudentName(response.data.name);
    } catch (error) {
      console.error(
        "Error fetching student canvas info:",
        error.response ? error.response.data : error.message
      );
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
      <h1>{studentName ? `${studentName}'s Dashboard` : "Dashboard"}</h1>
      </header>

      {/* Show error (if any) */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Main Content */}
      <div className="t-dashboard-main">
        {/* Courses Section */}
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
                const subtitle = game.type;

                let startPage = `/startPage/${game.name}`;
                console.log("game type: ", game.type);
                if (game.type.toLowerCase() === "turrets") {
                  startPage = `/startTurrets/${game.name}`;
                } else if (game.type.toLowerCase() === "flappy") {
                  startPage = `/startFlappy/${game.name}`;
                }

                return (
                  <CardComponent
                    key={game.game_id}
                    title={game.name}
                    subtitle={subtitle}
                    date={game.due_date || "No due date"}
                    progress={0}
                    progressText={"0%"}
                    backgroundColor={colors.primary} // Use primary color
                    link={`${startPage}?gameId=${game.game_id}&gameName=${game.name}&type=${game.type}&courseId=${game.course_id}`}
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
    const response = await fetch(`http://${domain}:4000/api/courses/${courseId}/name`, {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error("Failed to fetch course name");
    }
    const data = await response.json();
    console.log(data);
    return data;
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


export default GameDashS;