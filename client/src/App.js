import { BrowserRouter, Routes, Route,useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { teal, amber} from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import LoginPage from './pages/Login';
import AirbnbPage from './pages/Airbnb'
import HousingPage from './pages/Housing'
import HospitalPage from './pages/hospitals'
import NearbyPage from './pages/Nearby_Hos_Crime'
import SignUpPage from './pages/SignUp';
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
  const hiddenPaths = ["/signIn", "/signUp", "/"];
  const showNavBar = !hiddenPaths.includes(location.pathname);

  return (
    <>

      {showNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<IntroSignInPage />} />
        <Route path="/signIn" element={<LoginPage />} />
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/introSignIn" element={<IntroSignInPage />} />
        <Route path="/airbnb" element={<AirbnbPage />} />
        <Route path="/housing" element={<HousingPage />} />
        <Route path="/hospitals" element={<HospitalPage />} />
        <Route path="/nearby" element={<NearbyPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/dashboard/:studentId" element={<DashboardPage />} />
        <Route path="/teacherBoard" element={<TeacherBoardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dataDashboard/:courseId" element={<DataDashboard />} />
        {/* <Route path="/game" element={<GamePage />} /> */}
        <Route path="/game/:gameName" element={<GamePage />} />
        <Route path="/startGame/:gameName" element={<StartPage />} />
        <Route path="/linkCanvas" element={<LinkCanvasPage />} />
        <Route path="/createGame" element={<GameCreationPage />} />


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