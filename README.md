# Jarvis Bot

A standalone Discord bot powered by Discord.js, TypeScript, and the Groq API.

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
- A GroqCloud API key

Groq offers a free tier with rate limits. You can use the free tier without upgrading to the paid Developer tier; Groq says payment information is required when upgrading. Review the [official rate limits](https://console.groq.com/docs/rate-limits) and [billing FAQ](https://console.groq.com/docs/billing-faqs). Do not upgrade to a paid tier unless you understand the costs and have permission from a parent or guardian.

## Setup on Windows

1. Install Node.js from https://nodejs.org.
2. Create a GroqCloud account and generate an API key at https://console.groq.com/keys.
3. Clone this repository:
   ```bat
   git clone https://github.com/kayden456-cykn/jarvis-bot.git
   cd jarvis-bot
   ```
4. Install dependencies:
   ```bat
   npm install
   ```
5. Create your local environment file:
   ```bat
   copy .env.example .env
   notepad .env
   ```
6. Fill in `DISCORD_BOT_TOKEN` and `GROQ_API_KEY`. Keep these secrets private and never commit `.env`.
7. In the Discord Developer Portal, open **Bot** and enable **Message Content Intent**. Invite the bot to your server with permissions to view and send messages.
8. Build and run:
   ```bat
   npm run build
   npm start
   ```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DISCORD_BOT_TOKEN` | Discord bot token |
| `DISCORD_CLIENT_ID` | Discord application ID, reserved for future slash-command support |
| `GROQ_API_KEY` | GroqCloud API key |
| `GROQ_MODEL` | Model ID; defaults to `openai/gpt-oss-20b` |

## Notes

- The first time a user invokes Jarvis, it replies `what do u want🫩✌️🥀💔`.
- Later messages containing Jarvis, or replies to a Jarvis message, are sent to the AI.
- Conversation history and first-greeting state reset when the process restarts.
- The bot only responds in servers, not DMs.
- Keep the bot process running for it to stay online.
- The free tier has rate limits; responses may fail temporarily if you exceed them.
