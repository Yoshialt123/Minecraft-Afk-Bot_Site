import { Configuration, OpenAIApi } from 'openai';
import bedrock from 'bedrock-protocol';
import { Vec3 } from 'vec3';

const openai = new OpenAIApi(
  new Configuration({
    apiKey: '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', // Replace with your OpenAI API key
  })
);

const activeBots = {};

export function startBot(serverName, serverIP, serverPort, username, offline) {
  if (activeBots[serverName]) {
    console.log(`Bot for ${serverName} is already active.`);
    return;
  }

  const bot = bedrock.createClient({
    host: serverIP,
    port: serverPort,
    username: username || `Bot${Math.floor(Math.random() * 1000)}`,
    offline: offline,
  });

  activeBots[serverName] = bot;

  console.log(`Starting bot: ${username}`);

  // Listen for chat messages
  bot.on('text', async (packet) => {
    if (!packet || !packet.message) return;

    const message = packet.message.trim();

    // ChatGPT Command
    if (message.startsWith('!gpt')) {
      const userQuery = message.slice(5);
      try {
        const response = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: userQuery }],
        });

        const reply = response.data.choices[0].message.content;
        bot.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: bot.options.username,
          message: `ChatGPT: ${reply}`,
        });
      } catch (err) {
        console.error('ChatGPT error:', err);
        bot.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: bot.options.username,
          message: 'ChatGPT is unavailable right now.',
        });
      }
    }

    // Breaking a block
    if (message.startsWith('!break')) {
      const args = message.split(' ');
      if (args.length === 4) {
        const [x, y, z] = args.slice(1).map(Number);
        breakBlock(bot, new Vec3(x, y, z));
      } else {
        bot.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: bot.options.username,
          message: 'Usage: !break <x> <y> <z>',
        });
      }
    }

    // Placing a block
    if (message.startsWith('!place')) {
      const args = message.split(' ');
      if (args.length === 5) {
        const [x, y, z, blockType] = args.slice(1);
        placeBlock(bot, new Vec3(Number(x), Number(y), Number(z)), Number(blockType));
      } else {
        bot.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: bot.options.username,
          message: 'Usage: !place <x> <y> <z> <blockType>',
        });
      }
    }
  });

  // Handle disconnects
  bot.on('disconnect', (reason) => {
    console.log(`Bot for ${serverName} disconnected:`, reason);
    delete activeBots[serverName];
  });

  bot.on('error', (err) => {
    console.error('Bot error:', err);
  });
}

export function stopBot(serverName) {
  const bot = activeBots[serverName];
  if (bot) {
    bot.disconnect('Stopped by admin');
    delete activeBots[serverName];
    console.log(`Bot for ${serverName} stopped.`);
  }
}

// Break a block
function breakBlock(bot, position) {
  bot.queue('text', {
    type: 'chat',
    needs_translation: false,
    source_name: bot.options.username,
    message: `Breaking block at ${position.toString()}`,
  });
  bot.updateBlock(position);
  bot.dig(position);
}

// Place a block
function placeBlock(bot, position, materialType) {
  bot.queue('text', {
    type: 'chat',
    needs_translation: false,
    source_name: bot.options.username,
    message: `Placing block at ${position.toString()} with type ${materialType}`,
  });
  bot.setBlock(position, materialType);
}
