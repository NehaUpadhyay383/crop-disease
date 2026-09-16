import React, { useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, HelpCircle, CheckCircle2, X } from 'lucide-react';
import { ActionCard } from '../types';

interface FeedbackBannerProps {
  card: ActionCard;
  onFeedback: (cardId: string, helped: 'yes' | 'no' | 'not_sure', comment?: string) => void;
  onDismiss: () => void;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  card,
  onFeedback,
  onDismiss,
}) => {
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleVote = (helped: 'yes' | 'no' | 'not_sure') => {
    onFeedback(card.id, helped, comment || undefined);
    setSubmitted(true);
    setTimeout(() => {
      onDismiss();
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="bg-emerald-800 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-3 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>Thank you! Your feedback improves advice calibration for your entire farming block.</span>
        </div>
        <button onClick={onDismiss} className="text-emerald-200 hover:text-white text-xs">
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-stone-900 to-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Field Follow-up Check
          </span>
          <span className="text-[11px] text-stone-400">
            &bull; Action Card: {card.title}
          </span>
        </div>
        <p className="text-sm font-bold text-stone-100">
          Did the recommended guidance improve your {card.cropType} crop condition?
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          onClick={() => handleVote('yes')}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Yes, clearly</span>
        </button>

        <button
          onClick={() => handleVote('no')}
          className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>No, not really</span>
        </button>

        <button
          onClick={() => handleVote('not_sure')}
          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors border border-stone-700"
        >
          Not sure yet
        </button>

        <button
          onClick={onDismiss}
          className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors ml-1"
          title="Dismiss check"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
