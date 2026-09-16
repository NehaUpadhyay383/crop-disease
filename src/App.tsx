import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CommunityFeed } from './components/CommunityFeed';
import { ActionCardLibrary } from './components/ActionCardLibrary';
import { ExpertConsole } from './components/ExpertConsole';
import { ActionCardModal } from './components/ActionCardModal';
import { ReportWizardModal } from './components/ReportWizardModal';
import { TutorialModal } from './components/TutorialModal';
import { FeedbackBanner } from './components/FeedbackBanner';
import {
  ActionCard,
  FeedbackRecord,
  Report,
  SupportedLanguage,
  UserProfile,
  UserRole,
} from './types';
import { SEED_ACTION_CARDS, SEED_REPORTS, SEED_USER } from './data/seedData';
import { clusterReports } from './utils/geo';
import { PlusCircle, ShieldAlert, CheckCircle2, Sparkles, MapPin } from 'lucide-react';

export default function App() {
  // Persistence Keys
  const STORAGE_KEY_REPORTS = 'pestwatch_reports_v1';
  const STORAGE_KEY_CARDS = 'pestwatch_cards_v1';
  const STORAGE_KEY_USER = 'pestwatch_user_v1';
  const STORAGE_KEY_ADOPTED = 'pestwatch_adopted_cards_v1';
  const STORAGE_KEY_ROLE = 'pestwatch_role_v1';
  const STORAGE_KEY_LANG = 'pestwatch_lang_v1';

  // State initialization with localStorage fallback
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    return saved ? JSON.parse(saved) : SEED_USER;
  });

  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ROLE);
    return saved ? (saved as UserRole) : 'farmer';
  });

  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    return saved ? (saved as SupportedLanguage) : 'en';
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
    return saved ? JSON.parse(saved) : SEED_REPORTS;
  });

  const [actionCards, setActionCards] = useState<ActionCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CARDS);
    return saved ? JSON.parse(saved) : SEED_ACTION_CARDS;
  });

  const [adoptedCardIds, setAdoptedCardIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ADOPTED);
    return saved ? JSON.parse(saved) : ['ac-tomato-early-blight'];
  });

  // Navigation & Modal state
  const [activeTab, setActiveTab] = useState<'feed' | 'action-cards' | 'expert-queue'>('feed');
  const [isReportWizardOpen, setIsReportWizardOpen] = useState(false);
  const [selectedActionCardId, setSelectedActionCardId] = useState<string | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [feedbackPromptCardId, setFeedbackPromptCardId] = useState<string | null>(
    'ac-tomato-early-blight'
  );

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROLE, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANG, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(actionCards));
  }, [actionCards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ADOPTED, JSON.stringify(adoptedCardIds));
  }, [adoptedCardIds]);

  // Compute dynamic clusters
  const clusters = clusterReports(reports, 18);

  const pendingReviewsCount = reports.filter((r) => r.status === 'review_pending').length;

  // Handlers
  const handleToggleRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'expert' && activeTab === 'feed') {
      setActiveTab('expert-queue');
    } else if (newRole === 'farmer' && activeTab === 'expert-queue') {
      setActiveTab('feed');
    }
  };

  const handleCreateReport = (
    newReportData: Omit<Report, 'id' | 'createdAt' | 'sameIssueVotes'>
  ): Report => {
    const newReport: Report = {
      ...newReportData,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
      sameIssueVotes: 1,
      hasVotedSame: true,
    };

    setReports((prev) => [newReport, ...prev]);
    return newReport;
  };

  const handleVoteSameIssue = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const hasVoted = r.hasVotedSame;
          return {
            ...r,
            sameIssueVotes: hasVoted ? r.sameIssueVotes - 1 : r.sameIssueVotes + 1,
            hasVotedSame: !hasVoted,
          };
        }
        return r;
      })
    );
  };

  const handleRequestExpertReview = (reportId: string, additionalNote?: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'review_pending',
            urgency: r.urgency === 'normal' ? 'high' : r.urgency,
            notes: additionalNote ? `${r.notes} [Expert Note: ${additionalNote}]` : r.notes,
          };
        }
        return r;
      })
    );
  };

  const handleRespondToReport = (
    reportId: string,
    adviceText: string,
    linkedActionCardId?: string,
    confidenceLevel: 'high' | 'moderate' | 'field_visit_required' = 'high'
  ) => {
    const reviewId = `rev-${Date.now()}`;
    const newReview = {
      id: reviewId,
      reportId,
      expertId: 'exp-01',
      expertName: 'Dr. Sunita Kulkarni',
      expertTitle: 'Plant Pathologist, Central Extension Office',
      adviceText,
      linkedActionCardId,
      confidenceLevel,
      createdAt: new Date().toISOString(),
    };

    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status: 'reviewed',
            linkedActionCardId: linkedActionCardId || r.linkedActionCardId,
            expertReview: newReview,
          };
        }
        return r;
      })
    );
  };

  const handleCreateActionCard = (
    newCardData: Omit<
      ActionCard,
      'id' | 'createdAt' | 'updatedAt' | 'helpedYesCount' | 'helpedNoCount' | 'helpedNotSureCount'
    >
  ) => {
    const newCard: ActionCard = {
      ...newCardData,
      id: `ac-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      helpedYesCount: 1,
      helpedNoCount: 0,
      helpedNotSureCount: 0,
    };

    setActionCards((prev) => [newCard, ...prev]);
  };

  const handleAdoptAction = (cardId: string) => {
    if (!adoptedCardIds.includes(cardId)) {
      setAdoptedCardIds((prev) => [...prev, cardId]);
    }
    // Set for follow-up prompt
    setFeedbackPromptCardId(cardId);
  };

  const handleGiveFeedback = (
    cardId: string,
    helped: 'yes' | 'no' | 'not_sure',
    comment?: string
  ) => {
    setActionCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            helpedYesCount: helped === 'yes' ? c.helpedYesCount + 1 : c.helpedYesCount,
            helpedNoCount: helped === 'no' ? c.helpedNoCount + 1 : c.helpedNoCount,
            helpedNotSureCount: helped === 'not_sure' ? c.helpedNotSureCount + 1 : c.helpedNotSureCount,
          };
        }
        return c;
      })
    );
  };

  const activeCard = actionCards.find((c) => c.id === selectedActionCardId);
  const promptCard = actionCards.find((c) => c.id === feedbackPromptCardId);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top App Navbar */}
      <Navbar
        user={user}
        role={role}
        onToggleRole={handleToggleRole}
        language={language}
        onChangeLanguage={setLanguage}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        pendingReviewsCount={pendingReviewsCount}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* User Feedback Loop Banner (Simulating 3-day follow-up prompt) */}
        {promptCard && role === 'farmer' && (
          <FeedbackBanner
            card={promptCard}
            onFeedback={handleGiveFeedback}
            onDismiss={() => setFeedbackPromptCardId(null)}
          />
        )}

        {/* Tab Switcher Body */}
        {activeTab === 'feed' && (
          <CommunityFeed
            reports={reports}
            clusters={clusters}
            actionCards={actionCards}
            user={user}
            onOpenReportWizard={() => setIsReportWizardOpen(true)}
            onSelectActionCard={(cardId) => setSelectedActionCardId(cardId)}
            onVoteSameIssue={handleVoteSameIssue}
            onRequestExpertReview={(reportId) => handleRequestExpertReview(reportId)}
          />
        )}

        {activeTab === 'action-cards' && (
          <ActionCardLibrary
            cards={actionCards}
            onSelectCard={(cardId) => setSelectedActionCardId(cardId)}
            adoptedCardIds={adoptedCardIds}
          />
        )}

        {activeTab === 'expert-queue' && role === 'expert' && (
          <ExpertConsole
            reports={reports}
            actionCards={actionCards}
            onRespondToReport={handleRespondToReport}
            onCreateActionCard={handleCreateActionCard}
          />
        )}
      </main>

      {/* Floating Fast "Report Problem" Button for Mobile / Quick Action */}
      {role === 'farmer' && (
        <div className="fixed bottom-5 right-5 z-30 sm:hidden">
          <button
            onClick={() => setIsReportWizardOpen(true)}
            className="w-14 h-14 rounded-full bg-emerald-700 text-white shadow-xl flex items-center justify-center hover:bg-emerald-800 transition-transform active:scale-95"
            aria-label="Report Crop Problem"
          >
            <PlusCircle className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* Report Wizard Modal */}
      <ReportWizardModal
        isOpen={isReportWizardOpen}
        onClose={() => setIsReportWizardOpen(false)}
        user={user}
        allReports={reports}
        actionCards={actionCards}
        onSubmitReport={handleCreateReport}
        onRequestExpertReview={handleRequestExpertReview}
        onViewActionCard={(cardId) => setSelectedActionCardId(cardId)}
      />

      {/* Action Card Modal */}
      {activeCard && (
        <ActionCardModal
          card={activeCard}
          isOpen={!!selectedActionCardId}
          onClose={() => setSelectedActionCardId(null)}
          onAdoptAction={handleAdoptAction}
          onGiveFeedback={handleGiveFeedback}
          hasAdopted={adoptedCardIds.includes(activeCard.id)}
        />
      )}

      {/* Tutorial / Field Guide Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        language={language}
        onChangeLanguage={setLanguage}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 mt-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
              PW
            </div>
            <span className="font-semibold text-stone-800">PestWatch Network</span>
            <span>&bull; Hyper-Local Crop Surveillance Platform</span>
          </div>

          <div className="flex items-center gap-4 text-stone-600">
            <span>Low-regret first responses</span>
            <span>&bull;</span>
            <span>Field-level clustering</span>
            <span>&bull;</span>
            <span>Extension Officer escalation</span>
          </div>

          <div className="text-stone-400">
            Field-ready Hackathon Prototype
          </div>
        </div>
      </footer>
    </div>
  );
}
