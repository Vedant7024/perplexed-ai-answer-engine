# Perplexed — AI Answer Engine

A Perplexity-style AI search assistant that combines a large language model with live web search to produce grounded, cited answers. Built with a TypeScript/Express backend (using LangChain agents) and a Vite-powered frontend, with [SearXNG](https://docs.searxng.org/) as the underlying search provider.

## Features

- Conversational AI answer engine with follow-up question support
- Multiple specialized search agents:
  - Web search
  - Academic search
  - Image search
  - Reddit search
  - Video search
  - YouTube search
- Writing assistant agent
- Suggestion generator for follow-up queries
- Streaming responses
- Self-hosted search via SearXNG (no reliance on third-party search APIs)

## Tech Stack

**Backend**
- Node.js + TypeScript
- Express
- LangChain (agent orchestration)
- tsx (dev runtime with watch mode)
- Axios (HTTP client for SearXNG requests)

**Frontend**
- Vite
- TypeScript

**Search Provider**
- [SearXNG](https://github.com/searxng/searxng) — self-hosted, privacy-respecting metasearch engine, run via Docker

## Project Structure

```
PERPLEXITY CLONE/
├── backend/
│   ├── src/
│   │   ├── agents/          # LangChain search & assistant agents
│   │   ├── controllers/     # Route/request handlers
│   │   ├── services/        # External integrations (e.g. SearXNG client)
│   │   ├── lib/
│   │   └── index.ts         # Server entry point
│   ├── searxng/
│   │   └── settings.yml     # SearXNG configuration
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    └── package.json
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with WSL2 backend, on Windows)
- npm

## Setup

### 1. Clone and install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

Create a `.env` file inside `backend/` with any required API keys and config (e.g. LLM provider keys, port overrides).

### 3. Start SearXNG (search backend)

The app depends on a running SearXNG instance for live web search. Run it via Docker:

```bash
cd backend/searxng
docker run -d --name searxng -p 4000:8080 --restart unless-stopped -v "${PWD}:/etc/searxng" searxng/searxng
```

Verify it's up:

```bash
docker ps
curl -UseBasicParsing "http://localhost:4000/search?q=test&format=json"
```

You should get a `200 OK` response with JSON search results.

> **Note:** `search.formats` in `backend/searxng/settings.yml` must include `json`, since SearXNG disables the JSON API by default:
> ```yaml
> search:
>   formats:
>     - html
>     - json
> ```

### 4. Start the backend

```bash
cd backend
npm run dev
```

The backend runs on **http://localhost:3001** by default.

### 5. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs on **http://localhost:5173** by default.

### 6. Open the app

Visit **http://localhost:5173** in your browser and start asking questions.

## Windows Setup Notes (Docker/WSL2)

If `docker` commands aren't recognized, Docker Desktop isn't installed, or the engine isn't running:

1. Install WSL2 (run as Administrator):
   ```powershell
   wsl --install
   ```
   Restart your machine after this completes.

2. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/), keeping the "Use WSL 2 instead of Hyper-V" option enabled.

3. Restart your machine again, then launch Docker Desktop and wait for the whale icon in the system tray to show it's running.

4. Verify from a **new** terminal window:
   ```powershell
   docker --version
   ```

## Troubleshooting

**`connect ECONNREFUSED ::1:4000` / `127.0.0.1:4000`**
SearXNG isn't running. Start (or restart) the container:
```bash
docker start searxng
```
If the container doesn't exist yet, see [Start SearXNG](#3-start-searxng-search-backend) above.

**`docker` command not recognized**
Docker Desktop isn't installed or its CLI isn't on your PATH. See [Windows Setup Notes](#windows-setup-notes-dockerwsl2).

**`failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`**
Docker Desktop is installed but the engine isn't running. Launch the Docker Desktop application and wait for it to fully start before running Docker commands.

**SearXNG container exits immediately / keeps restarting**
Check the logs:
```bash
docker logs searxng
```

## License

This project is for educational/personal use.