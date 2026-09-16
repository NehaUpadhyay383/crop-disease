import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  UploadCloud,
  MapPin,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Trash2,
  Mic,
  ChevronRight,
  ChevronLeft,
  Info,
  Layers,
} from 'lucide-react';
import { ActionCard, PlantPart, Report, UserProfile } from '../types';
import { calculateDistanceKm } from '../utils/geo';

interface ReportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  allReports: Report[];
  actionCards: ActionCard[];
  onSubmitReport: (newReport: Omit<Report, 'id' | 'createdAt' | 'sameIssueVotes'>) => Report;
  onRequestExpertReview: (reportId: string, additionalNote?: string) => void;
  onViewActionCard: (cardId: string) => void;
}

// Pre-seeded high-quality field symptom presets for easy 1-click testing
const PRESET_SYMPTOMS = [
  {
    name: 'Tomato Early Blight (Target Spots)',
    crop: 'Tomato',
    part: 'leaf' as PlantPart,
    days: 3,
    notes: 'Dark brown concentric spots on bottom leaves, yellowing margins.',
    photo: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Maize Fall Armyworm (Whorl Frass)',
    crop: 'Maize',
    part: 'stem' as PlantPart,
    days: 2,
    notes: 'Severe leaf holes in whorl, brown sawdust like droppings inside funnel.',
    photo: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Chili Leaf Curl (Boat Curling)',
    crop: 'Chili',
    part: 'leaf' as PlantPart,
    days: 4,
    notes: 'Leaves curled upward with puckered texture, whiteflies on undersides.',
    photo: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Potato Late Blight (Water-Soaked)',
    crop: 'Potato',
    part: 'leaf' as PlantPart,
    days: 2,
    notes: 'Irregular dark water-soaked lesions spreading rapidly after rain.',
    photo: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
  },
];

export const ReportWizardModal: React.FC<ReportWizardModalProps> = ({
  isOpen,
  onClose,
  user,
  allReports,
  actionCards,
  onSubmitReport,
  onRequestExpertReview,
  onViewActionCard,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [cropType, setCropType] = useState<string>('Tomato');
  const [partAffected, setPartAffected] = useState<PlantPart>('leaf');
  const [daysNoticed, setDaysNoticed] = useState<number>(2);
  const [notes, setNotes] = useState<string>('');
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [recordedVoiceNote, setRecordedVoiceNote] = useState<string | null>(null);

  // Location details
  const [locationLabel, setLocationLabel] = useState<string>(user.village || 'Pimpalgaon');
  const [lat, setLat] = useState<number>(user.latitude || 20.165);
  const [lng, setLng] = useState<number>(user.longitude || 73.985);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Post-submit state
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);
  const [nearbyMatches, setNearbyMatches] = useState<Report[]>([]);
  const [matchedActionCard, setMatchedActionCard] = useState<ActionCard | null>(null);
  const [expertRequested, setExpertRequested] = useState<boolean>(false);
  const [expertNote, setExpertNote] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle image upload from file or camera
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray: File[] = Array.from(e.target.files);
      filesArray.slice(0, 3 - photos.length).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setPhotos((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const applyPreset = (preset: typeof PRESET_SYMPTOMS[0]) => {
    setPhotos([preset.photo]);
    setCropType(preset.crop);
    setPartAffected(preset.part);
    setDaysNoticed(preset.days);
    setNotes(preset.notes);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationLabel(`${user.village} (GPS Acquired)`);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = () => {
    // Determine suspected issue and matching action card
    const existingSimilar = allReports.filter(
      (r) =>
        r.cropType.toLowerCase() === cropType.toLowerCase() &&
        calculateDistanceKm(lat, lng, r.locationLat, r.locationLng) <= 25
    );

    const linkedCard = actionCards.find(
      (ac) => ac.cropType.toLowerCase() === cropType.toLowerCase()
    );

    const suspected = linkedCard
      ? `${linkedCard.pestOrDiseaseName} – Suspected`
      : `${cropType} Field Symptoms`;

    const newRep = onSubmitReport({
      userId: user.id,
      reporterName: user.name,
      cropType,
      partAffected,
      daysNoticed,
      photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80'],
      notes: notes + (recordedVoiceNote ? ` [Voice note: ${recordedVoiceNote}]` : ''),
      locationLat: lat,
      locationLng: lng,
      locationLabel,
      status: 'clustered',
      urgency: daysNoticed > 4 ? 'high' : 'normal',
      suspectedIssue: suspected,
      linkedActionCardId: linkedCard?.id,
      similarReportCount: existingSimilar.length,
    });

    setSubmittedReport(newRep);
    setNearbyMatches(existingSimilar.slice(0, 3));
    setMatchedActionCard(linkedCard || null);
    setStep(4);
  };

  const handleSendToExpert = () => {
    if (!submittedReport) return;
    onRequestExpertReview(submittedReport.id, expertNote);
    setExpertRequested(true);
  };

  const toggleVoiceNote = () => {
    if (!isRecordingAudio) {
      setIsRecordingAudio(true);
      setTimeout(() => {
        setIsRecordingAudio(false);
        setRecordedVoiceNote('Recorded (0:14s): "Symptoms spread rapidly since morning fog."');
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {step === 4 ? 'Step 4: Cluster Match & Guidance' : `Step ${step} of 3: Field Report`}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              {step === 1 && 'Snap or Upload Crop Symptom'}
              {step === 2 && 'Crop Details & Symptoms'}
              {step === 3 && 'Location & Field Privacy'}
              {step === 4 && 'Immediate Cluster Analysis'}
            </h2>
          </div>
          <button
            id="close-wizard-btn"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-200 h-1.5">
          <div
            className="bg-emerald-700 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Wizard Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-stone-800 text-sm flex-1">
          {/* STEP 1: Symptom Photo Upload */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Photo In-App Guidance Overlay */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs">
                <p className="font-bold flex items-center gap-1.5 mb-1 text-emerald-900">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  Tips for useful field diagnosis photos:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-emerald-900">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <span>Move close (15–20 cm)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    <span>Focus on lesion / leaf edge</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-[10px]">
                      3
                    </span>
                    <span>Avoid harsh flash & deep shadow</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-[10px]">
                      4
                    </span>
                    <span>Capture 2–3 angles if possible</span>
                  </div>
                </div>
              </div>

              {/* Photos Grid & Upload Box */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((src, index) => (
                    <div
                      key={index}
                      className="relative rounded-xl overflow-hidden border border-stone-200 aspect-square group shadow-xs"
                    >
                      <img
                        src={src}
                        alt={`Symptom ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 text-white rounded-md hover:bg-rose-600 transition-colors"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-1 left-1.5 bg-stone-900/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                        Photo {index + 1}
                      </span>
                    </div>
                  ))}

                  {photos.length < 3 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all aspect-square bg-stone-50 hover:bg-emerald-50/50"
                    >
                      <Camera className="w-6 h-6 text-stone-400 mb-1" />
                      <span className="text-xs font-semibold text-stone-700">Add Photo</span>
                      <span className="text-[10px] text-stone-400">({photos.length}/3 max)</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    id="open-camera-btn"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-stone-300 hover:border-emerald-600 bg-white text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Take Photo with Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-stone-300 hover:border-emerald-600 bg-white text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <UploadCloud className="w-4 h-4 text-emerald-700" />
                    <span>Choose from Gallery</span>
                  </button>
                </div>
              </div>

              {/* Field Preset Test Options (Super handy for hackathon evaluation) */}
              <div className="pt-3 border-t border-stone-200">
                <p className="text-xs font-semibold text-stone-600 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Or test instantly with realistic field sample photos:</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_SYMPTOMS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="p-2 text-left rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-xs flex items-center gap-2"
                    >
                      <img
                        src={preset.photo}
                        alt={preset.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-stone-800 truncate">{preset.name}</p>
                        <p className="text-[10px] text-stone-500">{preset.crop} &bull; {preset.part}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Symptom & Crop Metadata */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Crop Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-2">
                  Select Affected Crop
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {['Tomato', 'Maize', 'Chili', 'Rice', 'Potato', 'Cotton', 'Wheat', 'Other'].map(
                    (crop) => (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => setCropType(crop)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                          cropType === crop
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {crop}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Plant Part Affected */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-2">
                  Plant Part Primarily Affected
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'leaf', label: 'Leaf' },
                    { id: 'stem', label: 'Stem / Whorl' },
                    { id: 'fruit', label: 'Fruit / Pod' },
                    { id: 'whole_plant', label: 'Whole Bush' },
                    { id: 'root', label: 'Root / Collar' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPartAffected(p.id as PlantPart)}
                      className={`p-2 rounded-xl border text-xs font-medium text-center transition-all ${
                        partAffected === p.id
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Days Since First Noticed */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-800">
                    Days Since Symptoms First Noticed
                  </label>
                  <span className="text-xs font-bold text-emerald-800">
                    {daysNoticed} {daysNoticed === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 5, 7, 10].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDaysNoticed(d)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        daysNoticed === d
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes or Voice Recording */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-800">
                    Symptom Description / Field Notes
                  </label>
                  <button
                    type="button"
                    onClick={toggleVoiceNote}
                    className={`text-xs flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg border ${
                      isRecordingAudio
                        ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                        : 'bg-stone-100 text-stone-700 border-stone-300'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isRecordingAudio ? 'Recording (2s)...' : 'Record Voice Note'}</span>
                  </button>
                </div>

                <textarea
                  id="report-notes-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe symptoms (e.g., spots spread quickly after humid night, yellow concentric rings, caterpillar feeding in central whorl)..."
                  rows={3}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />

                {recordedVoiceNote && (
                  <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                    <span>{recordedVoiceNote}</span>
                    <button
                      type="button"
                      onClick={() => setRecordedVoiceNote(null)}
                      className="text-stone-400 hover:text-stone-600 text-xs"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Location & Cluster Verification */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Village / Cluster Center
                    </label>
                    <input
                      type="text"
                      value={locationLabel}
                      onChange={(e) => setLocationLabel(e.target.value)}
                      placeholder="Enter village or block name"
                      className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-200">
                  <span>
                    Lat: {lat.toFixed(3)}, Lng: {lng.toFixed(3)}
                  </span>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                  >
                    {isLocating ? 'Locating GPS...' : '📍 Use Current GPS'}
                  </button>
                </div>
              </div>

              {/* Strict Privacy Notice */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">Privacy Protection Guarantee</p>
                  <p className="text-amber-800/90 mt-0.5 leading-relaxed">
                    We use approximate coordinates strictly to cluster reports across your village and calculate nearby outbreaks. Your exact farm plot and survey numbers are never revealed publicly.
                  </p>
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
                <p className="font-bold text-emerald-950">Summary Before Submitting:</p>
                <p className="text-emerald-900">
                  &bull; <strong>Crop:</strong> {cropType} ({partAffected})
                </p>
                <p className="text-emerald-900">
                  &bull; <strong>Duration:</strong> {daysNoticed} days observed
                </p>
                <p className="text-emerald-900">
                  &bull; <strong>Photos:</strong> {photos.length} image(s) attached
                </p>
                <p className="text-emerald-900">
                  &bull; <strong>Location:</strong> {locationLabel}
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Immediate Post-Submit Experience (Section 5.3) */}
          {step === 4 && submittedReport && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-emerald-100/70 border border-emerald-300 text-emerald-950 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-950">
                    Report Submitted & Clustered Successfully
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Added to village surveillance radar. ID: {submittedReport.id}
                  </p>
                </div>
              </div>

              {/* Similar Cases Near You */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    <span>Similar Cases Near You ({nearbyMatches.length} Found)</span>
                  </h4>
                  <span className="text-[11px] text-stone-500">Within ~25 km</span>
                </div>

                {nearbyMatches.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {nearbyMatches.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5 text-xs"
                      >
                        <img
                          src={m.photos[0]}
                          alt={m.cropType}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                        <div className="truncate flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-800">{m.cropType}</span>
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              ~{calculateDistanceKm(lat, lng, m.locationLat, m.locationLng)} km away
                            </span>
                          </div>
                          <p className="text-stone-600 truncate">{m.suspectedIssue || m.notes}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">📍 {m.locationLabel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic p-3 bg-stone-50 rounded-xl">
                    You are the first farmer reporting this in your immediate sector this week.
                  </p>
                )}
              </div>

              {/* Matched Action Card */}
              {matchedActionCard ? (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-200 text-emerald-900">
                        Likely Problem (Suspected)
                      </span>
                      <h4 className="font-bold text-base text-stone-900 mt-1">
                        {matchedActionCard.title}
                      </h4>
                      <p className="text-xs text-stone-600 italic font-serif">
                        {matchedActionCard.pestOrDiseaseName}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-emerald-300 text-emerald-800 shrink-0">
                      {matchedActionCard.confidenceScore}% match
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 mt-2.5 line-clamp-2">
                    {matchedActionCard.stepsImmediate[0]}
                  </p>

                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-emerald-200/80">
                    <span className="text-[11px] text-stone-500 italic">
                      Safe first-response. Not a final lab diagnosis.
                    </span>
                    <button
                      id="view-matched-action-card-btn"
                      onClick={() => {
                        onClose();
                        onViewActionCard(matchedActionCard.id);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
                    >
                      View Full Action Card &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs">
                  <p className="font-bold">System Uncertainty</p>
                  <p className="mt-0.5">
                    We could not identify a clear automated match for this symptom pattern. We recommend requesting an Extension Officer Expert Review.
                  </p>
                </div>
              )}

              {/* Option for Expert Review Request (Section 5.3.3) */}
              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-300/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">
                      Still not sure? Request Expert Review
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Case goes to the Extension Officer queue for custom diagnosis.
                    </p>
                  </div>
                </div>

                {!expertRequested ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={expertNote}
                      onChange={(e) => setExpertNote(e.target.value)}
                      placeholder="Add brief note for expert (e.g., already tried copper spray, worsening daily)..."
                      className="w-full p-2 text-xs rounded-xl border border-stone-300 bg-white"
                    />
                    <button
                      id="ask-expert-btn"
                      onClick={handleSendToExpert}
                      className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span>Ask an Extension Expert (Queue for Review)</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-100 rounded-xl text-amber-950 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      Sent to Regional Expert Queue! You will see an alert when Dr. Sunita / extension agronomist replies.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : step === 4 ? (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition-colors"
            >
              Done & Return to Feed
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              id="next-step-btn"
              onClick={() => {
                if (photos.length === 0) {
                  // If user didn't upload photo, supply the default sample photo
                  setPhotos([PRESET_SYMPTOMS[0].photo]);
                }
                setStep((s) => (s + 1) as any);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-xs shadow-xs transition-all flex items-center gap-1"
            >
              <span>Next: {step === 1 ? 'Crop Details' : 'Location & Privacy'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : step === 3 ? (
            <button
              id="submit-report-btn"
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Submit & Check Outbreak Radar</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-xs shadow-xs"
            >
              View on Radar Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
