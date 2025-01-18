import React from 'react';
import { useNavigate } from "react-router-dom";
import './IntroSignIn.css';
import SearchBar from '../components/SearchBar';

const IntroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="intro-signin-container">
      <h1>Ready to go on a quest today?</h1>
      <p>Unlock Your Potential: Improve your reading with exciting games today!</p>
      <img src="/image/coverPhoto.png" alt="Banner" className="header-image" />
      
      {/* Buttons for Sign In and Sign Up */}
      <div className="button-container">
        <button className="buttons-intro" onClick={() => navigate("/signIn")}>
          Sign In Here
        </button>
        <button className="buttons-intro" onClick={() => navigate("/signUp")}>
          Sign Up Here
        </button>
      </div>
    </div>
  );
};

export default IntroPage;
