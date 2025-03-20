const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Special handling for /html directory - serve files directly
app.get('/html/*', (req, res) => {
  const filePath = path.join(__dirname, 'build', req.path);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  } else {
    // If file doesn't exist, look for index.html in that directory
    const dirPath = path.dirname(filePath);
    const indexPath = path.join(dirPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    
    // If no index.html, return 404
    return res.status(404).send('File not found');
  }
});

// For all other routes, serve index.html (SPA behavior)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 