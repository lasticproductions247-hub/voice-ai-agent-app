import { useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, Zap, Code, Info } from 'lucide-react';

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: 'STT' | 'NLP' | 'TOOL' | 'LLM' | 'TTS' | 'SYSTEM';
  message: string;
  meta?: any;
}

interface TelemetryConsoleProps {
  events: TelemetryEvent[];
  onClear: () => void;
}

export default function TelemetryConsole({ events, onClear }: TelemetryConsoleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events]);

  const getTypeColor = (type: TelemetryEvent['type']) => {
    switch (type) {
      case 'STT': return 'text-sky-400 border-sky-950 bg-sky-950/40';
      case 'NLP': return 'text-purple-400 border-purple-950 bg-purple-950/40';
      case 'TOOL': return 'text-amber-400 border-amber-950 bg-amber-950/40';
      case 'LLM': return 'text-emerald-400 border-emerald-950 bg-emerald-950/40';
      case 'TTS': return 'text-pink-400 border-pink-950 bg-pink-950/40';
      default: return 'text-slate-400 border-slate-800 bg-slate-900/40';
    }
  };

  const getTypeIcon = (type: TelemetryEvent['type']) => {
    switch (type) {
      case 'STT': return <Zap className="w-3.5 h-3.5" />;
      case 'NLP': return <Info className="w-3.5 h-3.5" />;
      case 'TOOL': return <Code className="w-3.5 h-3.5" />;
      case 'LLM': return <Zap className="w-3.5 h-3.5" />;
      case 'TTS': return <Terminal className="w-3.5 h-3.5" />;
      default: return <ShieldAlert className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl font-mono text-xs text-slate-300">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">Agent Telemetry & LLM Console</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500">Real-time Stream</span>
          <button 
            onClick={onClear}
            className="text-slate-400 hover:text-white text-[10px] hover:bg-slate-800 px-2 py-0.5 rounded transition border border-slate-800"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Log Output */}
      <div 
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 h-[240px] select-text scrollbar-thin scrollbar-thumb-slate-800"
      >
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 py-8">
            <Terminal className="w-8 h-8 stroke-1 text-slate-700 animate-pulse" />
            <p className="text-[11px] italic">Waiting for voice stream events or agent calls...</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex flex-col gap-1 bg-slate-950/50 border border-slate-900/80 p-2.5 rounded-lg hover:border-slate-800 transition">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-600 shrink-0">{event.timestamp}</span>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-bold tracking-wider shrink-0 uppercase ${getTypeColor(event.type)}`}>
                  {getTypeIcon(event.type)}
                  {event.type}
                </span>
                <span className="text-[11px] text-slate-200 font-semibold truncate">{event.message}</span>
              </div>
              {event.meta && (
                <pre className="mt-1.5 p-2 bg-slate-900/90 rounded border border-slate-800/60 text-[10px] overflow-x-auto max-w-full text-slate-400 leading-relaxed">
                  {typeof event.meta === 'string' ? event.meta : JSON.stringify(event.meta, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>

      {/* Console Footer Metrics */}
      <div className="grid grid-cols-3 gap-px bg-slate-800 border-t border-slate-800 text-center text-[10px] text-slate-400">
        <div className="bg-slate-900/90 py-2">
          <span className="block text-slate-500 uppercase text-[8px] tracking-widest">STT ENGINE</span>
          <span className="font-semibold text-sky-400">WebSpeech API</span>
        </div>
        <div className="bg-slate-900/90 py-2">
          <span className="block text-slate-500 uppercase text-[8px] tracking-widest">LLM MODEL</span>
          <span className="font-semibold text-emerald-400">GPT-4o Voice-Mini</span>
        </div>
        <div className="bg-slate-900/90 py-2">
          <span className="block text-slate-500 uppercase text-[8px] tracking-widest">AVG RESPONSE</span>
          <span className="font-semibold text-pink-400">~340ms</span>
        </div>
      </div>
    </div>
  );
}
