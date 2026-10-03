import { useEffect, useState } from 'react';
import {
  Cpu,
  Sparkles,
  Terminal,
  BarChart3,
  Mic,
  GitBranch,
  Download,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Activity,
  Wrench,
  Bot,
  PlayCircle,
  Radio
} from 'lucide-react';

const APP_URL = `${window.location.origin}${window.location.pathname}#app`;
const REPO_URL = 'https://github.com/lasticproductions247-hub/voice-ai-agent-app';

const SURFACES = [
  {
    id: '01',
    icon: Mic,
    name: 'Playground',
    tagline: 'Real-time voice sessions',
    body: 'Press call and talk. Live waveform visualizer tracks amplitude in real time, interim speech-to-text streams in as you speak, and every turn is written to a timestamped transcript. Mute mid-call or flip between voice and text mode without dropping the session.',
    features: ['Live waveform visualizer', 'Interim speech-to-text', 'Timestamped transcripts', 'Mid-call mute', 'Voice / text switching']
  },
  {
    id: '02',
    icon: Sparkles,
    name: 'Studio',
    tagline: 'Design your own agents',
    body: 'Build agents from scratch in plain English. Set the persona, write the system prompt, tune voice language, pitch, rate and gender, then equip the agent with tools and NLP keyword rules that map phrases to responses or tool invocations.',
    features: ['Persona and system prompt', 'Voice language, pitch, rate', 'Tool definitions with parameters', 'NLP keyword rule mapping', 'Fallback response pools']
  },
  {
    id: '03',
    icon: BarChart3,
    name: 'Analytics',
    tagline: 'Measure the fleet',
    body: 'Aggregate view across every session the suite has handled. Call volume, total and average duration, peak call length, latency trends, success rates, and a live leaderboard ranking agents against each other.',
    features: ['Call volume and duration', 'Average and peak length', 'Latency trends', 'Success-rate tracking', 'Agent leaderboard']
  },
  {
    id: '04',
    icon: Terminal,
    name: 'Telemetry',
    tagline: 'The debugging surface',
    body: 'A live console streaming every event as it fires — session lifecycle, per-utterance transcription, agent replies, tool invocations with their parameters and returned output, and connection state changes. This is where you actually see what the pipeline is doing.',
    features: ['Session lifecycle events', 'Per-utterance traces', 'Tool parameters and output', 'Connection state changes', 'Real-time event stream']
  }
];

const DEFAULTS = [
  { avatar: 'Coach Alex', role: 'Technical career & coding coach', tone: 'Direct, practical, code-first' },
  { avatar: 'Dr. Sophia', role: 'Wellness & mental-health check-in', tone: 'Calm, warm, unhurried' },
  { avatar: 'Kailas', role: 'Flight deals & itinerary planning', tone: 'Brisk, transactional, precise' },
  { avatar: 'Penny', role: 'E-commerce orders & refunds', tone: 'Upbeat, apologetic, efficient' }
];

const STATS = [
  { value: '392', unit: 'KB', label: 'Single-file bundle' },
  { value: '4', unit: '', label: 'Studio surfaces' },
  { value: '0', unit: '', label: 'Backend calls' },
  { value: '100', unit: '%', label: 'Client-side' }
];

const CAPABILITIES = [
  { icon: Bot, label: 'Multi-agent roster', body: 'Run several specialised agents side by side and switch between them mid-session.' },
  { icon: Wrench, label: 'Tool execution', body: 'Agents invoke tools with typed parameters and surface live execution state and output.' },
  { icon: Activity, label: 'Event telemetry', body: 'Every transition is captured — connect, listen, think, speak, disconnect.' },
  { icon: Zap, label: 'Instant deploy', body: 'Static output. Push to main and GitHub Pages publishes the new build automatically.' },
  { icon: Shield, label: 'Keys stay local', body: 'No secrets ship to the client. Everything runs in the browser you already opened.' },
  { icon: Globe, label: 'Portable bundle', body: 'One HTML file with JS and CSS inlined. Host it, email it, drop it on any static host.' }
];

function downloadApp() {
  const url = `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}`;
  const link = document.createElement('a');
  link.href = url;
  link.download = 'AURA.AI.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* ── Nav ── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80' : 'border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-violet-500/30">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                AURA<span className="text-indigo-400">.AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">VOICE AGENT STUDIO</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-400">
            <a href="#studio" className="hover:text-white transition">Studio</a>
            <a href="#surfaces" className="hover:text-white transition">Surfaces</a>
            <a href="#agents" className="hover:text-white transition">Agents</a>
            <a href="#stack" className="hover:text-white transition">Stack</a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl border border-slate-700 hover:border-slate-500 transition"
            >
              <GitBranch className="w-4 h-4" />
              Repo
            </a>
            <a
              href={APP_URL}
              className="inline-flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/25 transition"
            >
              Enter App
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 px-4 sm:px-6 overflow-hidden">
        {/* ambient glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-14rem] left-1/2 -translate-x-1/2 w-[46rem] h-[46rem] rounded-full bg-violet-600/18 blur-[130px]" />
          <div className="absolute top-40 right-[-12rem] w-[26rem] h-[26rem] rounded-full bg-indigo-500/14 blur-[120px]" />
          <div className="absolute -bottom-40 left-[-10rem] w-[24rem] h-[24rem] rounded-full bg-fuchsia-500/10 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.07) 1px, transparent 1px)',
              backgroundSize: '56px 56px'
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px] font-bold font-mono tracking-wide mb-7">
            <Radio className="w-3.5 h-3.5" />
            ALL SYSTEMS NOMINAL
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Real-time voice
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              agent studio
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-9">
            Design, test and analyse production-grade voice agents in the browser. Live waveform
            capture, streaming speech-to-text, tool invocation and full event telemetry — with zero
            backend, zero API keys and zero build friction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <a
              href={APP_URL}
              className="group inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-2xl shadow-indigo-600/30 transition-all hover:scale-[1.03]"
            >
              <PlayCircle className="w-5 h-5" />
              Enter App
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <button
              onClick={downloadApp}
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/70 border border-slate-700 hover:border-slate-500 text-slate-100 font-bold text-sm backdrop-blur transition-all hover:scale-[1.03]"
            >
              <Download className="w-5 h-5" />
              Download App
            </button>

            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3.5 rounded-2xl text-slate-300 hover:text-white border border-transparent hover:border-slate-700 font-bold text-sm transition-all hover:scale-[1.03]"
            >
              <GitBranch className="w-5 h-5" />
              View Repo
            </a>
          </div>

          <p className="text-[11px] text-slate-600 font-mono">
            React 19 · Vite 7 · Tailwind CSS 4 · Web Speech API
          </p>

          {/* stats */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur px-4 py-5 text-center">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {s.value}
                  {s.unit && <span className="text-indigo-400 text-lg">{s.unit}</span>}
                </div>
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Surfaces ── */}
      <section id="surfaces" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-mono tracking-[0.2em] text-indigo-400 mb-3">THE SUITE</p>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Four surfaces, one agent runtime
            </h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Everything you need to take a voice agent from idea to instrumented production
              behaviour, without ever leaving the browser tab.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {SURFACES.map((s) => (
              <article
                key={s.id}
                className="group relative rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/40 p-7 sm:p-8 transition-all duration-300 hover:bg-slate-900/70 overflow-hidden"
              >
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-500/0 group-hover:bg-indigo-500/10 blur-3xl transition-colors duration-500" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/25 flex items-center justify-center">
                      <s.icon className="w-6 h-6 text-indigo-300" />
                    </div>
                    <span className="text-5xl font-black text-slate-800/80 group-hover:text-slate-700 transition-colors leading-none select-none">
                      {s.id}
                    </span>
                  </div>

                  <h4 className="text-xl font-black tracking-tight mb-1.5">{s.name}</h4>
                  <p className="text-[11px] font-mono text-indigo-400 mb-4">{s.tagline}</p>
                  <p className="text-sm text-slate-400 leading-relaxed mb-5">{s.body}</p>

                  <ul className="space-y-2">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px] text-slate-400">
                        <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Studio deep-dive ── */}
      <section id="studio" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-[11px] font-mono tracking-[0.2em] text-indigo-400 mb-3">STUDIO</p>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-5 leading-tight">
              Write the agent like you're writing to a person
            </h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              No YAML soup, no schema wrangling. The Studio form is a direct translation of how
              you actually brief a voice actor: who they are, what they know, how they sound, and
              what they're allowed to do when a request comes in they can't answer from the script.
            </p>

            <div className="space-y-4">
              {[
                ['Persona', 'Name, role, avatar and greeting — the identity the agent answers as.'],
                ['System prompt', 'The full behavioural brief, written in plain English prose.'],
                ['Voice', 'Language, pitch, rate and gender, tuned against the Web Speech engine.'],
                ['Tools', 'Named capabilities with typed parameters the agent can invoke mid-call.'],
                ['Keyword rules', 'Phrases mapped to canned responses or to a specific tool call.']
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4 items-start">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-slate-200">{k}</div>
                    <div className="text-[13px] text-slate-500 leading-relaxed mt-0.5">{v}</div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={APP_URL}
              className="group mt-8 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-2xl shadow-indigo-600/25 transition-all hover:scale-[1.02]"
            >
              <PlayCircle className="w-5 h-5" />
              Enter App
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* visual: waveform mock */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-violet-600/12 to-indigo-600/12 blur-3xl rounded-full" />
            <div className="relative rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-slate-400">SESSION LIVE</span>
                </div>
                <span className="text-[10px] font-mono text-slate-600">00:42</span>
              </div>

              <div className="flex items-end justify-center gap-[5px] h-32 mb-6">
                {[18, 34, 52, 28, 68, 44, 88, 56, 38, 72, 94, 60, 46, 80, 32, 58, 26, 44, 20, 34, 16, 28, 12, 22].map((h, i) => (
                  <div
                    key={i}
                    className="w-full max-w-[10px] rounded-full bg-gradient-to-t from-indigo-600 to-violet-400"
                    style={{ height: `${h}%`, opacity: 0.35 + (i % 4) * 0.16 }}
                  />
                ))}
              </div>

              <div className="space-y-2.5 border-t border-slate-800 pt-5">
                <div className="flex justify-between gap-3">
                  <span className="text-[11px] font-mono text-slate-500">USER</span>
                  <span className="text-[13px] text-slate-300 text-right">Can you look up my order status?</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[11px] font-mono text-indigo-400">AGENT</span>
                  <span className="text-[13px] text-slate-400 text-right">Of course — pulling that up now.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Agents ── */}
      <section id="agents" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-mono tracking-[0.2em] text-indigo-400 mb-3">ROSTER</p>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Ships with four specialists
            </h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Demonstrating four distinct voice profiles, tool sets and response strategies. Fork
              them, rewrite them, or build your own from the empty Studio form.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEFAULTS.map((a) => (
              <div
                key={a.avatar}
                className="rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/40 p-6 transition-all duration-300 hover:bg-slate-900/70 hover:-translate-y-1"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/25 flex items-center justify-center text-xl mb-4">
                  {a.avatar.charAt(0)}
                </div>
                <h4 className="text-sm font-black mb-1">{a.avatar}</h4>
                <p className="text-[12px] text-slate-400 leading-snug mb-3">{a.role}</p>
                <p className="text-[11px] text-slate-600 font-mono border-t border-slate-800 pt-3">{a.tone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stack ── */}
      <section id="stack" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-mono tracking-[0.2em] text-indigo-400 mb-3">CAPABILITIES</p>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Built like an infrastructure product
            </h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
              The kind of thing you'd otherwise stitch together from three services and a paid
              voice SDK. This runs entirely on the client.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAPABILITIES.map((c) => (
              <div
                key={c.label}
                className="rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/40 p-6 transition-all duration-300 hover:bg-slate-900/70"
              >
                <c.icon className="w-5 h-5 text-indigo-400 mb-3.5" />
                <h4 className="text-sm font-bold mb-1.5">{c.label}</h4>
                <p className="text-[13px] text-slate-500 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-slate-900/50 border border-slate-800 p-6 sm:p-8">
            <p className="text-[11px] font-mono text-slate-500 mb-4">TECHNICAL STACK</p>
            <div className="flex flex-wrap gap-2.5">
              {['React 19', 'TypeScript 5.9', 'Vite 7', 'Tailwind CSS 4', 'lucide-react', 'vite-plugin-singlefile', 'Web Speech API', 'GitHub Actions', 'GitHub Pages'].map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-[12px] text-slate-300 font-mono"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 border-t border-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-5">
            Open the studio and
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              hear it think
            </span>
          </h3>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed mb-8">
            No signup, no key, no server. The whole suite is one HTML file — open it and start a
            call.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={APP_URL}
              className="group inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-2xl shadow-indigo-600/30 transition-all hover:scale-[1.03]"
            >
              <PlayCircle className="w-5 h-5" />
              Enter App
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <button
              onClick={downloadApp}
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/70 hover:bg-slate-800/70 border border-slate-700 hover:border-slate-500 text-slate-100 font-bold text-sm backdrop-blur transition-all hover:scale-[1.03]"
            >
              <Download className="w-5 h-5" />
              Download App
            </button>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-2xl text-slate-300 hover:text-white border border-slate-800 hover:border-slate-600 font-bold text-sm transition-all hover:scale-[1.03]"
            >
              <GitBranch className="w-5 h-5" />
              View Repo
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-900 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-black">AURA<span className="text-indigo-400">.AI</span></div>
              <div className="text-[10px] text-slate-600 font-mono">REAL-TIME VOICE AGENT STUDIO</div>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs text-slate-500">
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Repository</a>
            <a href={APP_URL} className="hover:text-white transition">Launch App</a>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Web Speech API
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-7 pt-6 border-t border-slate-900 text-center">
          <p className="text-[11px] text-slate-600">
            © 2026 Aura.AI Voice Technologies · Lastic Productions · Built with React 19, Vite and Tailwind CSS 4
          </p>
        </div>
      </footer>

    </div>
  );
}