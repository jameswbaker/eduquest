import React from 'react';
import { useNavigate } from "react-router-dom";
import './linkCanvas.css';

function LinkCanvas() {
  const navigate = useNavigate();

  const handleCanvasLink = () => {
    // Replace this URL with your actual Canvas authentication endpoint
    const canvasAuthUrl = "https://canvas.instructure.com/login/canvas";
    
    // Open Canvas login in a new tab
    window.open(canvasAuthUrl, "_blank", "noopener,noreferrer");

    // After linking, redirect to dashboard or next step
    setTimeout(() => {
      navigate('/dashboard'); // Redirect user after linking
    }, 3000); // Wait 3 seconds before redirecting
  };

  return (
    <div className="link-canvas-container">
      <h1>You're all set with your account information!</h1>
      <p>Now, the last step is to link your Canvas account.</p>
      <button onClick={handleCanvasLink} className="link-canvas-button">
        Link Canvas Account
      </button>
    </div>
  );
}

export default LinkCanvas;
