# Jarvis Bot

A standalone Discord bot powered by Discord.js, TypeScript, and a local [Ollama](https://ollama.com/) model. The AI runs on your own computer, so no hosted AI API key or per-message AI billing is required.

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
- Ollama installed on the same computer that runs the bot
- Enough RAM and processing power to run the model

Ollama runs the language model locally. There is no AI API usage bill, but you still need a computer, electricity, and an internet connection for Discord itself.

## Setup on Windows

1. Install Node.js from https://nodejs.org.
2. Install Ollama from https://ollama.com/download.
3. Open Command Prompt or PowerShell and download the default model:
   ```bat
   ollama pull llama3.2:3b
   ```
4. Clone this repository:
   ```bat
   git clone https://github.com/kayden456-cykn/jarvis-bot.git
   cd jarvis-bot
   ```
5. Install dependencies:
   ```bat
   npm install
   ```
6. Create your local environment file:
   ```bat
   copy .env.example .env
   notepad .env
   ```
7. Fill in `DISCORD_BOT_TOKEN`. You do not need a Gemini or OpenAI API key. Keep your Discord token private and never commit `.env`.
8. Make sure Ollama is running. Its default local API address is `http://127.0.0.1:11434`.
9. In the Discord Developer Portal, open **Bot** and enable **Message Content Intent**. Invite the bot to your server with permissions to view and send messages.
10. Build and run:
    ```bat
    npm run build
    npm start
    ```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DISCORD_BOT_TOKEN` | Discord bot token |
| `DISCORD_CLIENT_ID` | Discord application ID, reserved for future slash-command support |
| `OLLAMA_BASE_URL` | Local Ollama address; defaults to `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | Local model; defaults to `llama3.2:3b` |

## Notes

- The first time a user invokes Jarvis, it replies `what do u want🫩✌️🥀💔`.
- Later messages containing Jarvis, or replies to a Jarvis message, are sent to the local AI model.
- Conversation history and first-greeting state reset when the process restarts.
- The bot only responds in servers, not DMs.
- Keep both the bot process and Ollama running for Jarvis AI replies to work.
- The default model is a relatively small model; response quality and speed depend on your hardware. You can choose another model available in Ollama by changing `OLLAMA_MODEL`.

