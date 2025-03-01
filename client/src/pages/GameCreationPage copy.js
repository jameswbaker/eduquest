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
        
      <iframe
      src="/html/flappy.html"
      width="700"
      height="600"
      frameBorder="0"
      title="Flappy Game"
      scrolling="no"              
      style={{ overflow: "hidden" }}  
/>


        
      </div>
    </div>
  );
};

export default GameCreationPage;
