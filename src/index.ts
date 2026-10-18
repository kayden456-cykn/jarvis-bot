import {
  Client,
  GatewayIntentBits,
  Partials,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { config } from './config.js';
import { handleJarvisMessage } from './services/jarvis.js';

if (!config.discord.token) {
  throw new Error('DISCORD_BOT_TOKEN is missing from .env');
}
if (!config.discord.clientId) {
  throw new Error('DISCORD_CLIENT_ID is missing from .env');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

const lyricsCommand = new SlashCommandBuilder()
  .setName('lyrics')
  .setDescription('Find a song and open its lyrics page')
  .addStringOption((option) =>
    option
      .setName('query')
      .setDescription('Song title and/or artist')
      .setRequired(true)
      .setMaxLength(100),
  );

async function registerCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(config.discord.token);
  await rest.put(Routes.applicationCommands(config.discord.clientId), {
    body: [lyricsCommand.toJSON()],
  });
  console.log('Registered /lyrics command');
}

async function handleLyricsCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const query = interaction.options.getString('query', true).trim();
  await interaction.deferReply();

  try {
    const url = new URL('https://itunes.apple.com/search');
    url.searchParams.set('term', query);
    url.searchParams.set('entity', 'song');
    url.searchParams.set('limit', '1');

    const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!response.ok) throw new Error(`Song search returned HTTP ${response.status}`);

    const data = await response.json() as {
      results?: Array<{
        trackName?: string;
        artistName?: string;
        collectionName?: string;
        trackViewUrl?: string;
        artworkUrl100?: string;
      }>;
    };
    const track = data.results?.[0];

    if (!track?.trackName || !track.artistName) {
      await interaction.editReply(`couldn't find a song for "${query}" twin try the title and artist`);
      return;
    }

    const lyricsUrl = new URL('https://genius.com/search');
    lyricsUrl.searchParams.set('q', `${track.trackName} ${track.artistName}`);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(track.trackName)
      .setURL(lyricsUrl.toString())
      .setDescription(`**Artist:** ${track.artistName}${track.collectionName ? `\n**Album:** ${track.collectionName}` : ''}\n\n[Open lyrics on Genius](${lyricsUrl.toString()})`)
      .setFooter({ text: 'Jarvis • lyrics link' });

    if (track.artworkUrl100) embed.setThumbnail(track.artworkUrl100);
    if (track.trackViewUrl) embed.addFields({ name: 'Listen', value: `[Open song on Apple Music](${track.trackViewUrl})` });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('[Jarvis] Lyrics search failed:', error);
    await interaction.editReply('lyrics search is tweaking rn bro try again in a bit');
  }
}

client.once('ready', () => {
  console.log(`Jarvis is online as ${client.user?.tag}`);
  client.user?.setPresence({
    status: 'online',
    activities: [{ name: 'say jarvis', type: 0 }],
  });

  void registerCommands().catch((error) => {
    console.error('[Jarvis] Failed to register slash commands:', error);
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'lyrics') {
    await handleLyricsCommand(interaction);
  }
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
