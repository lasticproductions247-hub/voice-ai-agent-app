import { useState } from 'react';
import { VoiceAgent, Tool } from '../data/agents';
import { Sparkles, Save, RefreshCw, Volume2, Settings, Trash2, Plus } from 'lucide-react';

interface AgentCreatorProps {
  onAgentCreated: (agent: VoiceAgent) => void;
}

const AVAILABLE_TEMPLATES = [
  {
    name: 'Legal Consultant',
    role: 'AI Contracts & Law Specialist',
    avatar: '⚖️',
    gradient: 'from-amber-600 to-yellow-700',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-700',
    greeting: "Greetings. I am your AI Legal Consultant. I can analyze contract clauses, explain NDA guidelines, or prepare mock depositions. How can I assist with your legal query today?",
    systemPrompt: "You are a professional, meticulous AI Legal Assistant. You speak in a slow, measured tone, outlining legal terms clearly while providing warnings that you are an assistant, not an attorney.",
    tools: [
      {
        name: 'AnalyzeContractClause',
        description: 'Performs high-speed anomaly detection in NDAs or terms of service agreements.',
        parameters: '{"agreementType": "NDA", "jurisdiction": "Delaware"}',
        icon: 'Scale'
      }
    ]
  },
  {
    name: 'Nutrition & Workout Coach',
    role: 'Personal Fitness & Diet Planner',
    avatar: '🍎',
    gradient: 'from-lime-500 to-emerald-600',
    bgLight: 'bg-lime-50',
    textColor: 'text-lime-600',
    greeting: "Hey! Ready to hit your health goals? I am your Nutrition and Workout Planner. Let's dial in your macros, configure a high-performance splits program, or calculate your calorie targets. What's the plan?",
    systemPrompt: "You are a highly energetic, upbeat athletic trainer and dietician. You use fitness terms, encourage healthy lifestyle habits, and offer custom macro calculators.",
    tools: [
      {
        name: 'CalculateMacros',
        description: 'Calculates optimal daily protein, carbs, and fat target breakdown based on weight and goals.',
        parameters: '{"weightLbs": 170, "goal": "fat_loss", "bodyType": "mesomorph"}',
        icon: 'TrendingUp'
      }
    ]
  },
  {
    name: 'Real Estate Agent',
    role: 'Property Search & Mortgage Advisor',
    avatar: '🏡',
    gradient: 'from-violet-500 to-pink-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    greeting: "Hello! I am your Real Estate Advisor. I can fetch current MLS properties in your zip code, estimate monthly mortgage payments, or draft schedule views. What kind of home are we searching for?",
    systemPrompt: "You are a warm, charming, and highly knowledgeable real estate agent. You know property pricing, tax incentives, and school districts inside-out.",
    tools: [
      {
        name: 'QueryMLSProperties',
        description: 'Searches live property databases for single-family homes, townhouses, or condos.',
        parameters: '{"zipCode": "90210", "maxPrice": 950000}',
        icon: 'Home'
      }
    ]
  }
];

const GRADIENTS = [
  { label: 'Indigo Ocean', value: 'from-blue-500 to-cyan-600', bgLight: 'bg-blue-50', textColor: 'text-blue-600' },
  { label: 'Emerald Garden', value: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600' },
  { label: 'Amber Sunshine', value: 'from-orange-500 to-amber-600', bgLight: 'bg-orange-50', textColor: 'text-orange-600' },
  { label: 'Purple Rain', value: 'from-purple-500 to-indigo-600', bgLight: 'bg-purple-50', textColor: 'text-purple-600' },
  { label: 'Rose Petal', value: 'from-rose-500 to-pink-600', bgLight: 'bg-rose-50', textColor: 'text-rose-600' },
  { label: 'Sunset Glow', value: 'from-amber-600 to-yellow-700', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
  { label: 'Lime Grove', value: 'from-lime-500 to-emerald-600', bgLight: 'bg-lime-50', textColor: 'text-lime-600' }
];

const EMOJIS = ['⚖️', '🍎', '🏡', '🤖', '🧠', '📈', '🎨', '⚡', '💼', '🩺', '🍿', '🍳', '🎸', '🎮'];

export default function AgentCreator({ onAgentCreated }: AgentCreatorProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('🤖');
  const [selectedGradIdx, setSelectedGradIdx] = useState(0);
  const [greeting, setGreeting] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  
  // Voice Settings
  const [voiceLang, setVoiceLang] = useState('en-US');
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female' | 'neutral'>('female');

  // Custom trigger keywords & responses
  const [keywordInput, setKeywordInput] = useState('');
  const [responseInput, setResponseInput] = useState('');
  const [triggers, setTriggers] = useState<{ keywords: string[]; response: string }[]>([
    { keywords: ['hello', 'hi', 'hey'], response: "Hey there! I'm completely tuned in and ready to help you." }
  ]);

  // Custom tools selection
  const [activeTools, setActiveTools] = useState<Tool[]>([
    { name: 'GoogleSearchEngine', description: 'Queries general Google knowledge indices.', parameters: '{"query": "string"}', icon: 'Search' }
  ]);
  const [newToolName, setNewToolName] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');
  const [newToolParams, setNewToolParams] = useState('{"param": "value"}');

  const applyTemplate = (tpl: typeof AVAILABLE_TEMPLATES[0]) => {
    setName(tpl.name);
    setRole(tpl.role);
    setAvatar(tpl.avatar);
    setGreeting(tpl.greeting);
    setSystemPrompt(tpl.systemPrompt);
    setActiveTools(tpl.tools);

    // Match gradient if possible
    const gradIdx = GRADIENTS.findIndex(g => g.value === tpl.gradient);
    if (gradIdx !== -1) setSelectedGradIdx(gradIdx);
  };

  const handleAddTrigger = () => {
    if (!keywordInput.trim() || !responseInput.trim()) return;
    
    const keywords = keywordInput.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    if (keywords.length === 0) return;

    setTriggers([...triggers, { keywords, response: responseInput }]);
    setKeywordInput('');
    setResponseInput('');
  };

  const handleRemoveTrigger = (index: number) => {
    setTriggers(triggers.filter((_, i) => i !== index));
  };

  const handleAddTool = () => {
    if (!newToolName.trim() || !newToolDesc.trim()) return;
    const cleanName = newToolName.replace(/\s+/g, '');
    const tool: Tool = {
      name: cleanName,
      description: newToolDesc,
      parameters: newToolParams,
      icon: 'Code'
    };
    setActiveTools([...activeTools, tool]);
    setNewToolName('');
    setNewToolDesc('');
    setNewToolParams('{"param": "value"}');
  };

  const handleRemoveTool = (index: number) => {
    setActiveTools(activeTools.filter((_, i) => i !== index));
  };

  const handleSaveAgent = () => {
    if (!name.trim() || !role.trim() || !greeting.trim() || !systemPrompt.trim()) {
      alert('Please fill in all core agent fields (Name, Role, Greeting, and System Prompt).');
      return;
    }

    const newAgent: VoiceAgent = {
      id: `custom-${Date.now()}`,
      name,
      role,
      avatar,
      gradient: GRADIENTS[selectedGradIdx].value,
      bgLight: GRADIENTS[selectedGradIdx].bgLight,
      textColor: GRADIENTS[selectedGradIdx].textColor,
      greeting,
      systemPrompt,
      suggestedPrompts: triggers.slice(0, 3).map(t => `Say "${t.keywords[0]}"`),
      voiceSettings: {
        lang: voiceLang,
        pitch: voicePitch,
        rate: voiceRate,
        gender: voiceGender
      },
      tools: activeTools,
      nlpKeywords: triggers.map(t => ({
        keywords: t.keywords,
        response: t.response
      })),
      defaultResponses: [
        `As a customized agent, I am focusing on: ${systemPrompt.substring(0, 60)}... What details should we review next?`,
        "That matches my special instructions closely. Tell me more about what you would like to achieve.",
        "Understood. Let's trace that path and run any connected workflows.",
        "Excellent. Let me document that. Please continue speaking!"
      ]
    };

    onAgentCreated(newAgent);

    // Reset Form
    setName('');
    setRole('');
    setGreeting('');
    setSystemPrompt('');
    setTriggers([{ keywords: ['hello', 'hi', 'hey'], response: "Hey there! I'm completely tuned in and ready to help you." }]);
    setActiveTools([{ name: 'GoogleSearchEngine', description: 'Queries general Google knowledge indices.', parameters: '{"query": "string"}', icon: 'Search' }]);
  };

  const handleTestVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(
        greeting || `Hi! I am ${name || 'your custom agent'}. My voice synthesis is fully active!`
      );
      utter.pitch = voicePitch;
      utter.rate = voiceRate;
      
      // Attempt to pick a matching voice from browser available voices
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang.includes(voiceLang));
      if (matchedVoice) utter.voice = matchedVoice;

      window.speechSynthesis.speak(utter);
    } else {
      alert('Speech synthesis is not fully supported on this browser.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-slate-200 select-none">
      
      {/* Creator Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-violet-600/20 rounded-lg border border-violet-500/30">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Agent Studio</h3>
            <p className="text-xs text-slate-400">Forge customized Voice AI personas & toolkits</p>
          </div>
        </div>
        <button
          onClick={handleSaveAgent}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-900/30 transition"
        >
          <Save className="w-3.5 h-3.5" />
          Deploy Agent
        </button>
      </div>

      {/* Apply Template Quick Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fast-Start Templates</label>
        <div className="grid grid-cols-3 gap-2.5">
          {AVAILABLE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.name}
              onClick={() => applyTemplate(tpl)}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-center group transition duration-200 cursor-pointer"
            >
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{tpl.avatar}</span>
              <span className="font-medium text-[11px] text-slate-200 truncate max-w-full">{tpl.name}</span>
              <span className="text-[9px] text-slate-500 truncate max-w-full">{tpl.role}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Form: Core Settings */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            1. Persona Configuration
          </h4>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs text-slate-400">Agent Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sarah"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Avatar</label>
              <select
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition cursor-pointer"
              >
                {EMOJIS.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Professional Title / Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., AI Contracts & Law Specialist"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          {/* Theme selection */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Brand Identity Theme</label>
            <div className="flex flex-wrap gap-1.5">
              {GRADIENTS.map((grad, idx) => (
                <button
                  key={grad.label}
                  onClick={() => setSelectedGradIdx(idx)}
                  className={`h-6 px-2 text-[10px] font-medium rounded-full border cursor-pointer transition ${
                    selectedGradIdx === idx
                      ? 'border-white text-white bg-slate-800'
                      : 'border-slate-800 text-slate-400 bg-slate-950/50 hover:border-slate-700'
                  }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${grad.value} mr-1`} />
                  {grad.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Voice Greeting Message (Spoken upon connection)</label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder="Write the spoken opener..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">System Prompt / Instructions (AI Mindset)</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Tell the AI how to reason, act, express emotions, or prioritize knowledge..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition resize-none leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Right Form: TTS Voice Config & Tool Selection */}
        <div className="space-y-5">
          
          {/* Voice Calibration */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                2. Speech Calibration
              </h4>
              <button
                onClick={handleTestVoice}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2.5 py-1 rounded-lg transition flex items-center gap-1 border border-slate-700/60"
              >
                <RefreshCw className="w-3 h-3 animate-spin-slow" />
                Test Speech
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Accent / Language Code</label>
                <select
                  value={voiceLang}
                  onChange={(e) => setVoiceLang(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 cursor-pointer focus:outline-none"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish (Spain)</option>
                  <option value="es-MX">Spanish (Mexico)</option>
                  <option value="fr-FR">French (France)</option>
                  <option value="de-DE">German (Germany)</option>
                  <option value="it-IT">Italian (Italy)</option>
                  <option value="ja-JP">Japanese (Japan)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Voice Gender Bias</label>
                <select
                  value={voiceGender}
                  onChange={(e) => setVoiceGender(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 cursor-pointer focus:outline-none"
                >
                  <option value="female">Female Accent</option>
                  <option value="male">Male Accent</option>
                  <option value="neutral">Gender Neutral</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Pitch Calibration</span>
                  <span className="text-violet-400 font-mono">{voicePitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={voicePitch}
                  onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Speech Rate (Speed)</span>
                  <span className="text-violet-400 font-mono">{voiceRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={voiceRate}
                  onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* AI Trigger Overrides (NLP responses) */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              3. Custom Spoken Trigger Rules (NLP)
            </h4>
            <p className="text-[10px] text-slate-400">
              Specify keywords that, when detected in user speech, instantly direct the agent's response.
            </p>

            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Trigger keywords (comma separated: e.g., budget, discount, sale)"
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  value={responseInput}
                  onChange={(e) => setResponseInput(e.target.value)}
                  placeholder="Spoken Response when keywords are spoken..."
                  rows={1}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <button
                onClick={handleAddTrigger}
                className="w-full py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs rounded-lg border border-indigo-500/30 font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Attach Speech Trigger Rule
              </button>
            </div>

            {/* Trigger list scroll */}
            <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
              {triggers.map((trig, i) => (
                <div key={i} className="flex items-start justify-between bg-slate-900 p-2 rounded border border-slate-800/80 text-[10px]">
                  <div className="space-y-0.5 max-w-[85%]">
                    <div className="flex flex-wrap gap-1">
                      {trig.keywords.map(k => (
                        <span key={k} className="bg-indigo-950 text-indigo-300 px-1.5 rounded font-semibold text-[9px] border border-indigo-900">
                          {k}
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-400 truncate italic">{trig.response}</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveTrigger(i)}
                    className="text-slate-500 hover:text-rose-400 p-0.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Action Tools Selection */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              4. Advanced Action Tools (Agent Capabilities)
            </h4>
            <p className="text-[10px] text-slate-400">
              Attach executable tools that the agent can invoke programmatically during calls.
            </p>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newToolName}
                  onChange={(e) => setNewToolName(e.target.value)}
                  placeholder="ToolName (No spaces)"
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-slate-300 focus:outline-none"
                />
                <input
                  type="text"
                  value={newToolParams}
                  onChange={(e) => setNewToolParams(e.target.value)}
                  placeholder="Params JSON Schema"
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-slate-300 font-mono focus:outline-none"
                />
              </div>
              <input
                type="text"
                value={newToolDesc}
                onChange={(e) => setNewToolDesc(e.target.value)}
                placeholder="What is the purpose of this tool?"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-slate-300 focus:outline-none"
              />
              <button
                onClick={handleAddTool}
                className="w-full py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs rounded-lg border border-amber-500/30 font-medium flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Attach Custom Tool capability
              </button>
            </div>

            <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
              {activeTools.map((tool, i) => (
                <div key={i} className="flex items-start justify-between bg-slate-900 p-2 rounded border border-slate-800/80 text-[10px]">
                  <div className="space-y-0.5">
                    <span className="font-mono text-amber-400 font-bold">{tool.name}</span>
                    <p className="text-slate-400 text-[9px]">{tool.description}</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveTool(i)}
                    className="text-slate-500 hover:text-rose-400 p-0.5 transition cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
