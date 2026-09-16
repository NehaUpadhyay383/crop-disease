import React, { useState } from 'react';
import {
  Filter,
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronRight,
  Flame,
  PlusCircle,
  Eye,
  SlidersHorizontal,
  Compass,
  Map as MapIcon,
  List,
} from 'lucide-react';
import { ActionCard, ClusterInfo, Report, UserProfile } from '../types';
import { calculateDistanceKm, formatRelativeTime } from '../utils/geo';
import { ClusterMapView } from './ClusterMapView';

interface CommunityFeedProps {
  reports: Report[];
  clusters: ClusterInfo[];
  actionCards: ActionCard[];
  user: UserProfile;
  onOpenReportWizard: () => void;
  onSelectActionCard: (cardId: string) => void;
  onVoteSameIssue: (reportId: string) => void;
  onRequestExpertReview: (reportId: string) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  reports,
  clusters,
  actionCards,
  user,
  onOpenReportWizard,
  onSelectActionCard,
  onVoteSameIssue,
  onRequestExpertReview,
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [selectedTime, setSelectedTime] = useState<'24h' | '72h' | 'all'>('72h');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'verified' | 'pending' | 'urgent'>('all');
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(35);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeReportDetail, setActiveReportDetail] = useState<Report | null>(null);

  // Filter & sort logic
  const now = Date.now();
  const filteredReports = reports
    .map((report) => {
      const distance = calculateDistanceKm(
        user.latitude,
        user.longitude,
        report.locationLat,
        report.locationLng
      );
      return { ...report, distanceKm: distance };
    })
    .filter((report) => {
      // Crop filter
      if (selectedCrop !== 'All' && report.cropType.toLowerCase() !== selectedCrop.toLowerCase()) {
        return false;
      }

      // Radius filter
      if (report.distanceKm > maxRadiusKm) {
        return false;
      }

      // Time filter
      const reportAgeHours = (now - new Date(report.createdAt).getTime()) / (1000 * 3600);
      if (selectedTime === '24h' && reportAgeHours > 24) return false;
      if (selectedTime === '72h' && reportAgeHours > 72) return false;

      // Status filter
      if (selectedStatus === 'verified' && !report.linkedActionCardId && report.status !== 'reviewed') return false;
      if (selectedStatus === 'pending' && report.status !== 'review_pending') return false;
      if (selectedStatus === 'urgent' && report.urgency !== 'severe') return false;

      return true;
    })
    .sort((a, b) => {
      // Urgent / severe first, then closest distance, then newest
      if (a.urgency === 'severe' && b.urgency !== 'severe') return -1;
      if (b.urgency === 'severe' && a.urgency !== 'severe') return 1;
      return a.distanceKm - b.distanceKm;
    });

  // Check if there are active outbreaks in the region
  const activeOutbreaks = clusters.filter((c) => c.riskLevel === 'outbreak');

  return (
    <div className="space-y-6">
      {/* Primary Hero Action & Regional Status Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/80 border border-emerald-500/30 text-emerald-200 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Hyper-Local Pest Surveillance Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Crop Health Radar for {user.village}
          </h1>

          <p className="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed">
            See what pests and diseases neighbouring farmers are spotting. Upload photos of suspicious symptoms to trigger location-based outbreak clustering and verified Action Cards.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              id="report-crop-problem-cta"
              onClick={onOpenReportWizard}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-sm shadow-md transition-all flex items-center gap-2 transform active:scale-95"
            >
              <PlusCircle className="w-5 h-5 text-stone-900" />
              <span>Report a Crop Problem</span>
            </button>

            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="px-4 py-3 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm border border-emerald-600 transition-colors flex items-center gap-2"
            >
              {viewMode === 'list' ? (
                <>
                  <MapIcon className="w-4 h-4 text-emerald-300" />
                  <span>View Outbreak Map ({filteredReports.length} pins)</span>
                </>
              ) : (
                <>
                  <List className="w-4 h-4 text-emerald-300" />
                  <span>Switch to Alert Feed</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Outbreak Cluster Alert Banner (Section 4.2) */}
      {activeOutbreaks.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-950 flex items-start gap-3 shadow-xs">
          <Flame className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-rose-200 text-rose-900">
                🚨 Outbreak Cluster Warning
              </span>
              <span className="text-xs font-medium text-rose-700">
                Multiple reports clustered within ~18 km of {user.village}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-rose-900 mt-1 font-medium">
              {activeOutbreaks[0].dominantCrop}: {activeOutbreaks[0].suspectedIssue} detected across {activeOutbreaks[0].reportIds.length} nearby farms. Inspect your whorls/foliage immediately.
            </p>
          </div>
          {activeOutbreaks[0].actionCardId && (
            <button
              onClick={() => onSelectActionCard(activeOutbreaks[0].actionCardId!)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold shrink-0 transition-colors"
            >
              View Protocol
            </button>
          )}
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
        {/* Crop Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-stone-400 font-medium px-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Crop:
          </span>
          {['All', 'Tomato', 'Maize', 'Chili', 'Potato', 'Rice'].map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                selectedCrop === crop
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Radius, Time, Status, View Switch */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Radius selector */}
            <div className="flex items-center gap-1 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
              <Compass className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-stone-500">Radius:</span>
              <select
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="bg-transparent font-semibold text-stone-800 focus:outline-hidden"
              >
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={35}>35 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>

            {/* Time Window */}
            <div className="flex items-center gap-1 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value as any)}
                className="bg-transparent font-semibold text-stone-800 focus:outline-hidden"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="72h">Last 72 Hours</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="bg-transparent font-semibold text-stone-800 focus:outline-hidden"
              >
                <option value="all">All Reports</option>
                <option value="verified">Action Card Verified</option>
                <option value="pending">Awaiting Expert</option>
                <option value="urgent">Urgent Outbreaks</option>
              </select>
            </div>
          </div>

          {/* List vs Map Toggle */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Feed</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View: Map or List */}
      {viewMode === 'map' ? (
        <div className="space-y-3">
          <ClusterMapView
            reports={filteredReports}
            clusters={clusters}
            userLat={user.latitude}
            userLng={user.longitude}
            userVillage={user.village}
            onSelectReport={(report) => setActiveReportDetail(report)}
          />
          <p className="text-xs text-stone-500 text-center">
            Tap any colored marker to inspect symptoms, proximity distance, and linked Action Cards.
          </p>
        </div>
      ) : (
        /* Alert Feed List */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>
              Showing <strong>{filteredReports.length}</strong> reports near {user.village}
            </span>
            <span>Sorted by urgency & distance</span>
          </div>

          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-800 text-base">No Matching Reports in this Radius</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                No active outbreaks logged for the selected filter. You can expand the radius to 50 km or be the first to report.
              </p>
              <button
                onClick={onOpenReportWizard}
                className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-xl font-semibold text-xs hover:bg-emerald-800"
              >
                Submit New Symptom Report
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredReports.map((report) => {
                const isSevere = report.urgency === 'severe';
                const hasActionCard = !!report.linkedActionCardId;
                const isReviewed = report.status === 'reviewed';
                const isPending = report.status === 'review_pending';

                const matchedCard = report.linkedActionCardId
                  ? actionCards.find((c) => c.id === report.linkedActionCardId)
                  : null;

                return (
                  <div
                    key={report.id}
                    id={`report-card-${report.id}`}
                    className={`bg-white rounded-2xl border transition-all hover:shadow-md overflow-hidden flex flex-col justify-between ${
                      isSevere
                        ? 'border-rose-300 ring-1 ring-rose-200'
                        : 'border-stone-200 hover:border-emerald-300'
                    }`}
                  >
                    <div>
                      {/* Card Top: Thumbnail + High-level metadata */}
                      <div className="p-4 flex gap-3.5">
                        <div
                          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-stone-100 cursor-pointer group"
                          onClick={() => setActiveReportDetail(report)}
                        >
                          <img
                            src={report.photos[0]}
                            alt={report.cropType}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {report.photos.length > 1 && (
                            <span className="absolute bottom-1 right-1 bg-stone-900/80 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                              +{report.photos.length - 1}
                            </span>
                          )}
                        </div>

                        {/* Text Metadata */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[11px] font-bold uppercase tracking-wider">
                              {report.cropType} &bull; {report.partAffected}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700 shrink-0">
                              ~{report.distanceKm} km away
                            </span>
                          </div>

                          <h3
                            onClick={() => setActiveReportDetail(report)}
                            className="font-bold text-stone-900 text-sm sm:text-base hover:text-emerald-800 cursor-pointer line-clamp-1"
                          >
                            {report.suspectedIssue || `${report.cropType} Symptoms`}
                          </h3>

                          <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                            "{report.notes}"
                          </p>

                          <div className="flex items-center gap-2 mt-2 text-[11px] text-stone-400">
                            <span className="flex items-center gap-1 text-stone-500">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              {report.locationLabel}
                            </span>
                            <span>&bull;</span>
                            <span>{formatRelativeTime(report.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="px-4 pb-3 flex flex-wrap items-center gap-1.5">
                        {isSevere && (
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-100 text-rose-800 rounded-md flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> Urgent Outbreak
                          </span>
                        )}
                        {hasActionCard && (
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-900 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Action Card Ready
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-900 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700" /> Extension Officer Review Pending
                          </span>
                        )}
                        {isReviewed && (
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-teal-100 text-teal-900 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-teal-700" /> Expert Advice Attached
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Bottom Actions */}
                    <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                      {/* "My field has this too" Button */}
                      <button
                        onClick={() => onVoteSameIssue(report.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                          report.hasVotedSame
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                        title="Crowdsource outbreak density"
                      >
                        <span>{report.hasVotedSame ? '✓ Confirmed' : 'My field has this too'}</span>
                        <span className="px-1.5 py-0.2 bg-stone-200 text-stone-700 rounded-full font-bold text-[10px]">
                          {report.sameIssueVotes}
                        </span>
                      </button>

                      {/* View Action Card or Details */}
                      {report.linkedActionCardId ? (
                        <button
                          onClick={() => onSelectActionCard(report.linkedActionCardId!)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors flex items-center gap-1"
                        >
                          <span>Action Card</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveReportDetail(report)}
                          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Report Full Screen / Detail Modal (Section 5.4.3) */}
      {activeReportDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Field Report Details &bull; ID: {activeReportDetail.id}
                </span>
                <h3 className="text-lg font-bold text-stone-900">
                  {activeReportDetail.suspectedIssue || `${activeReportDetail.cropType} Issue`}
                </h3>
              </div>
              <button
                onClick={() => setActiveReportDetail(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-stone-800 text-xs sm:text-sm">
              {/* Photo carousel / gallery */}
              <div className="grid grid-cols-2 gap-2">
                {activeReportDetail.photos.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="Symptom"
                    className="w-full h-44 object-cover rounded-xl border border-stone-200"
                  />
                ))}
              </div>

              {/* Farmer Notes & Field Meta */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400 block">Reported By</span>
                    <span className="font-semibold text-stone-800">{activeReportDetail.reporterName}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Location</span>
                    <span className="font-semibold text-stone-800">
                      📍 {activeReportDetail.locationLabel} (~{calculateDistanceKm(user.latitude, user.longitude, activeReportDetail.locationLat, activeReportDetail.locationLng)} km)
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Duration</span>
                    <span className="font-semibold text-stone-800">{activeReportDetail.daysNoticed} days observed</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200">
                  <span className="text-stone-400 block text-xs">Farmer Description:</span>
                  <p className="text-stone-800 text-xs sm:text-sm mt-0.5 leading-relaxed">
                    "{activeReportDetail.notes}"
                  </p>
                </div>
              </div>

              {/* Linked Action Card if available */}
              {activeReportDetail.linkedActionCardId ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-800">
                      Linked Action Card
                    </span>
                    <p className="font-bold text-stone-900 text-sm">
                      {actionCards.find((c) => c.id === activeReportDetail.linkedActionCardId)?.title || 'Action Protocol'}
                    </p>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Expert-curated safe initial measures.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const cid = activeReportDetail.linkedActionCardId!;
                      setActiveReportDetail(null);
                      onSelectActionCard(cid);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shrink-0"
                  >
                    View Card &rarr;
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">Awaiting Extension Officer Review</p>
                    <p className="text-amber-800 mt-0.5">
                      No automated match was confident enough. A regional agronomist has been notified.
                    </p>
                  </div>
                  {activeReportDetail.status !== 'review_pending' && (
                    <button
                      onClick={() => {
                        onRequestExpertReview(activeReportDetail.id);
                        setActiveReportDetail(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 text-white font-bold text-xs shrink-0"
                    >
                      Request Review
                    </button>
                  )}
                </div>
              )}

              {/* Expert Review Advice if present */}
              {activeReportDetail.expertReview && (
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-300">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                    <span className="font-bold text-teal-950 text-xs uppercase">
                      Extension Officer Reply ({activeReportDetail.expertReview.expertName})
                    </span>
                  </div>
                  <p className="text-xs text-teal-900 italic mb-2">
                    {activeReportDetail.expertReview.expertTitle}
                  </p>
                  <p className="text-xs sm:text-sm text-stone-800 bg-white p-3 rounded-xl border border-teal-200 leading-relaxed">
                    {activeReportDetail.expertReview.adviceText}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <button
                onClick={() => {
                  onVoteSameIssue(activeReportDetail.id);
                }}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100"
              >
                {activeReportDetail.hasVotedSame ? '✓ Confirmed on my field' : 'My field has this too (+1)'}
              </button>
              <button
                onClick={() => setActiveReportDetail(null)}
                className="px-5 py-2 rounded-xl bg-stone-800 text-white font-semibold text-xs hover:bg-stone-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
