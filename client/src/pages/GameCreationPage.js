import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GameCreationPage.css";

const GameCreationPage = () => {
  const [gameName, setGameName] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [deadline, setDeadline] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const classes = ["English 1", "English Literature", "Math 101", "Science"];

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles([...uploadedFiles, ...files]);
    setUploadProgress(50);

    setTimeout(() => {
      setUploadProgress(100);
    }, 1000);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles([...uploadedFiles, ...files]);
    setUploadProgress(50);

    setTimeout(() => {
      setUploadProgress(100);
    }, 1000);
  };

  const handleGameCreation = () => {
    alert(`Game "${gameName}" created!`);
    navigate(`/startGame/${gameName}`);
    // navigate(`/game?name=${encodeURIComponent(gameName)}`);
  };

  return (
    <div className="game-container">
      <h1 className="game-header">Create a new game!</h1>
      <div className="content-section">
        <div className="upload-section">
          <div
            className="drag-drop-box"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <p>drag learning materials here</p>
          </div>
          <input type="file" id="fileUpload" multiple onChange={handleFileUpload} hidden />
          <label htmlFor="fileUpload" className="choose-file-btn">choose file</label>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-bar">
              <div style={{ width: `${uploadProgress}%` }} className="progress"></div>
            </div>
          )}
          {uploadProgress === 100 && (
            <div className="uploaded-files">
              {uploadedFiles.map((file, index) => (
                <p key={index}>📄 {file.name}</p>
              ))}
            </div>
          )}
        </div>
        <div className="input-section">
          <input
            type="text"
            placeholder="Game name*"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="input-field"
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="input-field"
          />
        </div>
      </div>
      <button className="create-game-btn" onClick={handleGameCreation}>
        create game!
      </button>
    </div>
  );
};

export default GameCreationPage;
