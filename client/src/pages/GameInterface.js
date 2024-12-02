import React, {useState} from "react";
import "./GameInterface.css";

const GameInterface = () => {
    
    const [gameName, setGameName] = useState('Word Mastery Challenge')

    return (
        <div className="game-interface">
        {/* Navigation Bar */}
        <header className="nav-bar">
            <button className="back-button">🔙</button>
            <div className="nav-icons">
            <span className="nav-icon">👤</span>
            <span className="nav-icon">🛒</span>
            <span className="nav-icon">⚪</span>
            </div>
        </header>

        {/* Main Content */}
        <div className="game-container">
            {/* Left Panel */}
            <aside className="side-panel">
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
            </aside>

            {/* Main Game Section */}
            <main className="game-section">
            <h2 className="course-title">{gameName}</h2>
            <h3 className="game-question">What is the correct spelling?</h3>
            <div className="game-block">
                {/* Game block left empty */}
            </div>
            </main>
        </div>
        </div>
    );
    };

export default GameInterface;
