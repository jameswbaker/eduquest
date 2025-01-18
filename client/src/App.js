import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { teal, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import LoginPage from './pages/Login';
import AirbnbPage from './pages/Airbnb'
import HousingPage from './pages/Housing'
import HospitalPage from './pages/hospitals'
import NearbyPage from './pages/Nearby_Hos_Crime'
import SignUpPage from './pages/Signup';
import LogoutPage from './pages/Logout';
import IntroPage from './pages/Intro';
import DashboardPage from './pages/Dashboard';
import ProfilePage from './pages/Profile';
import TeacherDashboardPage from './pages/TDashboard';
import GamePage from './pages/GameInterface';
import StartPage from './pages/StartPage';
import GameCreationPage from './pages/GameCreationPage';

import './App.css';

export const theme = createTheme({
  palette: {
    primary: teal,
    secondary: amber,
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/intro" element={<IntroPage />} />
          <Route path="/airbnb" element={<AirbnbPage />} />
          <Route path="/housing" element={<HousingPage />} />
          <Route path="/hospitals" element={<HospitalPage />} />
          <Route path="/nearby" element={<NearbyPage />} />
          <Route path="/renderSignup" element={<SignUpPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/teacherDashboard" element={<TeacherDashboardPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/startGame" element={<StartPage />} />
          <Route path="/createGame" element={<GameCreationPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}