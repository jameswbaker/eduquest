import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import LogInPage from './pages/LogInPage';
import HomePage from './pages/HomePage';
import CourseSelectionPage from './pages/CourseSelectionPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LogInPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/select-course" element={<CourseSelectionPage />} />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
