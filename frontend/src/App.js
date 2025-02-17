import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import LogInPage from './pages/LogInPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import CourseSummaryPage from './pages/CourseSummaryPage';
import Navbar from './components/Navbar';
import StudentDashboardPage from './pages/StudentDashboardPage';
import CourseSummaryStudentPage from './pages/CourseSummaryStudentPage';
import StudentProfilePage from './pages/StudentProfilePage';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LogInPage />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboardPage />} />
            <Route path="/course-summary" element={<CourseSummaryPage />} />
            <Route path="/student-dashboard" element={<StudentDashboardPage />} />
            <Route path="/course-summary-student" element={<CourseSummaryStudentPage />} />
            <Route path="/student-profile" element={<StudentProfilePage />} />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
