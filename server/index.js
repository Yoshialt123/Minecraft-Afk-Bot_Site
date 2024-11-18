import express from 'express';
import { startBot, stopBot, getBotStatus } from './bots/botManager.js';

const app = express();
app.use(express.json());

// Start a bot
app.post('/start-bot', (req, res) => {
    const { serverName, serverIP, serverPort, username, password, offline } = req.body;
    startBot(serverName, serverIP, serverPort, username, password, offline === 'on');
    res.status(200).send('Bot started!');
});

// Stop a bot
app.post('/stop-bot', (req, res) => {
    const { serverName } = req.body;
    stopBot(serverName);
    res.status(200).send('Bot stopped!');
});

// Get bot status
app.get('/status', (req, res) => {
    res.json(getBotStatus());
});

// Server listener
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
