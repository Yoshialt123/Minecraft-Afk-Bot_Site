import bedrock from 'bedrock-protocol';
import { chatWithGPT } from './scripts/chatgpt.js';

const activeBots = {};
const PREFIX = '$'; // Prefix for bot commands

function startBot(serverName, serverIP, serverPort, username, offline) {
    if (activeBots[serverName]) {
        console.log(`Bot for ${serverName} is already active.`);
        return { error: `Bot for ${serverName} is already active.` };
    }

    console.log(`Starting bot for ${serverName}...`);

    const bot = bedrock.createClient({
        host: serverIP,
        port: serverPort,
        username: username || `Bot${Math.floor(Math.random() * 1000)}`,
        offline: offline || false,
    });

    activeBots[serverName] = {
        bot,
        serverIP,
        serverPort,
        username,
        offline,
        connected: false,
    };

    bot.on('join', () => {
        console.log(`Bot connected to ${serverName}`);
        activeBots[serverName].connected = true;
    });

    bot.on('disconnect', (reason) => {
        console.error(`Bot disconnected from ${serverName}:`, reason);
        activeBots[serverName].connected = false;
    });

    bot.on('error', (error) => {
        console.error(`Error on bot for ${serverName}:`, error.message);
    });

    bot.on('text', async (packet) => {
        try {
            if (!packet.message.startsWith(PREFIX)) return;

            const command = packet.message.slice(PREFIX.length).trim();

            if (command.toLowerCase().startsWith('gpt ')) {
                const userMessage = command.slice(4);
                const reply = await chatWithGPT(userMessage);

                bot.queue('text', {
                    type: 'chat',
                    needs_translation: false,
                    source_name: bot.options.username,
                    xuid: '',
                    platform_chat_id: '',
                    filtered_message: '',
                    message: reply,
                });
            } else {
                bot.queue('text', {
                    type: 'chat',
                    needs_translation: false,
                    source_name: bot.options.username,
                    xuid: '',
                    platform_chat_id: '',
                    filtered_message: '',
                    message: `Unknown command: ${command}`,
                });
            }
        } catch (err) {
            console.error('Error processing command:', err.message);
            bot.queue('text', {
                type: 'chat',
                needs_translation: false,
                source_name: bot.options.username,
                xuid: '',
                platform_chat_id: '',
                filtered_message: '',
                message: 'An error occurred. Try again later.',
            });
        }
    });

    return { success: `Bot for ${serverName} started.` };
}

function stopBot(serverName) {
    const botData = activeBots[serverName];
    if (!botData) {
        return { error: `No active bot for ${serverName}` };
    }

    botData.bot.disconnect();
    delete activeBots[serverName];
    console.log(`Bot for ${serverName} stopped.`);
    return { success: `Bot for ${serverName} stopped.` };
}

function getBotStatus() {
    return Object.keys(activeBots).map((serverName) => ({
        serverName,
        connected: activeBots[serverName].connected,
    }));
}

export { startBot, stopBot, getBotStatus };
