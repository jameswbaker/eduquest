import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import "./StartPage.css";
import { useParams } from "react-router-dom";


const StartPage = () => {
  const navigate = useNavigate();
  const { gameName } = useParams();
  console.log("this is gameName: " + gameName);
  // const [gameName, setGameName] = useState('Word Mastery Challenge')
  const [description, setDescription] = useState(`Test your spelling, grammar, and word skills in this fun and
            interactive game. Compete against time to complete challenges and
            achieve the highest score!`)

  

  const handleStartGame = (gameName) => {
    if (!gameName || typeof gameName !== "string") {
      throw new Error("Invalid game name. Please ensure the game name is provided and is a string.");
    }
    console.log("this is gameName:: " + gameName);
    navigate(`/game/${gameName}`);
    // navigate("/game/" + gameName);// Redirect to the game interface
  };

  return (
    <div className="start-page">
      <div className="start-container">
        <h1 className="game-title">{gameName}</h1>
        <div className="game-description">
          <p>
            Welcome to the {gameName}! <br></br>
            {description}
          </p>
        </div>
        <button
          className="start-button"
          onClick={() => handleStartGame(gameName)} // Pass gameName explicitly
        >
          Start Game
        </button>
        {/* <button className="start-button" onClick={handleStartGame}> */}
        {/* </button> */}
      </div>
    </div>
  );
};

export default StartPage;
