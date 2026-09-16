import React, { useState } from 'react';
import { Search, ShieldCheck, AlertTriangle, BookOpen, ChevronRight, Filter, CheckCircle2 } from 'lucide-react';
import { ActionCard } from '../types';

interface ActionCardLibraryProps {
  cards: ActionCard[];
  onSelectCard: (cardId: string) => void;
  adoptedCardIds: string[];
}

export const ActionCardLibrary: React.FC<ActionCardLibraryProps> = ({
  cards,
  onSelectCard,
  adoptedCardIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');

  const filteredCards = cards.filter((card) => {
    const matchesCrop = selectedCrop === 'All' || card.cropType.toLowerCase() === selectedCrop.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      card.title.toLowerCase().includes(query) ||
      card.pestOrDiseaseName.toLowerCase().includes(query) ||
      card.symptomDescription.toLowerCase().includes(query);
    return matchesCrop && matchesQuery;
  });

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'severe':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-800">
            Severe Outbreak
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800">
            High Risk
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
            Manageable
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Expert-Curated Advisory Protocol</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Action Cards Library
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
            Standardized, low-risk field action cards created and reviewed by regional agricultural extension officers. Each card provides step-by-step cultural sanitation, monitoring triggers, and responsible input guidance.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-stone-100">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by pest, disease, or symptom (e.g. early blight, whorl frass)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['All', 'Tomato', 'Maize', 'Chili', 'Rice', 'Potato'].map((crop) => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`px-3 py-2 rounded-xl font-semibold transition-all shrink-0 ${
                  selectedCrop === crop
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card) => {
          const totalFeedback = card.helpedYesCount + card.helpedNoCount + card.helpedNotSureCount;
          const helpRate = totalFeedback > 0 ? Math.round((card.helpedYesCount / totalFeedback) * 100) : 88;
          const isAdopted = adoptedCardIds.includes(card.id);

          return (
            <div
              key={card.id}
              onClick={() => onSelectCard(card.id)}
              className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[11px] font-bold uppercase">
                    {card.cropType}
                  </span>
                  {getRiskBadge(card.riskLevel)}
                </div>

                <h3 className="font-bold text-stone-900 text-base group-hover:text-emerald-800 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-stone-500 italic mt-0.5 font-serif">
                  {card.pestOrDiseaseName}
                </p>

                <p className="text-xs text-stone-600 mt-2.5 line-clamp-2 leading-relaxed">
                  {card.symptomDescription}
                </p>

                {/* Checklist Preview */}
                <div className="mt-3 pt-3 border-t border-stone-100 space-y-1 text-xs text-stone-600">
                  <p className="font-semibold text-stone-700 text-[11px]">Key Symptoms:</p>
                  {card.symptomChecklist.slice(0, 2).map((item, idx) => (
                    <p key={idx} className="flex items-center gap-1.5 text-[11px] truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span className="truncate">{item}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-emerald-800 font-semibold text-[11px]">
                  <span>⭐ {helpRate}% helped</span>
                  <span className="text-stone-400 font-normal">({totalFeedback})</span>
                </div>

                <div className="flex items-center gap-2">
                  {isAdopted && (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>View Card</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
