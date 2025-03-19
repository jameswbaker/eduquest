import React, { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ReactSession } from "react-client-session";
import { domain } from "../const";
import axios from 'axios';

const PlayGamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
  }, [navigate]);

  return (
    <div className="background">
      <div className="game-container">
        <a href="/teacherGameBoard">
          <button>Back</button>
        </a>
        {/* TODO: direct to either teacher dashboard or student dashboard depending on role */}
        
        <iframe
          src={`/html/game_play.html?gameId=${gameId}&gameName=${gameName}&type=${type}&courseId=${courseId}`}
          width="700"
          height="600"
          frameBorder="0"
          title="Play Game"
          scrolling="no"
          style={{ overflow: "hidden" }}
        />
      </div>
    </div>
  );
};

export default PlayGamePage;