const bedrock = require('bedrock-protocol');
const { fetchChatGPTResponse } = require('./scripts/chatgpt');

const bots = {};

function startBot(serverName, serverIP, serverPort, username, offline) {
    if (bots[serverName]) {
        console.log(`Bot for server ${serverName} is already running.`);
        return;
    }

    const bot = bedrock.createClient({
        host: serverIP,
        port: parseInt(serverPort),
        username: username || `Bot${Math.floor(Math.random() * 1000)}`,
        offline,
    });

    bot.on('connect', () => {
        console.log(`${username} connected to ${serverName}`);
        bots[serverName].connected = true;
    });

    bot.on('disconnect', () => {
        console.log(`${username} disconnected from ${serverName}`);
        bots[serverName].connected = false;
    });

    bot.on('text', async (packet) => {
        const message = packet.message.trim();

        if (message.startsWith('$')) {
            const query = message.slice(1).trim();
            console.log(`Received command: ${query}`);

            // Fetch response from ChatGPT API
            const reply = await fetchChatGPTResponse(query);
            bot.queue('text', {
                type: 'chat',
                needs_translation: false,
                source_name: bot.options.username,
                xuid: '',
                platform_chat_id: '',
                filtered_message: '',
                message: `${packet.source_name}, ChatGPT says: ${reply}`,
            });
        }
    });

    bots[serverName] = { serverIP, serverPort, username, bot, connected: false };
}

function stopBot(serverName) {
    if (bots[serverName]) {
        bots[serverName].bot.end();
        delete bots[serverName];
        console.log(`Bot for server ${serverName} stopped.`);
    }
}

function getBotStatus() {
    return Object.entries(bots).map(([serverName, bot]) => ({
        serverName,
        serverIP: bot.serverIP,
        serverPort: bot.serverPort,
        username: bot.username,
        connected: bot.connected,
    }));
}

module.exports = { startBot, stopBot, getBotStatus };
