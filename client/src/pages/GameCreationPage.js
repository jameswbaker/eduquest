// GameCreationPage.jsx
import React, { useState } from "react";
import "./GameCreationPage.css";
// import DropDown from "../components/DropDown";
import DropDown from "./DropDown";

const GameCreationPage = () => {
  const [gameName, setGameName] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [deadline, setDeadline] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const classes = ["English 1", "English Literature", "Math 101", "Science"];

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles([...uploadedFiles, ...files]);
    setUploadProgress(50);

    setTimeout(() => {
      setUploadProgress(100);
    }, 1000);
  };

  const handleClassSelection = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedClasses([...selectedClasses, value]);
    } else {
      setSelectedClasses(selectedClasses.filter((cls) => cls !== value));
    }
  };

  // handle drag drop
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
          <div className="dropdown">
            <button className="dropdown-btn">Assign game to class</button>
            {/* <DropDown classes={classes} /> */}
{/*             
            <div className="dropdown-content">
              {classes.map((cls, index) => (
                <label key={index}>
                  <input
                    type="checkbox"
                    value={cls}
                    onChange={handleClassSelection}
                  />
                  {cls}
                </label>
              ))}
            </div> */}
            
          </div>
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