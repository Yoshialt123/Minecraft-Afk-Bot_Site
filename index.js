const express = require('express');
const { createClient } = require('minecraft-protocol');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

const bots = {}; // Store bots by server name or ID

// Create an AFK bot
function createBot(serverName, serverIP, serverPort) {
    if (bots[serverName]) {
        bots[serverName].end('Switching servers');
    }

    const bot = createClient({
        host: serverIP,
        port: serverPort,
        username: `AFK_Bot_${Math.floor(Math.random() * 1000)}`,
        version: false, // Autodetect version
        offline: true // Set false if using online servers with authentication
    });

    bots[serverName] = bot;

    bot.on('end', () => {
        console.log(`Bot disconnected from ${serverName}, attempting to rejoin...`);
        setTimeout(() => createBot(serverName, serverIP, serverPort), 5000); // Rejoin after 5 seconds
    });

    bot.on('error', (err) => {
        console.error(`Error in bot for ${serverName}:`, err.message);
    });

    bot.on('login', () => {
        console.log(`Bot logged into ${serverName}`);
    });

    return bot;
}

// API to manage bots
app.post('/start-bot', (req, res) => {
    const { serverName, serverIP, serverPort } = req.body;

    if (!serverName || !serverIP || !serverPort) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    createBot(serverName, serverIP, parseInt(serverPort));
    res.json({ message: `Bot started for server ${serverName}` });
});

app.get('/status', (req, res) => {
    const status = Object.keys(bots).map((serverName) => ({
        serverName,
        connected: !bots[serverName].ended,
    }));

    res.json(status);
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
