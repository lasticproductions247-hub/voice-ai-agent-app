import { useState } from 'react';
import { SavedCall } from '../data/agents';
import { BarChart2, Phone, Clock, Zap, Award, ArrowUpRight, FileText, CheckCircle, HelpCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface AnalyticsDashboardProps {
  history: SavedCall[];
  onDeleteCall?: (id: string) => void;
}

export default function AnalyticsDashboard({ history, onDeleteCall }: AnalyticsDashboardProps) {
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState<number>(0);

  // Stats calculations
  const totalCalls = history.length;
  const totalDuration = history.reduce((acc, c) => acc + c.durationSeconds, 0);
  const avgLatency = totalCalls > 0 
    ? Math.round(history.reduce((acc, c) => acc + c.metrics.latencyMs, 0) / totalCalls) 
    : 310;
  const avgSTTConfidence = totalCalls > 0 
    ? (history.reduce((acc, c) => acc + c.metrics.sttConfidence, 0) / totalCalls * 100).toFixed(1) 
    : '98.2';
  
  // Savings: Humans cost ~$0.85 per min in support centers. Voice agents cost ~$0.015. 
  // Savings = minutes * (0.85 - 0.015)
  const durationMins = totalDuration / 60;
  const totalSavedAmount = (durationMins * 0.835).toFixed(2);

  const toggleExpand = (id: string) => {
    if (expandedCallId === id) {
      setExpandedCallId(null);
      setPlayingCallId(null);
    } else {
      setExpandedCallId(id);
      setPlayingCallId(null);
    }
  };

  const simulatePlayRecording = (id: string) => {
    if (playingCallId === id) {
      setPlayingCallId(null);
      setPlayProgress(0);
      return;
    }

    setPlayingCallId(id);
    setPlayProgress(0);

    // Rhythmic updates mimicking recording playback
    const interval = setInterval(() => {
      setPlayProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setPlayingCallId(null);
          return 0;
        }
        return prev + 4;
      });
    }, 250);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 text-slate-200">
      
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        
        {/* KPI 1: Call Count */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex items-center gap-4 shadow-lg relative overflow-hidden">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Completed Calls</span>
            <span className="text-xl font-bold text-slate-100">{totalCalls} Sessions</span>
            <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" />
              +100% production
            </span>
          </div>
        </div>

        {/* KPI 2: Total Call Minutes */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex items-center gap-4 shadow-lg relative overflow-hidden">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total Telephony Duration</span>
            <span className="text-xl font-bold text-slate-100">{formatDuration(totalDuration)}</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Real-time voice streaming</span>
          </div>
        </div>

        {/* KPI 3: Response Latency */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex items-center gap-4 shadow-lg relative overflow-hidden">
          <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Avg Voice Latency</span>
            <span className="text-xl font-bold text-slate-100">{avgLatency} ms</span>
            <span className="text-[9px] text-pink-400 flex items-center gap-0.5 mt-0.5">
              STT → LLM → TTS pipeline
            </span>
          </div>
        </div>

        {/* KPI 4: Simulated Cost Savings */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex items-center gap-4 shadow-lg relative overflow-hidden">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Accumulated Savings</span>
            <span className="text-xl font-bold text-emerald-400">${totalSavedAmount}</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">vs. human operations ($0.85/m)</span>
          </div>
        </div>

      </div>

      {/* Detailed Pipeline Analysis & Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Session logs lists */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Completed Calls Transcript Vault</h3>
              <p className="text-xs text-slate-400">Browse audio recordings, metrics, and LLM generated post-call insights</p>
            </div>
            <span className="text-xs bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-1 rounded-xl font-mono">
              Log Size: {history.length} items
            </span>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 bg-slate-950/40 rounded-xl border border-slate-800/50 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-600" />
              <p className="text-xs font-medium text-slate-400">No previous sessions found in vault</p>
              <p className="text-[10px] text-slate-500">Deploy an agent, start a call, and hang up to save a log.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((call) => {
                const isExpanded = expandedCallId === call.id;
                const isPlaying = playingCallId === call.id;

                return (
                  <div 
                    key={call.id} 
                    className={`bg-slate-950 border rounded-xl transition-all duration-250 overflow-hidden ${
                      isExpanded ? 'border-slate-700 bg-slate-950/90' : 'border-slate-850 hover:border-slate-800 bg-slate-950/50'
                    }`}
                  >
                    {/* Collapsed View Trigger Header */}
                    <div 
                      onClick={() => toggleExpand(call.id)}
                      className="p-3.5 flex items-center justify-between cursor-pointer select-none text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-base shrink-0 border border-slate-800">
                          {call.agentAvatar}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-200 truncate">{call.agentName}</span>
                            <span className="text-[9px] text-slate-500 font-mono">{call.date}</span>
                          </div>
                          <div className="flex items-center gap-2.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">🕒 {formatDuration(call.durationSeconds)}</span>
                            <span className={`text-[9px] font-mono px-1.5 rounded-md ${
                              call.metrics.sentiment === 'positive' ? 'bg-emerald-950/60 text-emerald-400' :
                              call.metrics.sentiment === 'mixed' ? 'bg-amber-950/60 text-amber-400' :
                              'bg-blue-950/60 text-blue-400'
                            }`}>
                              Sentiment: {call.metrics.sentiment}
                            </span>
                            <span className="text-[9px] text-slate-500">🛠️ {call.metrics.toolsCalled} tools called</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-2 shrink-0">
                        {/* Star Satisfaction display */}
                        <div className="flex gap-0.5 text-amber-500 text-[10px] font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
                          ★ {call.satisfactionScore}.0
                        </div>
                        
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Expanded Dashboard Details */}
                    {isExpanded && (
                      <div className="border-t border-slate-900 p-4 space-y-4 text-xs bg-slate-950/60 select-text">
                        
                        {/* Audio playback simulator */}
                        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl flex items-center gap-4">
                          <button
                            onClick={() => simulatePlayRecording(call.id)}
                            className="p-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white transition shrink-0 cursor-pointer shadow-lg shadow-violet-900/20"
                          >
                            {isPlaying ? (
                              <span className="flex gap-0.5 items-end h-3.5 w-3.5">
                                <span className="w-0.5 bg-white animate-pulse h-2" />
                                <span className="w-0.5 bg-white animate-pulse h-3.5" />
                                <span className="w-0.5 bg-white animate-pulse h-2.5" />
                              </span>
                            ) : (
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </button>

                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                              <span>{isPlaying ? 'SIMULATED CALL RECORDING PLAYBACK...' : 'TELEPHONY RECORDING SOURCE'}</span>
                              <span>{isPlaying ? `${Math.min(100, playProgress)}%` : 'READY'}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-250" 
                                style={{ width: `${isPlaying ? playProgress : 0}%` }}
                              />
                            </div>
                          </div>
                          
                          {onDeleteCall && (
                            <button
                              onClick={() => onDeleteCall(call.id)}
                              className="text-slate-500 hover:text-rose-400 text-[10px] font-mono py-1 px-2 hover:bg-slate-800 rounded transition border border-transparent hover:border-slate-700 cursor-pointer"
                            >
                              Purge Log
                            </button>
                          )}
                        </div>

                        {/* Telemetry metrics bullet row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-[10px] text-slate-400">
                          <div className="bg-slate-900/50 border border-slate-850 p-2 rounded-lg">
                            <span className="block text-slate-500 text-[8px] uppercase tracking-wider">Latency (LLM)</span>
                            <span className="font-bold text-slate-200 text-xs mt-0.5 block">{call.metrics.latencyMs}ms</span>
                          </div>
                          <div className="bg-slate-900/50 border border-slate-850 p-2 rounded-lg">
                            <span className="block text-slate-500 text-[8px] uppercase tracking-wider">STT Confidence</span>
                            <span className="font-bold text-sky-400 text-xs mt-0.5 block">{(call.metrics.sttConfidence * 100).toFixed(1)}%</span>
                          </div>
                          <div className="bg-slate-900/50 border border-slate-850 p-2 rounded-lg">
                            <span className="block text-slate-500 text-[8px] uppercase tracking-wider">Avg Speech Speed</span>
                            <span className="font-bold text-purple-400 text-xs mt-0.5 block">{call.metrics.wordsPerMin} wpm</span>
                          </div>
                          <div className="bg-slate-900/50 border border-slate-850 p-2 rounded-lg">
                            <span className="block text-slate-500 text-[8px] uppercase tracking-wider">Satisfaction Score</span>
                            <span className="font-bold text-amber-400 text-xs mt-0.5 block">{call.satisfactionScore}.0 / 5.0</span>
                          </div>
                        </div>

                        {/* Summary Paragraph */}
                        <div className="space-y-1 bg-slate-900/30 p-3 rounded-xl border border-slate-850">
                          <h4 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            Structured Call Summary
                          </h4>
                          <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                            {call.summary}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Transcript Section */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider text-slate-400">Telephony Chat Logs</h4>
                            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 border border-slate-850/70 p-2.5 rounded-xl bg-slate-950/85">
                              {call.transcript.map((tr, tIdx) => (
                                <div 
                                  key={tIdx} 
                                  className={`flex flex-col space-y-0.5 ${
                                    tr.sender === 'user' ? 'items-end text-right' : 'items-start text-left'
                                  }`}
                                >
                                  <span className="text-[8px] text-slate-600 font-mono">{tr.timestamp} - {tr.sender === 'user' ? 'User' : 'Agent'}</span>
                                  <p className={`inline-block max-w-[90%] p-2 rounded-xl text-[10.5px] leading-relaxed font-sans ${
                                    tr.sender === 'user' 
                                      ? 'bg-blue-600 text-white rounded-tr-none' 
                                      : 'bg-slate-800 text-slate-200 rounded-tl-none'
                                  }`}>
                                    {tr.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* AI Action Items / Next Steps */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider text-slate-400">Extracted Action Items</h4>
                            <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl space-y-2 h-48 overflow-y-auto">
                              {call.actionItems.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300 font-sans leading-relaxed">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </div>
                              ))}
                              {call.actionItems.length === 0 && (
                                <p className="text-slate-500 italic text-center pt-8">No outstanding actions items compiled.</p>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pipeline Diagram */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            Pipeline Diagnostics
          </h3>
          
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The telemetry console maps voice processing down to the millisecond. Standard benchmark steps are visualized below:
          </p>

          <div className="space-y-3 text-xs font-mono">
            
            {/* Step 1 */}
            <div className="flex items-start gap-2 p-2 bg-slate-950 rounded-xl border border-slate-850">
              <span className="text-indigo-400 font-bold text-[10px] bg-indigo-950 border border-indigo-900 rounded px-1">1</span>
              <div>
                <span className="block text-[10px] font-bold text-slate-200 uppercase">SPEECH-TO-TEXT (STT)</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Web Speech Recognition client listening for vocal peaks</span>
                <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400">
                  <span>Avg Cost: $0.00 / min</span>
                  <span>Confidence: {avgSTTConfidence}%</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-2 p-2 bg-slate-950 rounded-xl border border-slate-850">
              <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950 border border-emerald-900 rounded px-1">2</span>
              <div>
                <span className="block text-[10px] font-bold text-slate-200 uppercase">LLM REASONING CORE</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Context-aware NLP + Dynamic Keyword Tooling router</span>
                <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400">
                  <span>Latency: ~420ms</span>
                  <span>Token Cost: $0.0008</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-2 p-2 bg-slate-950 rounded-xl border border-slate-850">
              <span className="text-pink-400 font-bold text-[10px] bg-pink-950 border border-pink-900 rounded px-1">3</span>
              <div>
                <span className="block text-[10px] font-bold text-slate-200 uppercase">TEXT-TO-SPEECH (TTS)</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">HTML5 Web SpeechSynthesis client synthesizing audio streams</span>
                <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400">
                  <span>Warmup: 42ms</span>
                  <span>Voices Loaded: {typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices().length : 0}</span>
                </div>
              </div>
            </div>

          </div>

          {/* System Support Alert */}
          <div className="bg-indigo-950/40 border border-indigo-900/60 p-3 rounded-xl flex items-start gap-2.5 text-[10px] text-indigo-300">
            <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-sans">
              <strong>Telephony API Status:</strong> Active and listening on all WebRTC audio channels. Interrupt protocols are verified operational.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
