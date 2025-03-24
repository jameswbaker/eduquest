import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./StartPage.css";

const StartFlappy = () => {
  const navigate = useNavigate();
  const { gameName } = useParams();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const gameId = queryParams.get("gameId");
  const type = queryParams.get("type");
  const courseId = queryParams.get("courseId");

  console.log("Game Details:", { gameName, gameId, type, courseId });

  const [description] = useState(
    `Guide your flappy bird through a knowledge challenge!\n
    The game pauses to present a question, giving you time to read and decide.\n
    Once the pause ends, use the space bar to flap your way to the correct pole.\n
    Choose wisely to earn points—wrong answers won't get you any!`
  );
  
  const handleStartGame = (gameName) => {
    if (!gameName || typeof gameName !== "string") {
      throw new Error("Invalid game name. Please ensure the game name is provided and is a string.");
    }
    console.log("this is gameName:: " + gameName);
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

export default StartFlappy;
