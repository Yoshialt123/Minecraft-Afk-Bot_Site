import express from 'express';
import path from 'path';
import { startBot, stopBot, activeBots } from './bots/botManager.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static('../'));

// API endpoint to start a bot
app.post('/start-bot', (req, res) => {
  const { serverName, serverIP, serverPort, username, offline } = req.body;
  try {
    startBot(serverName, serverIP, serverPort, username, offline);
    res.json({ success: true, message: `Bot for ${serverName} started.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API endpoint to stop a bot
app.post('/stop-bot', (req, res) => {
  const { serverName } = req.body;
  try {
    stopBot(serverName);
    res.json({ success: true, message: `Bot for ${serverName} stopped.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API endpoint to list active sessions
app.get('/active-sessions', (req, res) => {
  const sessions = Object.keys(activeBots).map((name) => ({
    serverName: name,
    username: activeBots[name].options.username,
  }));
  res.json(sessions);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
