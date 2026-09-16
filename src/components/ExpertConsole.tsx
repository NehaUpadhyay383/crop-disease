import React, { useState } from 'react';
import {
  Stethoscope,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  PlusCircle,
  Link as LinkIcon,
  ShieldCheck,
  Search,
  Filter,
  User,
  MapPin,
  Eye,
  FileText,
  Check,
} from 'lucide-react';
import { ActionCard, ExpertReview, Report } from '../types';
import { formatRelativeTime } from '../utils/geo';

interface ExpertConsoleProps {
  reports: Report[];
  actionCards: ActionCard[];
  onRespondToReport: (
    reportId: string,
    adviceText: string,
    linkedActionCardId?: string,
    confidenceLevel?: 'high' | 'moderate' | 'field_visit_required'
  ) => void;
  onCreateActionCard: (newCard: Omit<ActionCard, 'id' | 'createdAt' | 'updatedAt' | 'helpedYesCount' | 'helpedNoCount' | 'helpedNotSureCount'>) => void;
}

export const ExpertConsole: React.FC<ExpertConsoleProps> = ({
  reports,
  actionCards,
  onRespondToReport,
  onCreateActionCard,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    reports.find((r) => r.status === 'review_pending')?.id || reports[0]?.id || null
  );
  const [filterCrop, setFilterCrop] = useState<string>('All');
  const [filterUrgency, setFilterUrgency] = useState<string>('All');

  // Response Form State
  const [adviceText, setAdviceText] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [confidence, setConfidence] = useState<'high' | 'moderate' | 'field_visit_required'>('high');
  const [responseSuccessMessage, setResponseSuccessMessage] = useState<string | null>(null);

  // New Action Card Modal State
  const [showNewCardModal, setShowNewCardModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCrop, setNewCrop] = useState('Tomato');
  const [newPest, setNewPest] = useState('');
  const [newSymptoms, setNewSymptoms] = useState('');
  const [newImmediate, setNewImmediate] = useState('');
  const [newMonitoring, setNewMonitoring] = useState('');
  const [newChemical, setNewChemical] = useState('');
  const [newEscalate, setNewEscalate] = useState('');
  const [newRisk, setNewRisk] = useState<'low' | 'moderate' | 'high' | 'severe'>('moderate');

  // Filtered Queue
  const queueReports = reports.filter((r) => {
    if (filterCrop !== 'All' && r.cropType.toLowerCase() !== filterCrop.toLowerCase()) return false;
    if (filterUrgency !== 'All' && r.urgency !== filterUrgency) return false;
    return true;
  });

  const pendingCount = reports.filter((r) => r.status === 'review_pending').length;
  const severeCount = reports.filter((r) => r.urgency === 'severe').length;
  const reviewedCount = reports.filter((r) => r.status === 'reviewed').length;

  const currentReport = reports.find((r) => r.id === selectedReportId);

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId || !adviceText.trim()) return;

    onRespondToReport(
      selectedReportId,
      adviceText,
      selectedCardId || undefined,
      confidence
    );

    setResponseSuccessMessage('Expert advice dispatched to farmer successfully!');
    setAdviceText('');
    setTimeout(() => {
      setResponseSuccessMessage(null);
    }, 4000);
  };

  const handleCreateCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPest.trim()) return;

    onCreateActionCard({
      title: newTitle,
      cropType: newCrop,
      pestOrDiseaseName: newPest,
      confidenceScore: 90,
      riskLevel: newRisk,
      symptomDescription: newSymptoms,
      symptomChecklist: newSymptoms.split('\n').filter(Boolean),
      stepsImmediate: newImmediate.split('\n').filter(Boolean),
      stepsMonitoring: newMonitoring.split('\n').filter(Boolean),
      stepsChemical: newChemical || undefined,
      whenToEscalate: newEscalate,
      createdByExpertName: 'Dr. Sunita Kulkarni',
      expertAffiliation: 'Central Extension Pathology Division',
      isActive: true,
    });

    setShowNewCardModal(false);
    // Reset form
    setNewTitle('');
    setNewPest('');
    setNewSymptoms('');
    setNewImmediate('');
    setNewMonitoring('');
    setNewChemical('');
    setNewEscalate('');
  };

  return (
    <div className="space-y-6">
      {/* Extension Officer Header Dashboard */}
      <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" /> Extension Officer Console
              </span>
              <span className="text-xs text-stone-400">
                Dr. Sunita Kulkarni &bull; Regional Agri Diagnostic Lab
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Triage & Remote Diagnosis Queue
            </h1>
            <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Review farmer-submitted symptom reports flagged as unclear or severe. Assign verified Action Cards, issue tailored cultural instructions, or flag cases for on-site field visits.
            </p>
          </div>

          <button
            id="create-action-card-btn"
            onClick={() => setShowNewCardModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-md shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Action Card</span>
          </button>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-800">
          <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700">
            <span className="text-stone-400 text-xs block">Awaiting Review</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 block">
              {pendingCount}
            </span>
          </div>
          <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700">
            <span className="text-stone-400 text-xs block">Severe Outbreaks</span>
            <span className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5 block">
              {severeCount}
            </span>
          </div>
          <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700">
            <span className="text-stone-400 text-xs block">Cases Resolved</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 block">
              {reviewedCount}
            </span>
          </div>
          <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700">
            <span className="text-stone-400 text-xs block">Active Action Cards</span>
            <span className="text-xl sm:text-2xl font-black text-sky-400 mt-0.5 block">
              {actionCards.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split: Left Queue List, Right Case Inspector & Response */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Queue Filter & List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Field Case Queue ({queueReports.length})</span>
              </h3>
              <span className="text-[11px] text-stone-500">Sorted by urgency</span>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-stone-500 block mb-1">Crop</label>
                <select
                  value={filterCrop}
                  onChange={(e) => setFilterCrop(e.target.value)}
                  className="w-full p-2 rounded-xl border border-stone-200 bg-stone-50 font-semibold"
                >
                  <option value="All">All Crops</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Maize">Maize</option>
                  <option value="Chili">Chili</option>
                  <option value="Potato">Potato</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-stone-500 block mb-1">Urgency</label>
                <select
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  className="w-full p-2 rounded-xl border border-stone-200 bg-stone-50 font-semibold"
                >
                  <option value="All">All Urgencies</option>
                  <option value="severe">Severe Outbreak</option>
                  <option value="high">High Alert</option>
                  <option value="normal">Standard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Queue List */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {queueReports.map((report) => {
              const isSelected = report.id === selectedReportId;
              const isPending = report.status === 'review_pending';
              const isReviewed = report.status === 'reviewed';

              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <img
                    src={report.photos[0]}
                    alt={report.cropType}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-stone-900 uppercase text-[11px]">
                        {report.cropType} &bull; {report.partAffected}
                      </span>
                      {report.urgency === 'severe' ? (
                        <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                          Urgent
                        </span>
                      ) : isPending ? (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Pending
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-bold text-[10px]">
                          Reviewed
                        </span>
                      )}
                    </div>

                    <p className="font-semibold text-stone-800 truncate mt-0.5">
                      {report.suspectedIssue || report.notes}
                    </p>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-stone-400">
                      <span>📍 {report.locationLabel}</span>
                      <span>{formatRelativeTime(report.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Case Review & Respond Workspace (7 cols) */}
        <div className="lg:col-span-7">
          {currentReport ? (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-bold uppercase rounded-md bg-stone-100 text-stone-800">
                      {currentReport.cropType}
                    </span>
                    <span className="text-xs text-stone-500">Case ID: {currentReport.id}</span>
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 mt-1">
                    {currentReport.suspectedIssue || `${currentReport.cropType} Field Symptom`}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Reported by <strong>{currentReport.reporterName}</strong> &bull; 📍 {currentReport.locationLabel} &bull; {currentReport.daysNoticed} days since onset
                  </p>
                </div>

                {currentReport.status === 'reviewed' && (
                  <span className="px-3 py-1 bg-teal-100 text-teal-900 rounded-full font-bold text-xs flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                  </span>
                )}
              </div>

              {/* Photos Gallery */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  High-Resolution Symptom Photos ({currentReport.photos.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentReport.photos.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl overflow-hidden aspect-square border border-stone-200 block group relative"
                    >
                      <img
                        src={url}
                        alt="Zoomable symptom"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 right-1 bg-stone-900/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                        View Full
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Farmer Observation Notes */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm">
                <span className="text-stone-400 font-medium block text-xs mb-1">
                  Farmer Field Observation:
                </span>
                <p className="text-stone-900 italic leading-relaxed">
                  "{currentReport.notes}"
                </p>
              </div>

              {/* Existing Response if already reviewed */}
              {currentReport.expertReview && (
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-teal-900 uppercase">
                      Current Extension Advice on File:
                    </span>
                    <span className="text-[11px] text-teal-700">
                      {formatRelativeTime(currentReport.expertReview.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 mt-1">
                    {currentReport.expertReview.adviceText}
                  </p>
                  {currentReport.expertReview.linkedActionCardId && (
                    <p className="text-xs text-teal-800 font-semibold mt-2">
                      Linked Action Card: {actionCards.find(c => c.id === currentReport.expertReview?.linkedActionCardId)?.title || currentReport.expertReview.linkedActionCardId}
                    </p>
                  )}
                </div>
              )}

              {/* Expert Response Form */}
              <form onSubmit={handleSendResponse} className="space-y-4 pt-2 border-t border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Issue Extension Advice & Link Action Protocol</span>
                </h3>

                {/* Option to Link Existing Action Card */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    1. Link Expert Action Card (Recommended for standard protocols)
                  </label>
                  <select
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                  >
                    <option value="">-- None (Write purely custom advice) --</option>
                    {actionCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        [{card.cropType}] {card.title} ({card.pestOrDiseaseName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Diagnostic Advice */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    2. Specific Field Guidance & Actionable Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={adviceText}
                    onChange={(e) => setAdviceText(e.target.value)}
                    placeholder="E.g., Symptoms indicate early alternaria leaf spot aggravated by night humidity. Remove lower 3 sets of foliage immediately. Do not apply nitrogen. If lesions appear on stem, spray copper oxychloride @ 2.5g/L..."
                    className="w-full p-3 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    required
                  />
                </div>

                {/* Triage & Urgency Level */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Diagnosis Confidence
                    </label>
                    <select
                      value={confidence}
                      onChange={(e) => setConfidence(e.target.value as any)}
                      className="w-full p-2 rounded-xl border border-stone-300 text-xs bg-white"
                    >
                      <option value="high">High Confidence (Typical symptoms)</option>
                      <option value="moderate">Moderate (Monitor closely)</option>
                      <option value="field_visit_required">Escalate for In-Person Visit</option>
                    </select>
                  </div>
                </div>

                {responseSuccessMessage && (
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-950 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{responseSuccessMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Response to Farmer</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500">
              Select a case from the queue to inspect photos and issue guidance.
            </div>
          )}
        </div>
      </div>

      {/* New Action Card Creation Modal (Section 5.6.3) */}
      {showNewCardModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Extension Officer Tool
                </span>
                <h3 className="text-lg font-bold text-stone-900">Create New Action Card</h3>
              </div>
              <button
                onClick={() => setShowNewCardModal(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCardSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="E.g., Leaf Curl Virus (Vector: Whitefly) – Chili"
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Crop</label>
                  <select
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Maize">Maize</option>
                    <option value="Chili">Chili</option>
                    <option value="Rice">Rice</option>
                    <option value="Potato">Potato</option>
                    <option value="Cotton">Cotton</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Scientific Pest / Pathogen Name
                </label>
                <input
                  type="text"
                  required
                  value={newPest}
                  onChange={(e) => setNewPest(e.target.value)}
                  placeholder="E.g., Begomovirus / Bemisia tabaci"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Symptom Checklist (1 per line)
                </label>
                <textarea
                  rows={3}
                  required
                  value={newSymptoms}
                  onChange={(e) => setNewSymptoms(e.target.value)}
                  placeholder="Leaves curling upwards&#10;Stunted internodes&#10;Tiny white insects on underside of foliage"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Step 1: Immediate Low-Risk Actions (1 per line)
                </label>
                <textarea
                  rows={3}
                  required
                  value={newImmediate}
                  onChange={(e) => setNewImmediate(e.target.value)}
                  placeholder="Prune heavily infected leaves&#10;Install yellow sticky traps (10/acre)&#10;Switch from overhead watering to furrow"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Step 2: Field Monitoring (1 per line)
                </label>
                <textarea
                  rows={2}
                  required
                  value={newMonitoring}
                  onChange={(e) => setNewMonitoring(e.target.value)}
                  placeholder="Examine 20 plants every 48 hours&#10;Check sticky trap insect counts"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Step 3: Targeted Chemical Guidance (Generic active ingredients & safety)
                </label>
                <textarea
                  rows={2}
                  value={newChemical}
                  onChange={(e) => setNewChemical(e.target.value)}
                  placeholder="If nymph threshold exceeded: Neem oil 10,000 ppm @ 2ml/L or Acetamiprid 20% SP @ 0.2g/L. 7-day pre-harvest interval."
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Step 4: When to Escalate to Expert
                </label>
                <input
                  type="text"
                  required
                  value={newEscalate}
                  onChange={(e) => setNewEscalate(e.target.value)}
                  placeholder="Escalate if >15% of plants show stunted puckering within 5 days."
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-3 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setShowNewCardModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800"
                >
                  Publish Action Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
