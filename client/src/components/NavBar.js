import { AppBar, Container, Toolbar, Typography, Box } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { ReactSession } from 'react-client-session';
import eduquestLogo from '../img/eduquest_logo.svg'; // Import the logo

const NavText = ({ href, text, isMain }) => {
  return (
    <Typography
      variant={isMain ? 'h7' : 'h7'}
      noWrap
      style={{
        marginRight: '75px',
        fontFamily: 'Hammersmith One',
        fontWeight: 700,
        letterSpacing: '.3rem',
      }}
    >
      <NavLink
        to={href}
        style={{
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        {text}
      </NavLink>
    </Typography>
  );
};

export default function NavBar() {
  const enrollmentType = ReactSession.get("enrollmentType");
  console.log(enrollmentType);
  const dashboardRoute =
    enrollmentType === "StudentEnrollment" ? "/dashboard/:studentId" : "/teacherBoard";

  const profileRoute =
    enrollmentType === "StudentEnrollment" ? "/profile" : "/profileT";

  const introRoute =
    enrollmentType === "StudentEnrollment" ? "/intro" : "/introT";

  const gamifyRoute =
    enrollmentType === "StudentEnrollment" ? "/studentGameBoard/:studentId" : "/teacherGameBoard";

  return (
    <AppBar 
      position="static" 
      sx={{ 
        borderBottom: '3px solid black', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Box sx={{ mr: 2 }}>
            <img 
              src={eduquestLogo} 
              alt="EduQuest Logo" 
              style={{ height: '80px',  display: 'block' }} // Adjust height as needed
            />
          </Box>
          
          <NavText href={introRoute} text="Eduquest" isMain />
          <NavText href={dashboardRoute} text="Dashboard" />
          <NavText href={gamifyRoute} text="Gamify" />
          <NavText href={profileRoute} text="Profile" />
          <NavText href="/logout" text="Logout" />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
