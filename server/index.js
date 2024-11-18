import express from 'express';
import path from 'path';

const app = express();

// Serve the index.html file when accessing the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the sessions.html file for /sessions route
app.get('/sessions', (req, res) => {
    res.sendFile(path.join(__dirname, 'sessions.html'));
});

// Serve the CSS file for the style
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
