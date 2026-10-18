# ReplyCraft AI

ReplyCraft is a local-first AI customer-support prototype for freelancers and small businesses. It can draft customer-service replies and answer customer questions using business information supplied to the chatbot. AI inference runs locally through [Ollama](https://ollama.com/), so the project does not require a paid AI API key.

> **Project status:** MVP / prototype. The dashboard, local chatbot API, and embeddable demo widget have been tested locally. This is not yet a production-ready hosted service.

## Features

- **AI reply generator:** Draft customer-service responses in professional, friendly, firm, or apologetic tones.
- **Business-aware support chatbot:** Answer questions using the business knowledge provided with each request.
- **Embeddable chat widget:** A floating chat button and panel that can be added to a webpage with a script tag.
- **Local AI inference:** Uses an Ollama model running on your computer.
- **FastAPI backend:** HTTP endpoints for health checks, reply generation, and customer chat.
- **Demo website:** A sample QuickFix Repairs page for testing the widget end-to-end.

## Tech stack

- Frontend: React, TypeScript, Vite
- Backend: Python, FastAPI, Pydantic, HTTPX
- Local model runtime: Ollama
- Example model: `qwen2.5:1.5b` (configurable)

## Requirements

Install the following before starting:

- Python 3.10 or newer (the project has been developed with Python 3.14 as well)
- Node.js and npm
- [Ollama](https://ollama.com/download)
- Git (optional, for cloning the repository)

## Installation and setup

### 1. Get the project

If you have the repository URL, clone it and enter the project directory:

```bash
git clone <your-repository-url>
cd "ReplyCraft Ai"
```

If you already have the project on your computer, open its root folder in a terminal.

### 2. Download a local model

Start Ollama, then pull the default model:

```bash
ollama pull qwen2.5:1.5b
```

You can use another model supported by Ollama by setting the `OLLAMA_MODEL` environment variable before starting the backend.

### 3. Set up the backend

From the project root, enter the backend directory and create a virtual environment.

**Windows PowerShell:**

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install fastapi "uvicorn[standard]" httpx
```

If PowerShell blocks activation, you can run the virtual environment's Python directly, or follow the Python documentation for your machine's execution-policy settings.

**macOS/Linux:**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install fastapi "uvicorn[standard]" httpx
```

Start the API server from inside `backend`:

```bash
python -m uvicorn main:app --reload --port 8000
```

Keep this terminal open. The API will be available at `http://localhost:8000`, and interactive API documentation is available at `http://localhost:8000/docs`.

Optional environment variables:

- `OLLAMA_URL`: Ollama server URL; defaults to `http://localhost:11434`.
- `OLLAMA_MODEL`: model name; defaults to `qwen2.5:1.5b`.

### 4. Set up the frontend

Open a **second terminal** from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local Vite URL printed in the terminal, normally `http://localhost:5173`.

### 5. Test the website chat widget

Make sure Ollama, the backend, and the frontend are running. Open:

```text
http://localhost:5173/demo.html
```

Click the floating chat button in the bottom-right corner and ask questions such as:

- `What are your opening hours?`
- `Do you repair laptops?`
- `How much does a laptop repair cost?`

The sample business knowledge says QuickFix Repairs is open Monday–Saturday, 9 AM–6 PM, is closed on Sunday, and offers laptop repair, desktop repair, virus removal, and hardware diagnostics. It intentionally does not provide prices, so the assistant should not guess a price.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check backend status and configured local model |
| `POST` | `/api/generate` | Generate a customer-service reply |
| `POST` | `/api/chat` | Answer a customer question using supplied business knowledge |

See `http://localhost:8000/docs` for request schemas and interactive testing.

## Embedding the widget

The demo page loads `frontend/public/widget.js` using a script tag similar to this:

```html
<script
  src="/widget.js"
  data-api-url="http://localhost:8000"
  data-business-name="QuickFix Repairs"
  data-business-knowledge="Business: QuickFix Repairs. Services: laptop repair and desktop repair. Hours: Monday to Saturday, 9 AM to 6 PM. Sunday: closed.">
</script>
```

The script URL and API URL must be changed for a deployed environment. The sample tag is for local demonstration only; do not publish private information in `data-business-knowledge`.

## Limitations and security notes

- **Local development only:** The supplied API URL points to a local Ollama-backed server. A public website cannot use a visitor's own `localhost` as your hosted backend.
- **Business information is client-side:** The demo passes business knowledge through HTML data attributes. Anyone visiting the page can inspect it, and a client can alter the data sent to the API. Only use public, non-sensitive demo information in this version.
- **No persistent business profiles:** Business settings and chat history are not backed by a database or account system in this prototype. Configuration may need to be supplied again.
- **No authentication or tenant isolation:** There is not yet a secure business account system or server-side separation of each business's knowledge.
- **No real business actions:** The chatbot can provide information but does not actually book appointments, process payments, issue refunds, or update orders.
- **Model answers can be wrong:** Local models may misunderstand a question or fail to follow instructions. Verify important answers and provide a human contact path.
- **Escalation detection is basic:** The `needs_human` flag is inferred from reply wording, not a robust classification system.
- **Performance depends on hardware:** Response speed and model quality vary with the selected model and the computer running Ollama.
- **Not production-hardened:** Before public deployment, add server-side business configuration, authentication/authorization as appropriate, rate limiting, monitoring, robust escalation handling, and deployment-specific CORS settings.

## Suggested project structure

```text
ReplyCraft Ai/
├── backend/
│   └── main.py
└── frontend/
    ├── public/
    │   ├── demo.html
    │   └── widget.js
    └── src/
        ├── App.tsx
        ├── App.css
        ├── index.css
        └── main.tsx
```

The exact structure may vary slightly depending on your local changes.

## Current status

The local reply generator, customer-support chatbot, and sample embeddable widget have been tested manually. Persistent settings, production deployment, authentication, and production security hardening remain future work.

## Contributing

Contributions and suggestions are welcome. For a bug report, include the steps to reproduce it, the relevant terminal error, and your operating system. Avoid posting secrets or private customer data.

## License

No license has been selected yet. Add a `LICENSE` file and update this section before redistributing the project as open source.
