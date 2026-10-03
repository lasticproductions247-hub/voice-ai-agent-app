# AURA.AI

**Real-Time Voice AI Agent Studio &amp; Telemetry Suite**

A fully client-side React studio for designing, testing and analysing real-time voice AI agents. No backend, no API keys, no server — the entire app compiles to a single self-contained HTML file you can open, host or email.

Built by **Lastic Productions** — Jaxx / Sweet Kinky Feet.

---

## What it does

### Playground
Talk to a voice agent in real time. Pick an agent, press call, and watch the live waveform visualizer track the audio. Speech-to-text interim transcripts stream in, agent replies come back spoken, and every turn is written to the transcript with timestamps.

### Studio
Design your own agents from scratch:

- Name, role and avatar
- Greeting message
- Full system prompt written in plain English
- Voice settings — language, pitch, rate and gender
- **Tools** the agent can invoke (name, description, parameters)
- **NLP keyword rules** that map phrases to canned responses or tool calls
- Default fallback responses

### Analytics
Aggregate view of everything the agent suite has handled:

- Call volume and total duration
- Average and peak call length
- Agent leaderboard ranked by call count
- Latency and success-rate trends

### Telemetry
A live console that streams every event as it happens — session lifecycle, per-utterance transcription, agent replies, tool invocations with their parameters and returned output, and connection state changes. This is the debugging surface for real-time voice pipelines.

---

## Features

- Live audio waveform visualizer with reactive amplitude bars
- Real-time interim speech transcription
- Mute toggle mid-call
- Voice mode / text mode switching
- Tool-call execution panel with live state and output
- Saved call history archive
- Agent leaderboard analytics
- Full telemetry event console
- Dark studio aesthetic, responsive layout
- **100% static** — the production build is one HTML file, ~344 KB

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Icons | lucide-react |
| Packaging | vite-plugin-singlefile |

Zero runtime dependencies beyond React itself.

---

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/index.html
npm run preview  # preview the production build
```

The production build emits a **single** `dist/index.html` with all JS and CSS inlined. That file is fully portable — deploy it to any static host, or open it directly in a browser.

---

## Project structure

```
src/
  App.tsx                    # root shell, tab routing, call state machine
  components/
    AgentCreator.tsx         # agent designer form
    AgentList.tsx            # agent roster
    AnalyticsDashboard.tsx   # metrics and leaderboard
    TelemetryConsole.tsx     # live event stream
    VoiceVisualizer.tsx      # waveform amplitude renderer
  data/
    agents.ts                # agent type definitions + default agents
  utils/
    cn.ts                    # class-name merge helper
dist/
  index.html                 # single-file production build
```

---

## Default agents included

| Agent | Role |
|---|---|
| Coach Alex | Technical career &amp; coding coach |
| Dr. Sophia | Wellness &amp; mental-health check-in |
| Kailas | Flight deals search &amp; itinerary planner |
| Penny | E-commerce order lookup &amp; refunds |

---

## Deploying

The build is static. Any of these work:

```bash
# GitHub Pages
gh-pages -d dist

# Netlify / Vercel / Cloudflare Pages — just point at dist/
```

---

## License

© Lastic Productions. All rights reserved.