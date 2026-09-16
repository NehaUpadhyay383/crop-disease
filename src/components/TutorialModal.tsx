import React, { useState } from 'react';
import { Camera, MapPin, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { SupportedLanguage } from '../types';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  language,
  onChangeLanguage,
}) => {
  const [slide, setSlide] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="font-bold text-xs uppercase tracking-wider text-stone-500">
              PestWatch Field Guide &bull; Step {slide} of 3
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Content */}
        <div className="p-6 text-center space-y-4">
          {slide === 1 && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">
                1. Capture Clear Symptom Photos
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                Take close-up photos of suspicious leaves, stems, or fruits (15–20 cm away). Avoid harsh sun glare and capture the boundary where healthy tissue meets the lesion.
              </p>
              <div className="p-3 bg-stone-50 rounded-xl text-stone-700 text-xs text-left max-w-xs mx-auto border border-stone-200">
                <p className="font-semibold text-emerald-800 mb-1">✓ Best Field Practice:</p>
                <p>&bull; 2 to 3 photos from different angles</p>
                <p>&bull; State how many days since symptoms began</p>
              </div>
            </div>
          )}

          {slide === 2 && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">
                2. Real-Time Community Alerts & Radar
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                Reports are automatically clustered by village and crop proximity. See what pest threats your neighbouring farmers are facing before they spread to your plot.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-950 text-xs text-left max-w-xs mx-auto border border-amber-200">
                <p className="font-semibold text-amber-900 mb-1">🛡️ Field Privacy First:</p>
                <p>We only display approximate village cluster centroids (~10–18 km radius). Exact GPS field boundaries remain confidential.</p>
              </div>
            </div>
          )}

          {slide === 3 && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto shadow-xs">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">
                3. Action Cards & Expert Escalation
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                Receive safe, expert-curated initial actions. Instead of reckless over-spraying, learn cultural sanitation first. When uncertain, flag your case directly for Extension Officer review.
              </p>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-950 text-xs text-left max-w-xs mx-auto border border-emerald-200">
                <p className="font-semibold text-emerald-900 mb-1">🔁 Crowd Feedback Loop:</p>
                <p>Report back with 1 tap whether the advice helped your crop to improve guidance for all local farmers.</p>
              </div>
            </div>
          )}
        </div>

        {/* Dots & Nav Footer */}
        <div className="p-5 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((dot) => (
              <span
                key={dot}
                className={`h-2 rounded-full transition-all ${
                  slide === dot ? 'w-6 bg-emerald-700' : 'w-2 bg-stone-300'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {slide < 3 ? (
              <button
                onClick={() => setSlide((s) => s + 1)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
