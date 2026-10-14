# Jarvis Bot

A standalone Discord bot powered by Discord.js, TypeScript, and the OpenAI Responses API.

## Features

- Replies when a server member mentions **jarvis** in a message
- Can answer follow-up replies to its own messages
- Keeps a short in-memory conversation history per user
- Uses short, casual Gen Z / Gen Alpha style responses
- Includes two joke responses:
  - `can birds fly?` → `Yes, most birds can fly.`
  - `can fly birds?` → waits 10 seconds, then replies `🙏🥀gah dayum`

## Requirements

- Node.js 18 or newer
- A Discord application and bot token
- An OpenAI API key

**Important:** OpenAI API usage is billed separately from a ChatGPT subscription. Check pricing and get permission from a parent or guardian before enabling paid API usage.

## Setup on Windows

1. Install Node.js from https://nodejs.org.
2. Clone this repository:
   ```bat
   git clone https://github.com/kayden456-cykn/jarvis-bot.git
   cd jarvis-bot
   ```
3. Install dependencies:
   ```bat
   npm install
   ```
4. Create your local environment file:
   ```bat
   copy .env.example .env
   notepad .env
   ```
5. Fill in `DISCORD_BOT_TOKEN` and `OPENAI_API_KEY`. Keep these secrets private and never commit `.env`.
6. In the Discord Developer Portal, open **Bot** and enable **Message Content Intent**. Invite the bot to your server with permissions to view and send messages.
7. Build and run:
   ```bat
   npm run build
   npm start
   ```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DISCORD_BOT_TOKEN` | Discord bot token |
| `DISCORD_CLIENT_ID` | Discord application ID, reserved for future slash-command support |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_MODEL` | Model name; defaults to `gpt-4.1-mini` |

## Notes

- The first time a user invokes Jarvis, it replies `what do u want🫩✌️🥀💔`.
- Later messages containing Jarvis, or replies to a Jarvis message, are sent to the AI.
- Conversation history and first-greeting state reset when the process restarts.
- The bot only responds in servers, not DMs.
- Keep the bot process running for it to stay online.
