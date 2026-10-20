# NEXUS AI Command Center

A futuristic AI command center featuring a cybersecurity-inspired dashboard, interactive command console, task manager, neural notes, and AI assistant.

## Features

- **Cybersecurity Dashboard** — A futuristic interface for system and threat information.
- **Command Console** — Interactive commands for exploring the NEXUS interface.
- **Task Manager** — Manage tasks with persistent local storage.
- **Neural Notes** — Save notes in your browser.
- **AI Assistant** — Chat with an AI model through a local backend proxy.
- **Responsive UI** — Dark theme with neon-inspired visual styling.

## Tech Stack

- React
- TypeScript
- Vite
- Node.js and Express
- FreeLLMAPI-compatible API endpoint

## Run Locally

### Prerequisites

- Node.js and npm
- FreeLLMAPI running locally, if using its API endpoint

### Installation

```bash
git clone https://github.com/VedhV/NEXUS-AI-Command-Center.git
cd NEXUS-AI-Command-Center
npm install
```

Create a `.env` file based on `.env.example` and configure your API key locally. **Never commit your `.env` file or publish API keys.**

### Start the backend

```bash
npm run server
```

### Start the frontend

In a second terminal:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Security Notes

- Keep API keys in environment variables.
- Do not expose secret keys in frontend code.
- The AI backend requires a reachable, correctly configured API endpoint.

## Project Status

Personal project — actively developing NEXUS AI Command Center.
