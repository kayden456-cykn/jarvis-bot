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
  .setDescription('Search for a song and fetch lyrics when available')
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

    const lyricsUrl = new URL('https://en.wikisource.org/w/api.php');
    lyricsUrl.searchParams.set('action', 'query');
    lyricsUrl.searchParams.set('list', 'search');
    lyricsUrl.searchParams.set('srsearch', `"${track.trackName}" lyrics`);
    lyricsUrl.searchParams.set('format', 'json');
    lyricsUrl.searchParams.set('srlimit', '1');
    lyricsUrl.searchParams.set('origin', '*');

    let lyricsText = '';
    let lyricsPageUrl = '';
    const wikiResponse = await fetch(lyricsUrl, {
      headers: { 'User-Agent': 'JarvisDiscordBot/1.0 (lyrics lookup)' },
      signal: AbortSignal.timeout(10_000),
    });
    if (wikiResponse.ok) {
      const wikiData = await wikiResponse.json() as {
        query?: { search?: Array<{ title?: string }> };
      };
      const pageTitle = wikiData.query?.search?.[0]?.title;
      if (pageTitle) {
        const extractUrl = new URL('https://en.wikisource.org/w/api.php');
        extractUrl.searchParams.set('action', 'query');
        extractUrl.searchParams.set('prop', 'extracts');
        extractUrl.searchParams.set('explaintext', '1');
        extractUrl.searchParams.set('exsectionformat', 'plain');
        extractUrl.searchParams.set('titles', pageTitle);
        extractUrl.searchParams.set('format', 'json');
        const extractResponse = await fetch(extractUrl, {
          headers: { 'User-Agent': 'JarvisDiscordBot/1.0 (lyrics lookup)' },
          signal: AbortSignal.timeout(10_000),
        });
        if (extractResponse.ok) {
          const extractData = await extractResponse.json() as {
            query?: { pages?: Record<string, { title?: string; extract?: string }> };
          };
          const page = Object.values(extractData.query?.pages ?? {})[0];
          if (page?.extract?.trim()) {
            lyricsText = page.extract.trim().slice(0, 3500);
            lyricsPageUrl = `https://en.wikisource.org/wiki/${encodeURIComponent((page.title ?? pageTitle).replace(/ /g, '_'))}`;
          }
        }
      }
    }

    const geniusUrl = new URL('https://genius.com/search');
    geniusUrl.searchParams.set('q', `${track.trackName} ${track.artistName}`);

    const description = `**Artist:** ${track.artistName}${track.collectionName ? `\n**Album:** ${track.collectionName}` : ''}`;
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(track.trackName)
      .setURL(lyricsPageUrl || geniusUrl.toString())
      .setDescription(lyricsText
        ? `${description}\n\n**Lyrics from Wikisource**\n${lyricsText}${lyricsText.length >= 3500 ? '…' : ''}\n\n[View source page](${lyricsPageUrl})`
        : `${description}\n\nI couldn't find a lyrics text on Wikisource for this song. [Search Genius](${geniusUrl.toString()})`)
      .setFooter({ text: lyricsText ? 'Jarvis • lyrics fetched from Wikisource' : 'Jarvis • lyrics search' });

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
