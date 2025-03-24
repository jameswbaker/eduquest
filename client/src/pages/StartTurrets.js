import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./StartPage.css"; // Assuming shared styles

const StartTurrets = () => {
  const navigate = useNavigate();
  const { gameName } = useParams();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const gameId = queryParams.get("gameId");
  const type = queryParams.get("type");
  const courseId = queryParams.get("courseId");

  console.log("Game Details:", { gameName, gameId, type, courseId });

  const [description] = useState(`Command your tank in this fast-paced knowledge battle! \n
    A question appears above, and two answer choices stand before you. Use the arrow keys to navigate your tank toward the correct answer while dodging incoming threats. \n
    Answer correctly to advance and score points—but beware, the wrong choice will halt your progress!`);

  const handleStartGame = (gameName) => {
    if (!gameName || typeof gameName !== "string") {
      throw new Error("Invalid game name. Please ensure the game name is provided and is a string.");
    }
    const link=`/playGame?gameId=${gameId}&gameName=${gameName}&type=${type}&courseId=${courseId}`;
    navigate(link);
  };

  return (
    <div className="start-page">
      <div className="start-container">
        <h1 className="game-title">{gameName}</h1>
        <div className="game-description">
          <p>
            Welcome to {gameName}! <br />
            {description}
          </p>
        </div>
        <button
          className="start-button"
          onClick={() => handleStartGame(gameName)}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default StartTurrets;
