import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactSession } from "react-client-session";
import "./GameInterface.css";
import { useParams } from "react-router-dom";

const GameInterface = () => {
    
    const navigate = useNavigate();


    useEffect(() => {
      const user = ReactSession.get('user');
      console.log("User is:", user);
      if (!user) {
        alert("Please log in first");
        navigate('/'); 
      }
    }, [navigate]);
    
    // const [gameName, setGameName] = useState('Word Mastery Challenge')
    const { gameName } = useParams();

    return (
        <div className="game-interface">
        {/* Navigation Bar */}
        <header className="nav-bar">
            <button className="back-button">🔙</button>
            {/* <div className="nav-icons">
            <span className="nav-icon">👤</span>
            <span className="nav-icon">🛒</span>
            <span className="nav-icon">⚪</span>
            </div> */}
        </header>

        

        {/* Main Content */}
        <div className="game-container">
            <div className="side-panel">
                    <div className="timer">
                        <p>Time:</p>
                        <span>03:23</span>
                    </div>
                    <div className="score">
                        <p>Score:</p>
                        <span>400</span>
                    </div>
                    <div className="questions">
                        <p>Question</p>
                        <span>4/20</span>
                    </div>
                    <div className="buttons">
                        <button className="pause-btn">Pause</button>
                        <button className="submit-btn">Submit</button>
                    </div>
            </div>
            {/* Main Game Section */}
            <div className="game-section">
                <h2 className="course-title">{gameName || "Default Game Name"}</h2>
                <h3 className="game-question">What is the correct spelling?</h3>
                <div className="game-block">
                    {/* Game block left empty */}
                </div>
            </div>
        </div>
        </div>
    );
    };

export default GameInterface;
