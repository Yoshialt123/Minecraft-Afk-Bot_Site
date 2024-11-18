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
  const { serverName, serverIP, serverPort, password, offlineMode } = req.body;

  if (activeBots[serverName]) {
    return res.status(400).json({ message: `Bot for server ${serverName} is already active.` });
  }

  const bot = createClient({
    host: serverIP,
    port: parseInt(serverPort),
    offline: true, // This enables cracked mode
    username: `${botConfig.defaultUsernamePrefix}${Math.floor(Math.random() * 10000)}`,
  });

  bot.on('join', () => {
    console.log(`Bot connected to server: ${serverName}`);
    activeBots[serverName].connected = true;
  });

  bot.on('end', () => {
    console.log(`Bot disconnected from server: ${serverName}`);
    delete activeBots[serverName];
  });

  bot.on('error', (err) => {
    console.error(err);
  });

  activeBots[serverName] = { bot, serverIP, serverPort, offlineMode, connected: false };
  res.json({ message: `Bot started for server: ${serverName}` });
});

app.post('/stop-bot', (req, res) => {
  const { serverName } = req.body;

  if (!activeBots[serverName]) {
    return res.status(400).json({ message: `No active bot for server: ${serverName}` });
  }

  activeBots[serverName].bot.close();
  delete activeBots[serverName];
  res.json({ message: `Bot stopped for server: ${serverName}` });
});

app.get('/status', (req, res) => {
  const status = Object.entries(activeBots).map(([serverName, botData]) => ({
    serverName,
    serverIP: botData.serverIP,
    serverPort: botData.serverPort,
    connected: botData.connected,
    offlineMode: botData.offlineMode,
  }));

  res.json(status);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
