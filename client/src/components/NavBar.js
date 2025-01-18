import { AppBar, Container, Toolbar, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

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
          <NavText href="/intro" text="Eduquest" isMain />
          <NavText href="/dashboard" text="Dashboard" />
          <NavText href="/createGame" text="Gamify" />
          <NavText href="/profile" text="Profile" />
          <NavText href="/logout" text="Logout" />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
