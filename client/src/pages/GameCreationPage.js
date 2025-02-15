import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactSession } from "react-client-session";
import "./GameCreationPage.css";

const GameCreationPage = () => {
  const navigate = useNavigate();


  useEffect(() => {
    const user = ReactSession.get('user');
    console.log("User is:", user);
    if (!user) {
      alert("Please log in first");
      navigate('/'); 
    }
  }, [navigate]);
  const [gameName, setGameName] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [deadline, setDeadline] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


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
    setDropdownOpen((prev) => !prev);
  };

  const handleClassSelection = (className) => {
    if (!selectedClasses.includes(className)) {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  const handleRemoveClass = (className) => {
    setSelectedClasses(selectedClasses.filter((cls) => cls !== className));
  };

  const filteredClasses = classes.filter((cls) =>
    cls.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="background">
      <div className="game-container">
        <h1 className="game-creation-title">Create a new game!</h1>
        <div className="content-section">
          
          {/* File Upload Section */}
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

          {/* Game & Class Selection Section */}
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
                      <div
                        key={index}
                        className="dropdown-item"
                        onClick={() => handleClassSelection(cls)}
                      >
                        {cls}
                      </div>
                    ))
                  ) : (
                    <p>No classes found</p>
                  )}
                </div>
              )}
            </div>

            

       
            <div className="selected-classes-container">
              {selectedClasses.map((cls, index) => (
                <div key={index} className="selected-class-box">
                  <button
                    className="remove-class-btn"
                    onClick={() => handleRemoveClass(cls)}
                  >
                    ✖
                  </button>
                  {cls}
                </div>
              ))}
            </div>

            
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
