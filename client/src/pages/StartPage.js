import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import "./StartPage.css";

const StartPage = () => {
  const navigate = useNavigate();
  const [gameName, setGameName] = useState('Word Mastery Challenge')
  const [description, setDescription] = useState(`Test your spelling, grammar, and word skills in this fun and
            interactive game. Compete against time to complete challenges and
            achieve the highest score!`)

  const handleStartGame = (gameName) => {
    navigate("/game"); // Redirect to the game interface
  };

  return (
    <div className="start-page">
      <div className="start-container">
        <h1 className="game-title">Word Mastery Challenge</h1>
        <div className="game-description">
          <p>
            Welcome to the {gameName}! <br></br>
            {description}
          </p>
        </div>
        <button className="start-button" onClick={handleStartGame}>
          Start Game
        </button>
      </div>
    </div>
  );
};

export default StartPage;
