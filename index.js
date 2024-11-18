const express = require("express");
const bodyParser = require("body-parser");
const bedrock = require("bedrock-protocol");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

const activeBots = {}; // Track bot sessions

// Helper to save bot state to bots.json
function saveBots() {
  fs.writeFileSync("./bots/bots.json", JSON.stringify(activeBots, null, 2));
}

// Load bots from file on server start
function loadBots() {
  if (fs.existsSync("./bots/bots.json")) {
    const loadedBots = JSON.parse(fs.readFileSync("./bots/bots.json", "utf-8"));

    // Restore bot connections
    for (const [serverName, botData] of Object.entries(loadedBots)) {
      createAndTrackBot(serverName, botData.serverIP, botData.serverPort, botData.password, botData.offlineMode);
    }
  }
}

// Create and manage a bot connection
function createAndTrackBot(serverName, serverIP, serverPort, password, offlineMode = true) {
  console.log(`Starting bot for ${serverName} at ${serverIP}:${serverPort}`);

  const bot = bedrock.createClient({
    host: serverIP,
    port: parseInt(serverPort),
    username: "AFK_Bot", // Customize as needed
    offline: true, // Enable offline mode for cracked servers
  });

  activeBots[serverName] = {
    bot,
    serverIP,
    serverPort,
    password,
    offlineMode,
    connected: false,
  };

  // Bot event listeners
  bot.on("spawn", () => {
    console.log(`Bot connected to ${serverName}`);
    activeBots[serverName].connected = true;
    saveBots();
  });

  bot.on("end", () => {
    console.log(`Bot disconnected from ${serverName}`);
    activeBots[serverName].connected = false;

    // Automatically reconnect the bot
    setTimeout(() => {
      if (!activeBots[serverName]) return; // Bot manually stopped
      console.log(`Reconnecting bot for ${serverName}`);
      createAndTrackBot(serverName, serverIP, serverPort, password, offlineMode);
    }, 5000); // Reconnect after 5 seconds
    saveBots();
  });

  bot.on("error", (err) => {
    console.error(`Error for bot on ${serverName}:`, err);
    activeBots[serverName].connected = false;
    saveBots();
  });

  return bot;
}

// Start a bot
app.post("/start-bot", (req, res) => {
  const { serverName, serverIP, serverPort, password, offlineMode } = req.body;

  if (activeBots[serverName]) {
    return res.status(400).json({ error: "Bot is already active for this server." });
  }

  createAndTrackBot(serverName, serverIP, serverPort, password, offlineMode === "true");
  res.json({ message: "Bot started successfully." });
});

// Stop a bot
app.post("/stop-bot", (req, res) => {
  const { serverName, password } = req.body;

  if (!activeBots[serverName]) {
    return res.status(404).json({ error: "Bot not found for this server." });
  }

  if (activeBots[serverName].password !== password) {
    return res.status(403).json({ error: "Incorrect password." });
  }

  activeBots[serverName].bot.end();
  delete activeBots[serverName];
  saveBots();

  res.json({ message: "Bot stopped successfully." });
});

// Get active bot statuses
app.get("/status", (req, res) => {
  const botStatus = Object.entries(activeBots).map(([serverName, botData]) => ({
    serverName,
    connected: botData.connected,
  }));
  res.json(botStatus);
});

// Ensure bots directory exists
if (!fs.existsSync("./bots")) {
  fs.mkdirSync("./bots");
}

// Load saved bots on server start
loadBots();

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log("==> Your service is live 🎉");
});
