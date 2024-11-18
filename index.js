const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('minecraft-protocol');
const app = express();

const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Data store
const bots = {}; // Tracks active bots with server name as the key
const botPasswords = {}; // Stores passwords for user control of bots

// Create a bot
function createBot(serverName, serverIP, serverPort, password) {
    const bot = createClient({
        host: serverIP,
        port: serverPort,
        username: `AFK_Bot_${Math.floor(Math.random() * 1000)}`, // Random username for cracked servers
        version: false,
        offline: true, // Set to true for cracked servers
    });

    bots[serverName] = bot;
    botPasswords[serverName] = password;

    bot.on('end', () => {
        console.log(`Bot disconnected from ${serverName}. Reconnecting in 5 seconds...`);
        setTimeout(() => createBot(serverName, serverIP, serverPort, password), 5000); // Reconnect
    });

    bot.on('error', (err) => {
        console.error(`Error in bot for ${serverName}:`, err.message);
    });

    console.log(`Bot connected to ${serverName}`);
}

// Start a bot
app.post('/start-bot', (req, res) => {
    const { serverName, serverIP, serverPort, password } = req.body;

    if (!serverName || !serverIP || !serverPort || !password) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    if (bots[serverName]) {
        return res.status(400).json({ error: 'A bot is already running for this server!' });
    }

    createBot(serverName, serverIP, parseInt(serverPort), password);
    res.json({ message: `Bot started for server ${serverName}` });
});

// Stop a bot
app.post('/stop-bot', (req, res) => {
    const { serverName, password } = req.body;

    if (!serverName || !password) {
        return res.status(400).json({ error: 'Server name and password are required!' });
    }

    const bot = bots[serverName];
    const storedPassword = botPasswords[serverName];

    if (!bot) {
        return res.status(404).json({ error: 'No bot found for this server!' });
    }

    if (storedPassword !== password) {
        return res.status(403).json({ error: 'Invalid password!' });
    }

    bot.end('Bot stopped by user.');
    delete bots[serverName];
    delete botPasswords[serverName];
    res.json({ message: `Bot stopped for server ${serverName}` });
});

// Get bot status
app.get('/status', (req, res) => {
    const status = Object.keys(bots).map((serverName) => ({
        serverName,
        connected: bots[serverName] && !bots[serverName].ended,
    }));

    res.json(status);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
