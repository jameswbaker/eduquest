import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBar() {
  return (
    <div style={{ margin: '20px', display: 'flex', justifyContent: 'center' }}>
      <TextField
        variant="outlined"
        placeholder="Search for a subject/tutor..."
        style={{
          width: '80%', // Adjust the width
          border: '2px solid #000', // Add a border
          borderRadius: '10px', // Optional: Make the corners slightly rounded
          backgroundColor: 'white', // Set background color to white
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        // Fix hover effect for border radius
        sx={{
          '&:hover': {
            borderColor: '#3f51b5', // Change border color on hover
            borderRadius: '10px', // Ensure border radius stays on hover
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px', // Keep border radius consistent
          },
        }}
      />
    </div>
  );
}
