const express = require('express');
const { createClient } = require('bedrock-protocol');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const botConfig = JSON.parse(fs.readFileSync('./bot.json', 'utf8'));
const activeBots = {};

app.post('/start-bot', (req, res) => {
  const { serverName, serverIP, serverPort, password } = req.body;
  const offlineMode = botConfig.offlineMode;

  if (activeBots[serverName]) {
    return res.status(400).json({ message: `Bot for server ${serverName} is already active.` });
  }

  const bot = createClient({
    host: serverIP,
    port: parseInt(serverPort),
    username: `${botConfig.defaultUsernamePrefix}${Math.floor(Math.random() * 10000)}`,
    offline: true
  });

  bot.on('login', () => {
    console.log(`Bot connected to server: ${serverName}`);
  });

  bot.on('end', () => {
    console.log(`Bot disconnected from server: ${serverName}`);
  });

  bot.on('error', (err) => {
    console.error(err);
  });

  activeBots[serverName] = { bot, serverIP, serverPort, connected: true };
  res.json({ message: `Bot started for server: ${serverName}` });
});

app.post('/stop-bot', (req, res) => {
  const { serverName } = req.body;

  if (!activeBots[serverName]) {
    return res.status(400).json({ message: `No active bot for server: ${serverName}` });
  }

  activeBots[serverName].bot.end();
  delete activeBots[serverName];
  res.json({ message: `Bot stopped for server: ${serverName}` });
});

app.get('/status', (req, res) => {
  const status = Object.entries(activeBots).map(([serverName, botData]) => ({
    serverName,
    serverIP: botData.serverIP,
    serverPort: botData.serverPort,
    connected: botData.bot.isConnected
  }));

  res.json(status);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
