import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { Sparkles, Wrench, ShieldCheck, Award, X, Play } from 'lucide-react';

export function JudgeDemoScenarios({ onOpenKnowBot }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);

  const triggerScenario = (scenario) => {
    setActiveScenario(scenario.id);
    switch (scenario.id) {
      case 'lab_crisis':
        navigate(ROUTES.EQUIPMENT);
        if (onOpenKnowBot) {
          setTimeout(() => {
            onOpenKnowBot();
          }, 600);
        }
        break;
      case 'dean_audit':
        navigate(ROUTES.ADMIN);
        break;
      case 'student_incentive':
        navigate(ROUTES.PROFILE);
        break;
      case 'skill_gap':
        navigate(ROUTES.PLACEMENTS);
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/30 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider text-[10px] bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
              ⚡ Judge Live Demo Presets
            </span>
          </div>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-[11px] text-slate-300">
            1-Click Pitch Journeys:
          </span>

          {/* Preset 1 */}
          <button
            onClick={() => triggerScenario({ id: 'lab_crisis' })}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1.5 ${
              activeScenario === 'lab_crisis'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
            title="Demonstrate physical lab hardware failure & instant KnowBot RAG troubleshooting"
          >
            <Wrench className="w-3 h-3 text-rose-300" />
            <span>1. Lab Hardware Crisis (DGX OOM)</span>
          </button>

          {/* Preset 2 */}
          <button
            onClick={() => triggerScenario({ id: 'student_incentive' })}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1.5 ${
              activeScenario === 'student_incentive'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
            title="Demonstrate 1-Click Dean's LOR Certificate generator and DGX GPU Quotas"
          >
            <Award className="w-3 h-3 text-amber-300" />
            <span>2. Dean's LOR & GPU Quotas</span>
          </button>

          {/* Preset 3 */}
          <button
            onClick={() => triggerScenario({ id: 'dean_audit' })}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1.5 ${
              activeScenario === 'dean_audit'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
            title="Demonstrate NAAC/NBA Accreditation Audit Exporter & Graduating ERP Batch Ingestion"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-300" />
            <span>3. Dean NAAC Audit & ERP Ingest</span>
          </button>

          {/* Preset 4 */}
          <button
            onClick={() => triggerScenario({ id: 'skill_gap' })}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1.5 ${
              activeScenario === 'skill_gap'
                ? 'bg-indigo-500 text-white shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
            title="Demonstrate student industry skill gap upvoting directly to Dean"
          >
            <Play className="w-3 h-3 text-indigo-300" />
            <span>4. Living Curriculum Skill Gaps</span>
          </button>
        </div>
      </div>
    </div>
  );
}
