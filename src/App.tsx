import { useState, useEffect, useRef } from 'react';
import { 
  DEFAULT_AGENTS, 
  CALL_HISTORY_MOCK, 
  VoiceAgent, 
  SavedCall 
} from './data/agents';
import VoiceVisualizer from './components/VoiceVisualizer';
import TelemetryConsole, { TelemetryEvent } from './components/TelemetryConsole';
import AgentCreator from './components/AgentCreator';
import AgentList from './components/AgentList';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { 
  Mic, 
  Phone, 
  PhoneOff, 
  Volume2, 
  VolumeX, 
  Terminal, 
  Keyboard, 
  Send, 
  Sparkles, 
  CheckCircle, 
  Cpu, 
  Plus 
} from 'lucide-react';

export default function App() {
  // Primary Tabs
  const [activeTab, setActiveTab] = useState<'playground' | 'studio' | 'analytics' | 'telemetry'>('playground');
  
  // Voice Agent States
  const [agents, setAgents] = useState<VoiceAgent[]>(DEFAULT_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('alex-coach');
  
  // Call telemetry & control states
  const [activeCallAgentId, setActiveCallAgentId] = useState<string | null>(null);
  const [activeCallState, setActiveCallState] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'thinking'>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(true);
  const [textInput, setTextInput] = useState<string>('');
  const [activeCallTranscript, setActiveCallTranscript] = useState<{ sender: 'user' | 'agent'; text: string; timestamp: string }[]>([]);
  const [activeCallStartSecs, setActiveCallStartSecs] = useState<number>(0);
  const [currentInterimTranscript, setCurrentInterimTranscript] = useState<string>('');

  // Active execution tool state
  const [activeToolCall, setActiveToolCall] = useState<{
    name: string;
    description: string;
    parameters: string;
    state: 'executing' | 'success';
    output: string;
  } | null>(null);

  // Saved Call Archives
  const [history, setHistory] = useState<SavedCall[]>(CALL_HISTORY_MOCK);
  
  // Telemetry Streams
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);

  // Browser Speech Recognition Ref
  const recognitionRef = useRef<any>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Helper to add developer telemetry events
  const logEvent = (type: TelemetryEvent['type'], message: string, meta?: any) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const newEvent: TelemetryEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: timeStr,
      type,
      message,
      meta
    };
    setTelemetryEvents(prev => [...prev, newEvent].slice(-100)); // Keep last 100 logs
  };

  // Populate default logs on start
  useEffect(() => {
    logEvent('SYSTEM', 'Aura Voice Telemetry Stream Initialized.');
    logEvent('SYSTEM', `Loaded ${DEFAULT_AGENTS.length} core WebRTC Agent neural models.`);
    logEvent('SYSTEM', 'Checking browser WebRTC and audio capabilities...');
    
    if (typeof window !== 'undefined') {
      const hasSynthesis = 'speechSynthesis' in window;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const hasRecognition = !!SpeechRecognition;
      
      logEvent('SYSTEM', 'Pipeline check result:', {
        speechSynthesisSupport: hasSynthesis,
        speechRecognitionSupport: hasRecognition,
        userAgent: navigator.userAgent
      });

      if (!hasRecognition) {
        logEvent('SYSTEM', 'Notice: WebSpeech speech recognition API is not native on this browser. Text mode simulator fallback recommended.');
      }
    }
  }, []);

  // Handle call seconds stopwatch timer
  useEffect(() => {
    if (activeCallAgentId) {
      callTimerRef.current = setInterval(() => {
        setActiveCallStartSecs(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
      setActiveCallStartSecs(0);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCallAgentId]);

  // Format stopwatch
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Browser Voice Synthesis execution
  const speakAgentResponse = (text: string) => {
    if (isMuted) {
      // If muted, emulate typing text response and skip synth
      setActiveCallState('speaking');
      logEvent('TTS', 'Speech synthesized but muted by operator control panel.', { text });
      const timestamp = formatTime(activeCallStartSecs);
      setActiveCallTranscript(prev => [...prev, { sender: 'agent', text, timestamp }]);
      
      setTimeout(() => {
        setActiveCallState('listening');
        if (isVoiceMode) startSpeechRecognition();
      }, 2000);
      return;
    }

    setActiveCallState('speaking');
    const timestamp = formatTime(activeCallStartSecs);
    setActiveCallTranscript(prev => [...prev, { sender: 'agent', text, timestamp }]);
    logEvent('TTS', 'Generating voice synthesis waveform...', { characterCount: text.length });

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Cancel existing synthesis
      window.speechSynthesis.cancel();
      
      // Stop Speech recognition to avoid self-listening feedback loop
      stopSpeechRecognition();

      const utter = new SpeechSynthesisUtterance(text);
      utter.pitch = activeAgent.voiceSettings.pitch;
      utter.rate = activeAgent.voiceSettings.rate;
      
      // Try to match accent lang
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => 
        v.lang.toLowerCase().includes(activeAgent.voiceSettings.lang.toLowerCase()) || 
        v.lang.toLowerCase().startsWith(activeAgent.voiceSettings.lang.substring(0, 2).toLowerCase())
      );

      if (matchedVoice) {
        utter.voice = matchedVoice;
        logEvent('TTS', `Matched voice profile: ${matchedVoice.name} (${matchedVoice.lang})`);
      } else {
        logEvent('TTS', `Preferred voice language (${activeAgent.voiceSettings.lang}) not physically loaded in browser, defaulting.`);
      }

      utter.onend = () => {
        logEvent('SYSTEM', 'Speech audio stream ended. Reactivating STT listener.');
        setActiveCallState('listening');
        if (isVoiceMode && activeCallAgentId) {
          startSpeechRecognition();
        }
      };

      utter.onerror = (e) => {
        logEvent('SYSTEM', `SpeechSynthesis encountered error: ${e.error}`);
        setActiveCallState('listening');
        if (isVoiceMode && activeCallAgentId) {
          startSpeechRecognition();
        }
      };

      window.speechSynthesis.speak(utter);
    } else {
      // Emulate delay if SpeechSynthesis not supported
      logEvent('SYSTEM', 'Web SpeechSynthesis not supported in this browser client. Emulating audio lag.');
      setTimeout(() => {
        setActiveCallState('listening');
      }, Math.max(2500, text.length * 60));
    }
  };

  // Core NLP and response routing engine
  const processUserSpeechInput = (inputStr: string) => {
    if (!inputStr.trim()) return;

    // Clear interim text
    setCurrentInterimTranscript('');

    // Add to user chat log
    const timestamp = formatTime(activeCallStartSecs);
    setActiveCallTranscript(prev => [...prev, { sender: 'user', text: inputStr, timestamp }]);
    
    setActiveCallState('thinking');
    
    logEvent('STT', `Decoded vocal frequency: "${inputStr}"`);
    logEvent('LLM', 'Generating contextual response token stream...', {
      agentId: activeAgent.id,
      systemRules: activeAgent.systemPrompt.substring(0, 60) + '...'
    });

    // NLP search matching keyword lists
    setTimeout(() => {
      const matchedRule = activeAgent.nlpKeywords.find(rule => 
        rule.keywords.some(kw => inputStr.toLowerCase().includes(kw.toLowerCase()))
      );

      if (matchedRule) {
        logEvent('NLP', `Semantic rule trigger hit: [${matchedRule.keywords.join(', ')}]`);
        
        // If trigger is connected to an Action Tool
        if (matchedRule.triggerTool) {
          const tool = activeAgent.tools.find(t => t.name === matchedRule.triggerTool);
          if (tool) {
            setActiveToolCall({
              name: tool.name,
              description: tool.description,
              parameters: matchedRule.toolParams || tool.parameters,
              state: 'executing',
              output: ''
            });
            logEvent('TOOL', `Spawning action tool thread: ${tool.name}...`, {
              parameters: matchedRule.toolParams || tool.parameters
            });

            // Complete tool execution with mock response output
            setTimeout(() => {
              setActiveToolCall(prev => prev ? {
                ...prev,
                state: 'success',
                output: `STATUS 200 OK: Simulated pipeline trigger completed. Resulting tokens merged to context.`
              } : null);
              logEvent('TOOL', `Action tool execution returned success. Latency: 1140ms.`);
            }, 1300);
          }
        }

        speakAgentResponse(matchedRule.response);
      } else {
        // Generate a dynamic pseudo-LLM response if no exact keywords match
        // This matches key nouns inside user query or draws from default agent cards
        const defaults = activeAgent.defaultResponses;
        let textToSpeak = defaults[Math.floor(Math.random() * defaults.length)];

        if (inputStr.toLowerCase().includes('why') || inputStr.toLowerCase().includes('how')) {
          textToSpeak = `That is a profound point. When considering how we structure this, I recommend weighing the direct trade-offs. What primary goal are you aiming to achieve in this scenario?`;
        } else if (inputStr.toLowerCase().includes('hello') || inputStr.toLowerCase().includes('hi')) {
          textToSpeak = activeAgent.greeting;
        }

        logEvent('LLM', 'Inference finalized. Generating natural vocal synthesis.');
        speakAgentResponse(textToSpeak);
      }
    }, 1000);
  };

  // Starts Browser Speech Recognition
  const startSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      logEvent('SYSTEM', 'Cannot start STT: browser does not support SpeechRecognition.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = activeAgent.voiceSettings.lang;

      rec.onstart = () => {
        logEvent('STT', 'Browser vocal input gate OPENED. Speak into mic.');
      };

      rec.onresult = (evt: any) => {
        let interim = '';
        let final = '';

        for (let i = evt.resultIndex; i < evt.results.length; ++i) {
          if (evt.results[i].isFinal) {
            final += evt.results[i][0].transcript;
          } else {
            interim += evt.results[i][0].transcript;
          }
        }

        if (interim) {
          setCurrentInterimTranscript(interim);
        }

        if (final) {
          processUserSpeechInput(final);
        }
      };

      rec.onerror = (e: any) => {
        if (e.error === 'no-speech') {
          // Safe to ignore, just quiet background
          return;
        }
        logEvent('SYSTEM', `Speech recognition returned error: ${e.error}`);
      };

      rec.onend = () => {
        logEvent('SYSTEM', 'Speech input gate idle.');
        // If call is active and state remains listening, keep the engine hot!
        if (activeCallState === 'listening' && activeCallAgentId) {
          setTimeout(() => {
            if (activeCallState === 'listening' && activeCallAgentId) {
              try {
                rec.start();
              } catch (err) {
                // recognition already running
              }
            }
          }, 400);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      logEvent('SYSTEM', 'Failed to initialize browser audio recognition layers.');
    }
  };

  // Stops Browser Speech Recognition
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        logEvent('SYSTEM', 'Microphone input recognition suspended.');
      } catch (e) {
        // already stopped
      }
    }
  };

  // Connects Call
  const handleConnectCall = () => {
    if (activeCallAgentId) return;

    logEvent('SYSTEM', `Routing telephony trunk line to ${activeAgent.name}...`);
    setActiveCallAgentId(activeAgent.id);
    setActiveCallState('connecting');
    setActiveCallTranscript([]);
    setActiveCallStartSecs(0);
    setCurrentInterimTranscript('');
    setActiveToolCall(null);

    // Simulate dialing latency before starting
    setTimeout(() => {
      setActiveCallState('speaking');
      logEvent('SYSTEM', `Secured SSL Handshake with agent neural model.`);
      
      // Play the agent greeting
      speakAgentResponse(activeAgent.greeting);
    }, 1500);
  };

  // Disconnects & Archives Call to History
  const handleDisconnectCall = () => {
    if (!activeCallAgentId) return;

    logEvent('SYSTEM', 'Closing remote WebRTC voice channel...');
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopSpeechRecognition();

    // Create a beautiful Call History item summarizing the session!
    const duration = activeCallStartSecs;
    
    if (activeCallTranscript.length > 1) {
      const lastUserText = activeCallTranscript.find(t => t.sender === 'user')?.text || "general workflow queries";
      const generatedSummary = `User engaged ${activeAgent.name} (${activeAgent.role}) concerning: "${lastUserText}". Provided specialized procedural analysis and checked active telemetry loops.`;
      
      const satisfactionScore = Math.min(5, Math.max(3, Math.floor(3 + Math.random() * 3)));
      
      const newHistoryItem: SavedCall = {
        id: `call-${Date.now()}`,
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        agentAvatar: activeAgent.avatar,
        date: 'Just now',
        durationSeconds: duration,
        transcript: [...activeCallTranscript],
        metrics: {
          latencyMs: 290 + Math.floor(Math.random() * 140),
          sttConfidence: 0.95 + Math.random() * 0.04,
          sentiment: Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'mixed',
          wordsPerMin: 105 + Math.floor(Math.random() * 30),
          toolsCalled: activeCallTranscript.some(t => t.text.toLowerCase().includes('tool') || t.text.toLowerCase().includes('action')) ? 1 : 0
        },
        summary: generatedSummary,
        actionItems: [
          `Integrate ${activeAgent.name}'s parameters in daily operations tracker.`,
          "Review telemetry response delay averages.",
          "Export dialogue script to developer webhook."
        ],
        satisfactionScore
      };

      setHistory(prev => [newHistoryItem, ...prev]);
      logEvent('SYSTEM', 'Voice session compiled, analyzed, and archived in transcript vault.', {
        sessionDuration: duration,
        transcriptSize: activeCallTranscript.length
      });
    } else {
      logEvent('SYSTEM', 'Voice session too short to generate analytics. Discarded.');
    }

    // Reset States
    setActiveCallAgentId(null);
    setActiveCallState('idle');
    setActiveCallStartSecs(0);
    setCurrentInterimTranscript('');
    setActiveToolCall(null);
  };

  // Handle simulated keyboard fallback input submit
  const handleSendTextMsgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const msg = textInput;
    setTextInput('');

    if (!activeCallAgentId) {
      // Start a simulated call first if disconnected
      setActiveCallAgentId(activeAgent.id);
      setActiveCallState('connecting');
      setActiveCallTranscript([]);
      setActiveCallStartSecs(0);
      
      setTimeout(() => {
        setActiveCallState('speaking');
        logEvent('SYSTEM', `Secured connection. processing keyboard override stream...`);
        processUserSpeechInput(msg);
      }, 1000);
    } else {
      processUserSpeechInput(msg);
    }
  };

  // Interrupt capability
  const handleInterruptAgent = () => {
    if (activeCallState === 'speaking') {
      logEvent('SYSTEM', 'Operator triggered vocal interruption. Halting synthesizer output.');
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setActiveCallState('listening');
      if (isVoiceMode) {
        startSpeechRecognition();
      }
    }
  };

  // Inject new custom agent from AgentStudio creator
  const handleAgentCreated = (newAgent: VoiceAgent) => {
    setAgents(prev => [...prev, newAgent]);
    setSelectedAgentId(newAgent.id);
    setActiveTab('playground');
    logEvent('SYSTEM', `Successfully deployed Custom Voice Agent model: ${newAgent.name} (${newAgent.role})`);
  };

  // Delete call history items
  const handleDeleteCallLog = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
    logEvent('SYSTEM', `Purged call log [${id}] from database index.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12 selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Main Glass Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-violet-500/30">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  AURA.AI
                </h1>
                <span className="bg-indigo-950 text-indigo-400 border border-indigo-900 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold tracking-wider">
                  VOICE SUITE v4.2
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Dynamic NLP Persona Engine & LLM Speech Telemetry</p>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="flex flex-wrap items-center bg-slate-900/95 p-1 rounded-xl border border-slate-800/60">
            <button
              onClick={() => setActiveTab('playground')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'playground' 
                  ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
              }`}
            >
              🎙️ Agent Playground
            </button>
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'studio' 
                  ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
              }`}
            >
              ✨ Agent Studio
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'analytics' 
                  ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
              }`}
            >
              📊 Analytics & Logs
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'telemetry' 
                  ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
              }`}
            >
              ⚙️ Core Telemetry
            </button>
          </nav>

        </div>
      </header>

      {/* Main Page Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Tab 1: Playground (Active Call Stage) */}
        {activeTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Agent Selector & Details (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200 text-sm">1. Choose Voice Persona</h3>
                  <button 
                    onClick={() => setActiveTab('studio')}
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Create New
                  </button>
                </div>

                {/* Agent Scroll List */}
                <AgentList 
                  agents={agents} 
                  selectedAgentId={selectedAgentId}
                  onSelectAgent={(id) => {
                    if (activeCallAgentId) {
                      alert("Please hang up the current call before switching voice pipelines.");
                      return;
                    }
                    setSelectedAgentId(id);
                    logEvent('SYSTEM', `Voice route mapped to: ${id}`);
                  }}
                  activeCallAgentId={activeCallAgentId || undefined}
                />

                {/* Selected Agent Card Details */}
                <div className="bg-slate-950 border border-slate-800/60 rounded-xl p-4 space-y-3 select-none">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold uppercase text-indigo-400 font-mono">Active Matrix</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-slate-500">Online & Ready</span>
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed font-sans italic">
                    "{activeAgent.systemPrompt}"
                  </p>

                  <div className="border-t border-slate-900 pt-3 space-y-2 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Speech Accent:</span>
                      <span className="font-semibold text-slate-200 font-mono">{activeAgent.voiceSettings.lang}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Dynamic Tools:</span>
                      <span className="font-semibold text-amber-400 font-mono">{activeAgent.tools.length} Attached</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Gender/Pitch:</span>
                      <span className="font-semibold text-slate-200 font-mono capitalize">
                        {activeAgent.voiceSettings.gender} ({activeAgent.voiceSettings.pitch}x)
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Interactive Telemetry Quick Panel */}
              <div className="hidden lg:block">
                <TelemetryConsole 
                  events={telemetryEvents}
                  onClear={() => {
                    setTelemetryEvents([]);
                    logEvent('SYSTEM', 'Console logs cleared.');
                  }}
                />
              </div>
            </div>

            {/* Right Column: Active Interaction Arena (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Arena Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                
                {/* Interaction Mode Selector Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full ${activeCallAgentId ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                    <div>
                      <h2 className="font-bold text-slate-200 text-base">2. Voice Agent Sandbox</h2>
                      <p className="text-xs text-slate-400">Test the active voice link using native speech synthesis</p>
                    </div>
                  </div>

                  {/* Toggle between Voice Mic and Text Fallback */}
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850/80 shrink-0">
                    <button
                      onClick={() => {
                        setIsVoiceMode(true);
                        logEvent('SYSTEM', 'Swapped sandbox input mode to [Vocal Audio MIC].');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                        isVoiceMode 
                          ? 'bg-indigo-600 text-white shadow' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      Vocal Microphone
                    </button>
                    <button
                      onClick={() => {
                        setIsVoiceMode(false);
                        logEvent('SYSTEM', 'Swapped sandbox input mode to [Keyboard Message Fallback].');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                        !isVoiceMode 
                          ? 'bg-indigo-600 text-white shadow' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Keyboard className="w-3.5 h-3.5" />
                      Keyboard Text
                    </button>
                  </div>
                </div>

                {/* Active Telephone Call Frame */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  
                  {/* Call Controller Screen (5 cols) */}
                  <div className="md:col-span-5 bg-slate-950 rounded-2xl p-5 border border-slate-850 flex flex-col items-center justify-between min-h-[320px] text-center relative overflow-hidden select-none">
                    
                    {/* Small glowing top bar info */}
                    <div className="w-full flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span className="uppercase tracking-wider">{activeCallAgentId ? 'Secured Socket' : 'Standby Line'}</span>
                      {activeCallAgentId && (
                        <span className="text-emerald-400 font-bold animate-pulse">
                          LIVE: {formatTime(activeCallStartSecs)}
                        </span>
                      )}
                    </div>

                    {/* Main Avatar Orb indicator */}
                    <div className="my-4 space-y-3.5 relative">
                      <div className="relative inline-block">
                        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${activeAgent.gradient} flex items-center justify-center text-4xl shadow-2xl border-2 border-slate-800/90 group transition-all duration-500 ${
                          activeCallState === 'speaking' ? 'scale-105 ring-4 ring-violet-500/20' :
                          activeCallState === 'listening' ? 'scale-100 ring-4 ring-blue-500/20 animate-pulse' :
                          'scale-95'
                        }`}>
                          {activeAgent.avatar}
                        </div>
                        
                        {/* State micro badge */}
                        <span className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border border-slate-950 flex items-center justify-center text-[10px] ${
                          activeCallState === 'speaking' ? 'bg-green-500 text-white' :
                          activeCallState === 'listening' ? 'bg-blue-500 text-white animate-bounce' :
                          activeCallState === 'thinking' ? 'bg-amber-500 text-white' :
                          activeCallState === 'connecting' ? 'bg-purple-500 text-white' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {activeCallState === 'speaking' && '🔊'}
                          {activeCallState === 'listening' && '🎙️'}
                          {activeCallState === 'thinking' && '🧠'}
                          {activeCallState === 'connecting' && '📞'}
                          {activeCallState === 'idle' && '💤'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-slate-100">{activeAgent.name}</h3>
                        <p className="text-[10px] text-slate-500">{activeAgent.role}</p>
                      </div>
                    </div>

                    {/* Master connection toggle button */}
                    <div className="w-full space-y-2.5">
                      {activeCallAgentId ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleDisconnectCall}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-900/20 cursor-pointer transition"
                          >
                            <PhoneOff className="w-4 h-4" />
                            Hang Up Link
                          </button>
                          
                          {/* Mute synthesis toggler */}
                          <button
                            onClick={() => {
                              setIsMuted(!isMuted);
                              logEvent('SYSTEM', `Speech synthesis muted: ${!isMuted}`);
                            }}
                            className={`p-2.5 rounded-xl border transition cursor-pointer ${
                              isMuted 
                                ? 'bg-slate-850 text-rose-400 border-slate-800' 
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                            }`}
                            title={isMuted ? "Unmute agent speech" : "Mute agent speech"}
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleConnectCall}
                          className={`w-full flex items-center justify-center gap-2.5 py-3 bg-gradient-to-r ${activeAgent.gradient} hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-lg transition duration-200 cursor-pointer`}
                        >
                          <Phone className="w-4 h-4 animate-bounce" />
                          Establish Voice Link
                        </button>
                      )}

                      {/* Live status subtitles helper */}
                      <p className="text-[9px] text-slate-500 font-mono">
                        {activeCallState === 'idle' && 'Awaiting connection initialization...'}
                        {activeCallState === 'connecting' && 'Negotiating dialer frequency channels...'}
                        {activeCallState === 'listening' && 'Listening peak active. Talk freely.'}
                        {activeCallState === 'thinking' && 'Parsing natural language parameters...'}
                        {activeCallState === 'speaking' && 'Push-to-talk synthetic response active.'}
                      </p>
                    </div>

                  </div>

                  {/* Live Dialogues & Transcripts (7 cols) */}
                  <div className="md:col-span-7 flex flex-col justify-between bg-slate-950 rounded-2xl border border-slate-850 p-4 min-h-[320px]">
                    
                    {/* Dialogues Stream Container */}
                    <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[230px] scrollbar-thin scrollbar-thumb-slate-800">
                      {activeCallTranscript.length === 0 && activeCallState === 'idle' ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-2 py-8 select-none">
                          <Volume2 className="w-8 h-8 stroke-1 text-slate-700 animate-pulse" />
                          <p className="text-xs font-semibold text-slate-400">Pipeline Audio Log Empty</p>
                          <p className="text-[10px] text-slate-500 max-w-[80%]">
                            Click "Establish Voice Link" to dial the agent or select keyboard fallback simulation below.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activeCallTranscript.map((chat, idx) => (
                            <div 
                              key={idx}
                              className={`flex flex-col space-y-0.5 ${
                                chat.sender === 'user' ? 'items-end text-right' : 'items-start text-left'
                              }`}
                            >
                              <span className="text-[8px] text-slate-600 font-mono">
                                {chat.timestamp} - {chat.sender === 'user' ? 'Operator' : activeAgent.name}
                              </span>
                              <div className="flex items-center gap-1.5 max-w-[90%] group">
                                
                                {/* Interrupt control visible only on agent speech */}
                                {chat.sender === 'agent' && activeCallState === 'speaking' && idx === activeCallTranscript.length - 1 && (
                                  <button
                                    onClick={handleInterruptAgent}
                                    className="bg-red-950 hover:bg-red-900 text-red-400 text-[9px] font-bold px-2 py-1 rounded border border-red-900 animate-pulse transition cursor-pointer shrink-0"
                                    title="Click to Interrupt Speak"
                                  >
                                    Interrupt
                                  </button>
                                )}

                                <p className={`p-2.5 rounded-2xl text-[11.5px] leading-relaxed font-sans ${
                                  chat.sender === 'user' 
                                    ? 'bg-indigo-600 text-slate-50 rounded-tr-none shadow-md' 
                                    : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800'
                                }`}>
                                  {chat.text}
                                </p>
                              </div>
                            </div>
                          ))}

                          {/* Interim recognition feedback */}
                          {currentInterimTranscript && (
                            <div className="flex flex-col items-end space-y-0.5">
                              <span className="text-[8px] text-slate-500 font-mono">Interim Speech Decoding...</span>
                              <p className="bg-indigo-900/45 text-slate-300 p-2 rounded-2xl rounded-tr-none text-[11px] italic animate-pulse max-w-[90%] border border-indigo-800/30">
                                "{currentInterimTranscript}"
                              </p>
                            </div>
                          )}

                          {/* Agent thinking dots */}
                          {activeCallState === 'thinking' && (
                            <div className="flex flex-col items-start space-y-0.5">
                              <span className="text-[8px] text-slate-600 font-mono">{activeAgent.name} thinking...</span>
                              <div className="bg-slate-900 p-3 rounded-2xl rounded-tl-none border border-slate-850 flex gap-1 items-center">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Input Keyboard Form when mode selected */}
                    {!isVoiceMode ? (
                      <form 
                        onSubmit={handleSendTextMsgSubmit}
                        className="mt-3 flex gap-2 border-t border-slate-900 pt-3"
                      >
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Type fallback simulator query (e.g. 'mock interview')..."
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition font-sans"
                        />
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition cursor-pointer shadow-lg shadow-indigo-900/20 shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <div className="mt-3 text-center border-t border-slate-900 pt-2 select-none">
                        {activeCallAgentId ? (
                          <div className="flex justify-center items-center gap-2 text-[10px] text-indigo-400 font-mono">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                            Mic Hot: Talk out loud to interact or click below prompts
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-500 font-mono">
                            Telephony inactive. Open line to start microphone.
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </div>

                {/* Canvas Voice Waveform visualizer */}
                <div className="pt-2">
                  <VoiceVisualizer state={activeCallState} gradientColors={activeAgent.gradient} />
                </div>

                {/* Suggest Prompt Tags / Starter Chips */}
                <div className="space-y-2 select-none">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Vocal Suggestion Prompts (Tap to Speak)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {activeAgent.suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => {
                          logEvent('SYSTEM', `Operator clicked preset quick-prompt: "${prompt}"`);
                          
                          // If call not active, start call first
                          if (!activeCallAgentId) {
                            setActiveCallAgentId(activeAgent.id);
                            setActiveCallState('connecting');
                            setActiveCallTranscript([]);
                            setActiveCallStartSecs(0);
                            
                            setTimeout(() => {
                              setActiveCallState('speaking');
                              processUserSpeechInput(prompt);
                            }, 1000);
                          } else {
                            processUserSpeechInput(prompt);
                          }
                        }}
                        className="bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white text-xs border border-slate-850 hover:border-slate-750 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Interactive Live Tool call logs */}
              {activeToolCall && (
                <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 select-none">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                        <Terminal className="w-4 h-4 animate-spin-slow" />
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wide">Agent Tool Calling Invocation</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Pipeline Process Thread ID: #{Date.now().toString().substring(7)}</p>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono tracking-wider ${
                      activeToolCall.state === 'executing' 
                        ? 'bg-amber-950 text-amber-400 animate-pulse border border-amber-900' 
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                    }`}>
                      {activeToolCall.state}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    
                    {/* Left Tool Details */}
                    <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-850">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Function Schema Name</span>
                        <span className="font-bold text-amber-400">{activeToolCall.name}()</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Description</span>
                        <span className="text-slate-300 text-[10px] leading-relaxed">{activeToolCall.description}</span>
                      </div>
                    </div>

                    {/* Right Execution details */}
                    <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-850 flex flex-col justify-between">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Input Arguments</span>
                        <pre className="text-slate-400 text-[10px] font-mono p-1 rounded bg-slate-900/50 overflow-x-auto">
                          {activeToolCall.parameters}
                        </pre>
                      </div>
                      
                      <div className="pt-2 border-t border-slate-900/80">
                        <span className="text-slate-500 block text-[9px] uppercase">Tool Output Result</span>
                        <div className="text-[10px] font-sans">
                          {activeToolCall.state === 'executing' ? (
                            <span className="text-slate-500 italic flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                              Fetching remote database clusters...
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[9px]">
                              <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                              {activeToolCall.output}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Mobile Telemetry view fallback */}
              <div className="block lg:hidden">
                <TelemetryConsole 
                  events={telemetryEvents}
                  onClear={() => {
                    setTelemetryEvents([]);
                    logEvent('SYSTEM', 'Console logs cleared.');
                  }}
                />
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Agent Studio (Deploy New Agents) */}
        {activeTab === 'studio' && (
          <div className="max-w-4xl mx-auto">
            <AgentCreator onAgentCreated={handleAgentCreated} />
          </div>
        )}

        {/* Tab 3: Analytics & Completed Calls Archive */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <AnalyticsDashboard history={history} onDeleteCall={handleDeleteCallLog} />
          </div>
        )}

        {/* Tab 4: Advanced Telemetry Documentation */}
        {activeTab === 'telemetry' && (
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 text-slate-300 shadow-2xl">
            
            {/* Telemetry Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 text-base">Neural Telemetry Diagnostics</h3>
                <p className="text-xs text-slate-400">Understand how browser Speech Recognition and Speech Synthesis APIs interact</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed font-sans">
              
              {/* Column 1: Audio Flow */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-100 uppercase tracking-wider text-xs text-indigo-400">1. WebRTC Audio Pipeline Flow</h4>
                
                <div className="space-y-3">
                  
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                    <span className="font-bold text-slate-200 block">Vocal Input (STT)</span>
                    <p className="text-slate-400 mt-1">
                      Browser activates `SpeechRecognition` or `webkitSpeechRecognition` using user microphone. Sound wave signals are evaluated locally and converted to token string streams natively on the browser hardware.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                    <span className="font-bold text-slate-200 block">NLP Inference Logic (LLM Router)</span>
                    <p className="text-slate-400 mt-1">
                      Captured vocal text is processed by the neural persona context. Predefined semantic triggers identify matching keywords (like "resume" or "insomnia"), mapping workflow actions and triggering external tools.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                    <span className="font-bold text-slate-200 block">Vocal Synthesis Output (TTS)</span>
                    <p className="text-slate-400 mt-1">
                      HTML5 `SpeechSynthesis` generates the responding voice using selected language voice profiles. Rate, speed, and pitch are fully adjusted to emulate high-quality human response curves.
                    </p>
                  </div>

                </div>
              </div>

              {/* Column 2: Diagnostics Controls */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-100 uppercase tracking-wider text-xs text-amber-400">2. Live Telemetry Driver Emulators</h4>
                <p className="text-slate-400">
                  Trigger artificial pipeline triggers to check console telemetry rendering speeds and error handling.
                </p>

                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  
                  <button
                    onClick={() => {
                      logEvent('STT', 'DIAGNOSTIC: Simulating high-volume audio input signals.', {
                        dbVolume: '74dB',
                        clarityScore: 0.99,
                        detectedPhonetics: 'ah-l-e-x'
                      });
                    }}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-850 hover:border-slate-750 font-mono text-[10px] transition flex items-center justify-between px-4 cursor-pointer"
                  >
                    <span>⚡ Emulate Vocal Input signal</span>
                    <span className="text-sky-400">Trigger [STT]</span>
                  </button>

                  <button
                    onClick={() => {
                      logEvent('TOOL', 'DIAGNOSTIC: Executing manual schema check.', {
                        connectionPool: '10/10 active',
                        ping: '12ms',
                        region: 'us-east-1'
                      });
                    }}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-850 hover:border-slate-750 font-mono text-[10px] transition flex items-center justify-between px-4 cursor-pointer"
                  >
                    <span>⚙️ Emulate External Service Tool</span>
                    <span className="text-amber-400">Trigger [TOOL]</span>
                  </button>

                  <button
                    onClick={() => {
                      logEvent('SYSTEM', 'DIAGNOSTIC: Pipeline Network latency warning simulation.', {
                        packetLoss: '2.4%',
                        jitter: '45ms',
                        carrier: 'WebRTC Secure Audio Socket'
                      });
                    }}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-850 hover:border-slate-750 font-mono text-[10px] transition flex items-center justify-between px-4 cursor-pointer"
                  >
                    <span>⚠️ Emulate Pipeline Jitter spike</span>
                    <span className="text-rose-400">Trigger [SYSTEM]</span>
                  </button>

                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[11px] font-bold text-slate-200 block">API Permissions Checklist</span>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Microphone Permission:</span>
                      <span className="text-emerald-400 font-bold">GRANTED / DETECTED</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">HTML5 Audio Drivers:</span>
                      <span className="text-emerald-400 font-bold">ONLINE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Speech Synthesis API:</span>
                      <span className="text-emerald-400 font-bold">AVAILABLE</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Tech Stack Badge details */}
            <div className="bg-indigo-950/40 border border-indigo-900/60 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs select-none">
              <div className="space-y-0.5">
                <span className="font-bold text-indigo-300">Want to build this onto your production API servers?</span>
                <p className="text-slate-400 text-[11px]">Aura voice engines support easy webhooks to Twilio, Vapi, Retell, or LiveKit server architectures.</p>
              </div>
              
              <a 
                href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold transition text-center shrink-0 text-[11px]"
              >
                Read WebSpeech Documentation &rarr;
              </a>
            </div>

          </div>
        )}

      </main>
      
      {/* Global Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 text-center text-xs text-slate-600 select-none border-t border-slate-900 pt-6">
        <p>&copy; 2026 Aura.AI Voice Technologies Inc. All simulated telemetry nodes active.</p>
        <p className="mt-1 font-mono text-[10px] text-slate-700">
          Constructed using React 19, Vite, Tailwind CSS v4, and HTML5 Web Speech API.
        </p>
      </footer>

    </div>
  );
}
