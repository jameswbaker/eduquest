import React from 'react';
import { Card, Typography, CircularProgress, Box } from '@mui/material';

const CardComponent = ({ title, date, progress }) => {
  return (
    <Card
      sx={{
        width: 200,   // Fixed width
        height: 200,  // Fixed height
        margin: '10px',
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px', // Rounded corners
        border: '2px solid #E54B32', // Red border around the card
      }}
    >
      {/* Upper Container with Red Background (2/3 of the height) */}
      <Box sx={{ backgroundColor: '#E54B32', flex: 2, padding: '10px' }}>
        <Typography variant="h6" component="div" color="white">
          {title}
        </Typography>
      </Box>

      {/* Bottom Container with White Background (1/3 of the height) */}
      <Box sx={{ backgroundColor: 'white', flex: 1, padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Date Text */}
        <Typography variant="body2" color="text.secondary">
          {date}
        </Typography>
      </Box>

      {/* Progress Circle (Positioned at the border between the two containers) */}
      <Box
        sx={{
          position: 'absolute',
          top: '66%', // This places it at the border line between the red and white sections
          right: -20, // Adjusts it to the right side of the divider (shift as needed)
          padding: '10px',
        }}
      >
        <CircularProgress variant="determinate" value={progress} size={40} thickness={4} />
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
  );
};

export default CardComponent;
