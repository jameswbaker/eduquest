import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ReactSession } from "react-client-session";
import { domain } from "../const";
import axios from 'axios';
import "./PlayGamePage.css";


const PlayGamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [backRoute, setBackRoute] = useState("/"); // Default fallback


  // Parse query params using URLSearchParams
  const queryParams = new URLSearchParams(location.search);
  const gameId = queryParams.get('gameId');
  const gameName = queryParams.get('gameName');
  const type = queryParams.get('type');
  const courseId = queryParams.get('courseId');

  

  useEffect(() => {
    const user = ReactSession.get("user");
    console.log("User is:", user);
    if (!user) {
      alert("Please log in first");
      navigate("/");
    }
    const enrollmentType = ReactSession.get("enrollmentType");
    const route = enrollmentType === "StudentEnrollment" ? "/studentGameBoard/:studentId" : "/teacherGameBoard";
    setBackRoute(route);
    console.log("This is backRoute:", route);
  }, [navigate]);

  return (
    <div className="background">
      <div className="game-container">
        {/* BACK BUTTON */}
        <button className="back-btn" onClick={() => navigate(backRoute)}>🔙</button>
        <iframe
          src={`/html/game_play.html?gameId=${gameId}&gameName=${gameName}&type=${type}&courseId=${courseId}`}
          width="100%" 
          height="600"
          frameBorder="0"
          title="Play Game"
          scrolling="yes" 
          style={{ maxWidth: "900px", minWidth: "700px", borderRadius: "10px" }} 
        />
      </div>
    </div>
  );
};

export default PlayGamePage;