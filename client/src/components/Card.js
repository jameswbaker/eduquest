import React from 'react';
import { Card, Typography, CircularProgress, Box } from '@mui/material';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const CardComponent = ({ title, date, progress, backgroundColor, link }) => {
  const progressSize = 60; // Set the size of the progress ring

  return (
    <Link to={link} style={{ textDecoration: 'none' }}> 
      <Card
        sx={{
          width: 200,  
          height: 200,  
          margin: '10px',
          boxShadow: 3,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '25px', 
          border: '3px solid #000', 
          position: 'relative',
          '&:hover': {
            transform: 'scale(1.05)', 
            transition: 'transform 0.3s ease-in-out', 
          },
        }}
      >
        <Box sx={{ backgroundColor: backgroundColor, flex: 2, padding: '20px' }}>
          <Typography variant="h6" component="div" color="white">
            {title}
          </Typography>
        </Box>

        <Box sx={{ backgroundColor: 'white', flex: 1, padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Date Text */}
          <Typography variant="body2" color="text.secondary">
            {date}
          </Typography>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            left: '80%', 
            transform: 'translateX(-50%) translateY(-50%)', 
            zIndex: 1, 
            width: progressSize, 
            height: progressSize, 
            borderRadius: '50%', 
            backgroundColor: 'white', 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress 
            variant="determinate" 
            value={progress} 
            size={progressSize}
            thickness={6} 
            sx={{ color: '#8FCE5D' }} 
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" component="div" color="text.secondary">
              {`${Math.round(progress)}%`}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Link>
  );
};

export default CardComponent;
