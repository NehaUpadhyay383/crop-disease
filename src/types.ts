export type UserRole = 'farmer' | 'expert';

export type SupportedLanguage = 'en' | 'hi' | 'sw' | 'es';

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  role: UserRole;
  preferredLanguage: SupportedLanguage;
  primaryCrops: string[];
  village: string;
  district: string;
  latitude: number;
  longitude: number;
}

export type PlantPart = 'leaf' | 'stem' | 'fruit' | 'whole_plant' | 'root' | 'other';

export type ReportStatus = 'new' | 'clustered' | 'review_pending' | 'reviewed';

export type UrgencyLevel = 'normal' | 'high' | 'severe';

export interface Report {
  id: string;
  userId: string;
  reporterName: string;
  cropType: string;
  partAffected: PlantPart;
  daysNoticed: number;
  photos: string[];
  notes: string;
  locationLat: number;
  locationLng: number;
  locationLabel: string;
  createdAt: string;
  status: ReportStatus;
  urgency: UrgencyLevel;
  suspectedIssue?: string;
  linkedActionCardId?: string;
  expertReview?: ExpertReview;
  similarReportCount?: number;
  distanceKm?: number;
  sameIssueVotes: number;
  hasVotedSame?: boolean;
}

export interface ActionCard {
  id: string;
  title: string;
  cropType: string;
  pestOrDiseaseName: string;
  confidenceScore: number; // e.g. 88%
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  symptomDescription: string;
  symptomChecklist: string[];
  stepsImmediate: string[];
  stepsMonitoring: string[];
  stepsChemical?: string;
  whenToEscalate: string;
  createdByExpertName: string;
  expertAffiliation: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  helpedYesCount: number;
  helpedNoCount: number;
  helpedNotSureCount: number;
}

export interface ExpertReview {
  id: string;
  reportId: string;
  expertId: string;
  expertName: string;
  expertTitle: string;
  adviceText: string;
  linkedActionCardId?: string;
  confidenceLevel: 'high' | 'moderate' | 'field_visit_required';
  createdAt: string;
}

export interface ClusterInfo {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  dominantCrop: string;
  suspectedIssue: string;
  reportIds: string[];
  riskLevel: 'watch' | 'alert' | 'outbreak';
  actionCardId?: string;
}

export interface FeedbackRecord {
  id: string;
  userId: string;
  reportId?: string;
  actionCardId: string;
  helped: 'yes' | 'no' | 'not_sure';
  comment?: string;
  createdAt: string;
}
