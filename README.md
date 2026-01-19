# Maya

Maya is a supportive, anime-inspired chat companion that can speak replies out loud and check in with you when you're quiet for a while.

## Features

- Empathetic, concise replies shaped by a supportive system prompt.
- Optional text-to-speech for Maya's responses.
- Voice input support so you can talk instead of typing.
- Gentle check-ins after periods of inactivity.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and add your OpenAI API key:

```bash
cp .env.example .env
```

3. Start the server:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Notes

- This app runs the OpenAI request from the server so your API key stays private.
- The Web Speech API is used for text-to-speech and voice input and may behave differently by browser.
