const express = require('express');
const { startBot, stopBot, getBotStatus } = require('./bots/botManager');

const app = express();
app.use(express.json());

app.post('/start-bot', (req, res) => {
    const { serverName, serverIP, serverPort, username, password, offline } = req.body;
    startBot(serverName, serverIP, serverPort, username, offline === 'on');
    res.status(200).send('Bot started!');
});

app.post('/stop-bot', (req, res) => {
    const { serverName } = req.body;
    stopBot(serverName);
    res.status(200).send('Bot stopped!');
});

app.get('/status', (req, res) => {
    res.json(getBotStatus());
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
