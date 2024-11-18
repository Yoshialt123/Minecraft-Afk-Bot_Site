import express from 'express';
import { startBot, stopBot, getBotStatus } from './bots/botManager.js';
import path from 'path';

const app = express();
const PORT = 3000;

// Middleware for parsing JSON
app.use(express.json());

// Serve static files (index.html, style.css, sessions.html)
const __dirname = path.resolve();
app.use(express.static(__dirname));

// API routes for bot management
app.post('/start-bot', (req, res) => {
    const { serverName, serverIP, serverPort, username, offline } = req.body;
    const result = startBot(serverName, serverIP, parseInt(serverPort), username, offline);
    res.json(result);
});

app.post('/stop-bot', (req, res) => {
    const { serverName } = req.body;
    const result = stopBot(serverName);
    res.json(result);
});

app.get('/bot-status', (req, res) => {
    const status = getBotStatus();
    res.json(status);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
