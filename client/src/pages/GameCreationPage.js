import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GameCreationPage.css";

const GameCreationPage = () => {
  const [gameName, setGameName] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [deadline, setDeadline] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    if (!gameName) {
      alert("Game name is required!");
      return;
    }
    alert(`Game "${gameName}" created!`);
    navigate(`/startGame/${gameName}`);
  };

  const toggleDropdown = () => {
    console.log('clicked');
    setDropdownOpen((prev) => !prev);
    console.log('this is drop down: ', dropdownOpen);
    console.log('classes: ', classes);
  };

  const handleClassSelection = (className) => {
    setSelectedClasses((prev) =>
      prev.includes(className)
        ? prev.filter((cls) => cls !== className)
        : [...prev, className]
    );
  };

  const filteredClasses = classes.filter((cls) =>
    cls.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="background">
    <div className="game-container">
      <h1 className="game-creation-title">Create a new game!</h1>
      <div className="content-section">
        <div className="upload-section">
          <div
            className="drag-drop-box"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <p>Drag learning materials here</p>
          </div>
          <input
            type="file"
            id="fileUpload"
            multiple
            onChange={handleFileUpload}
            hidden
          />
          <label htmlFor="fileUpload" className="choose-file-btn">
            Choose File
          </label>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-bar">
              <div
                style={{ width: `${uploadProgress}%` }}
                className="progress"
              ></div>
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
            <button onClick={toggleDropdown} className="dropbtn">
              Select Classes
            </button>
            {dropdownOpen && (
              <div className="dropdown-content">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="dropdown-search"
                />
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((cls, index) => (
                    <label key={index} className="dropdown-item">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(cls)}
                        onChange={() => handleClassSelection(cls)}
                      />
                      {cls}
                    </label>
                  ))
                ) : (
                  <p>No classes found</p>
                )}
              </div>
            )}
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
        Create Game!
      </button>
    </div>
    </div>
  );
};

export default GameCreationPage;
