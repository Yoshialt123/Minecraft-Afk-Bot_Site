import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));  // Accessing file from root folder
});

// Serve sessions.html
app.get('/sessions', (req, res) => {
    res.sendFile(path.join(__dirname, '../sessions.html'));  // Accessing file from root folder
});

// Serve style.css
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../style.css'));  // Accessing file from root folder
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
