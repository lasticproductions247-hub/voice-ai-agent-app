import { VoiceAgent } from '../data/agents';
import { Mic, Sparkles, Check } from 'lucide-react';

interface AgentListProps {
  agents: VoiceAgent[];
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
  activeCallAgentId?: string;
}

export default function AgentList({ agents, selectedAgentId, onSelectAgent, activeCallAgentId }: AgentListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Agents ({agents.length})</h4>
        {activeCallAgentId && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-950/80 text-red-400 text-[10px] font-mono rounded-full border border-red-900/60 animate-pulse">
            <Mic className="w-2.5 h-2.5 animate-bounce" />
            Live Connection
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          const isActiveCall = activeCallAgentId === agent.id;
          const isCustom = agent.id.startsWith('custom-');

          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer duration-200 group relative overflow-hidden flex items-center justify-between ${
                isSelected 
                  ? 'bg-slate-900 border-slate-700 shadow-lg' 
                  : 'bg-slate-950/60 border-slate-900 hover:border-slate-800 hover:bg-slate-900/30'
              }`}
            >
              {/* Selection accent line */}
              {isSelected && (
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${agent.gradient}`} />
              )}

              <div className="flex items-center gap-3.5 min-w-0">
                {/* Avatar Orb with Agent Gradient */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-inner shrink-0 text-lg group-hover:scale-105 transition-transform`}>
                  {agent.avatar}
                </div>
                
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-100 text-xs tracking-wide group-hover:text-white transition-colors truncate">
                      {agent.name}
                    </span>
                    {isCustom && (
                      <span className="inline-flex items-center gap-0.5 px-1 bg-violet-950 text-violet-300 text-[8px] rounded border border-violet-900 font-medium">
                        <Sparkles className="w-2 h-2 text-violet-400" />
                        Custom
                      </span>
                    )}
                    {isActiveCall && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{agent.role}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {agent.tools.slice(0, 2).map((t) => (
                      <span key={t.name} className="bg-slate-900 text-slate-400 border border-slate-800/80 text-[8px] px-1 rounded font-mono uppercase tracking-wider">
                        ⚙️ {t.name}
                      </span>
                    ))}
                    {agent.tools.length > 2 && (
                      <span className="text-[8px] text-slate-500">+{agent.tools.length - 2} more</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                {isSelected ? (
                  <div className={`p-1 rounded-full ${agent.bgLight} ${agent.textColor}`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors font-medium">Select</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
