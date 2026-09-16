import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Beaker,
  PhoneCall,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';
import { ActionCard } from '../types';

interface ActionCardModalProps {
  card: ActionCard;
  isOpen: boolean;
  onClose: () => void;
  onAdoptAction: (cardId: string) => void;
  onGiveFeedback: (cardId: string, helped: 'yes' | 'no' | 'not_sure', comment?: string) => void;
  hasAdopted?: boolean;
}

export const ActionCardModal: React.FC<ActionCardModalProps> = ({
  card,
  isOpen,
  onClose,
  onAdoptAction,
  onGiveFeedback,
  hasAdopted = false,
}) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackResponse, setFeedbackResponse] = useState<'yes' | 'no' | 'not_sure' | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);

  if (!isOpen) return null;

  const totalFeedback = card.helpedYesCount + card.helpedNoCount + card.helpedNotSureCount;
  const helpRate = totalFeedback > 0 ? Math.round((card.helpedYesCount / totalFeedback) * 100) : 85;

  const handleAdopt = () => {
    onAdoptAction(card.id);
  };

  const submitFeedback = (response: 'yes' | 'no' | 'not_sure') => {
    setFeedbackResponse(response);
    onGiveFeedback(card.id, response, feedbackComment);
    setFeedbackGiven(true);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'severe':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> High Urgency Outbreak
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> High Risk Alert
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Moderate / Manageable
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md bg-stone-200 text-stone-800">
                {card.cropType}
              </span>
              {getRiskBadge(card.riskLevel)}
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                ⭐ {helpRate}% farmers said this helped ({totalFeedback} reviews)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              {card.title}
            </h2>
            <p className="text-sm text-stone-600 mt-1 italic font-serif">
              Scientific/Pest: {card.pestOrDiseaseName}
            </p>
          </div>

          <button
            id="close-action-card-btn"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors shrink-0"
            aria-label="Close Action Card"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-800 text-sm">
          {/* Transparent Confidence & Safety Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs uppercase tracking-wider text-amber-800">
                Safe First-Response Protocol
              </p>
              <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                This Action Card provides low-risk, expert-curated initial actions. It is designed to buy time and prevent spread without unnecessary pesticide expense. If symptoms worsen, request on-site extension review.
              </p>
            </div>
          </div>

          {/* Symptom Checklist */}
          <div>
            <h3 className="font-bold text-stone-900 text-base mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>Symptom Verification Checklist</span>
            </h3>
            <p className="text-xs text-stone-600 mb-3">{card.symptomDescription}</p>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {card.symptomChecklist.map((symptom, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{symptom}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Immediate Low-Risk Actions */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white font-bold text-xs uppercase">
                Step 1
              </span>
              <h3 className="font-bold text-emerald-950 text-base">
                Immediate Low-Risk Actions (Cultural & Mechanical)
              </h3>
            </div>
            <ul className="space-y-2 mt-3">
              {card.stepsImmediate.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-emerald-950">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Step 2: Monitoring Instructions */}
          <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="px-2 py-0.5 rounded-md bg-sky-700 text-white font-bold text-xs uppercase">
                Step 2
              </span>
              <h3 className="font-bold text-sky-950 text-base flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-700" />
                <span>Field Monitoring Instructions (Next 48–72 Hours)</span>
              </h3>
            </div>
            <ul className="space-y-2 mt-3">
              {card.stepsMonitoring.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-sky-950">
                  <span className="w-2 h-2 rounded-full bg-sky-600 mt-1.5 shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Step 3: Chemical Guidance (if needed) */}
          {card.stepsChemical && (
            <div className="p-5 rounded-2xl bg-stone-100 border border-stone-300/80">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-stone-700 text-white font-bold text-xs uppercase">
                  Step 3
                </span>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                  <Beaker className="w-4 h-4 text-stone-700" />
                  <span>Targeted Chemistry & Safety Guidance (If Above Threshold)</span>
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mt-2">
                {card.stepsChemical}
              </p>
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Avoid unnecessary preventive spraying:</strong> Misuse destroys beneficial predatory insects and triggers pesticide resistance. Always respect Pre-Harvest Intervals (PHI).
                </span>
              </div>
            </div>
          )}

          {/* Step 4: When to Call an Expert */}
          <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md bg-rose-700 text-white font-bold text-xs uppercase">
                Step 4
              </span>
              <h3 className="font-bold text-rose-950 text-base flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-rose-700" />
                <span>When to Escalate for Extension Officer Inspection</span>
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-rose-950 leading-relaxed mt-1">
              {card.whenToEscalate}
            </p>
          </div>

          {/* Verified by Sign-off */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-200">
            <div>
              <p className="font-medium text-stone-700">Curated & Verified by: {card.createdByExpertName}</p>
              <p className="text-[11px] text-stone-500">{card.expertAffiliation}</p>
            </div>
            <span className="text-[11px] text-stone-400">Card ID: {card.id}</span>
          </div>

          {/* In-Card User Feedback Loop */}
          <div className="pt-4 border-t border-stone-200 bg-stone-50 -mx-6 -mb-6 p-6">
            {!feedbackGiven ? (
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                    Did this action guidance help your crop?
                  </h4>
                  <span className="text-[11px] text-emerald-700 font-medium">Community feedback loop</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    id="feedback-yes-btn"
                    onClick={() => submitFeedback('yes')}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-stone-300 text-stone-800 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-800 transition-colors flex items-center gap-1.5"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" /> Yes, clearly improved
                  </button>
                  <button
                    id="feedback-no-btn"
                    onClick={() => submitFeedback('no')}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-stone-300 text-stone-800 hover:bg-rose-50 hover:border-rose-400 hover:text-rose-800 transition-colors flex items-center gap-1.5"
                  >
                    <ThumbsDown className="w-3.5 h-3.5 text-rose-600" /> No, not really
                  </button>
                  <button
                    id="feedback-not-sure-btn"
                    onClick={() => submitFeedback('not_sure')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    Not sure yet
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-100/80 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Thank you! Your feedback helps calibrate confidence scores for farmers across your district.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-medium text-xs sm:text-sm transition-colors"
          >
            Close
          </button>

          <button
            id="adopt-action-btn"
            onClick={handleAdopt}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 ${
              hasAdopted
                ? 'bg-stone-800 text-white hover:bg-stone-700'
                : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-700/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{hasAdopted ? '✓ You committed to this action' : 'I will try this action'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
