import { BrowserRouter, Routes, Route,useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import LoginPage from './pages/Login';

import SignUpPage from './pages/Signup';
import LogoutPage from './pages/Logout';
import IntroPage from './pages/Intro';
import DashboardPage from './pages/Dashboard';
import TeacherBoardPage from './pages/DashboardT';
import ProfilePage from './pages/Profile';
import DataDashboard from './pages/DataDashboard';
import GamePage from './pages/GameInterface';
import StartPage from './pages/StartPage';
import IntroSignInPage from './pages/IntroSignIn';
import LinkCanvasPage from './pages/linkCanvas'
import GameCreationPage from './pages/GameCreationPage';
import CourseDashboardPage from './pages/CourseDashboard';
import ProfileTPage from './pages/ProfileT';
import IntroTPage from './pages/IntroT';




import './App.css';

export const theme = createTheme({
  palette: {
    mode: 'light', 
    primary: {
      main: '#fffff', 
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#ffffff',  
      paper: '#ffffff',   
    },
    text: {
      primary: '#000000',
      secondary: '#000000',
    },
  },
  typography: {
    fontFamily: '"Hammersmith One", "Hanken Grotesk", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
  },
});



function AppContent() {
  const location = useLocation();
  const hiddenPaths = ["/login", "/signUp", "/"];
  const showNavBar = !hiddenPaths.includes(location.pathname);

  return (
    <>

      {showNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<IntroSignInPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/introSignIn" element={<IntroSignInPage />} />
      
          <Route path="/intro" element={<IntroPage />} />
          <Route path="/introT" element={<IntroTPage />} />

          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/dashboard/:studentId" element={<DashboardPage />} />
          <Route path="/teacherBoard" element={<TeacherBoardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profileT" element={<ProfileTPage />} />
          <Route path="/dataDashboard/:courseId" element={<DataDashboard />} />
          {/* <Route path="/game" element={<GamePage />} /> */}
          <Route path="/game/:gameName" element={<GamePage />} />
          <Route path="/startGame/:gameName" element={<StartPage />} />
          <Route path="/linkCanvas" element={<LinkCanvasPage />} />
          <Route path="/createGame" element={<GameCreationPage />} />
          <Route path="/courseDashboard/:courseId" element={<CourseDashboardPage />} />
     
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
  
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}