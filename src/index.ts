import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { config } from './config.js';
import { handleJarvisMessage } from './services/jarvis.js';

if (!config.discord.token) {
  throw new Error('DISCORD_BOT_TOKEN is missing from .env');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.once('ready', () => {
  console.log(`Jarvis is online as ${client.user?.tag}`);
  client.user?.setPresence({
    status: 'online',
    activities: [{ name: 'say jarvis', type: 0 }],
  });
});

client.on('messageCreate', async (message) => {
  try {
    await handleJarvisMessage(message);
  } catch (error) {
    console.error('[Jarvis] Message handler failed:', error);
  }
});

client.login(config.discord.token).catch((error) => {
  console.error('Failed to log in to Discord:', error);
  process.exitCode = 1;
});
