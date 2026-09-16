import React from 'react';
import {
  ShieldAlert,
  UserCheck,
  Stethoscope,
  Globe2,
  HelpCircle,
  Bell,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguage, UserProfile, UserRole } from '../types';
import { translations } from '../utils/translations';

interface NavbarProps {
  user: UserProfile;
  role: UserRole;
  onToggleRole: (newRole: UserRole) => void;
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  onOpenTutorial: () => void;
  pendingReviewsCount: number;
  activeTab: 'feed' | 'action-cards' | 'expert-queue';
  onChangeTab: (tab: 'feed' | 'action-cards' | 'expert-queue') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  role,
  onToggleRole,
  language,
  onChangeLanguage,
  onOpenTutorial,
  pendingReviewsCount,
  activeTab,
  onChangeTab,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top Banner / Cluster Status */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">Live Outbreak Surveillance:</span>
            <span className="text-emerald-200 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {user.village}, {user.district} (~18 km cluster radius)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="tutorial-top-btn"
              onClick={onOpenTutorial}
              className="hover:text-white flex items-center gap-1 transition-colors text-emerald-200 font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How it works</span>
            </button>
            <span className="text-emerald-700">|</span>
            <div className="flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-emerald-300" />
              <select
                id="language-select"
                value={language}
                onChange={(e) => onChangeLanguage(e.target.value as SupportedLanguage)}
                className="bg-emerald-800 text-white rounded px-2 py-0.5 text-xs border border-emerald-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-400"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="sw">Kiswahili</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChangeTab('feed')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-stone-900">
                  PestWatch <span className="text-emerald-700">Network</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                  Field MVP
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden md:block">{t.tagline}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-feed-tab"
              onClick={() => onChangeTab('feed')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'feed'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {t.nearbyAlerts}
            </button>
            <button
              id="nav-action-cards-tab"
              onClick={() => onChangeTab('action-cards')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'action-cards'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {t.actionCards}
            </button>
            {role === 'expert' && (
              <button
                id="nav-expert-queue-tab"
                onClick={() => onChangeTab('expert-queue')}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'expert-queue'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <span>{t.expertQueue}</span>
                {pendingReviewsCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold bg-rose-600 text-white rounded-full">
                    {pendingReviewsCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Role Switcher & Farmer Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role Toggle Pill */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                id="role-farmer-toggle"
                onClick={() => onToggleRole('farmer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  role === 'farmer'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.farmerView}</span>
                <span className="sm:hidden">Farmer</span>
              </button>
              <button
                id="role-expert-toggle"
                onClick={() => onToggleRole('expert')}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  role === 'expert'
                    ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.expertView}</span>
                <span className="sm:hidden">Expert</span>
                {pendingReviewsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 ring-2 ring-white" />
                )}
              </button>
            </div>

            {/* Profile Avatar Chip */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-stone-200">
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-semibold text-stone-700">
                {role === 'farmer' ? 'RP' : 'SK'}
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-stone-800 leading-tight">
                  {role === 'farmer' ? user.name : 'Dr. Sunita K.'}
                </p>
                <p className="text-[11px] text-stone-500">
                  {role === 'farmer' ? 'Tomato, Maize' : 'Extension Pathologist'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden border-t border-stone-200 bg-stone-50 px-4 py-2 flex items-center justify-around text-xs">
        <button
          onClick={() => onChangeTab('feed')}
          className={`flex-1 py-1.5 text-center font-medium rounded ${
            activeTab === 'feed' ? 'text-emerald-800 font-bold bg-emerald-100/60' : 'text-stone-600'
          }`}
        >
          {t.nearbyAlerts}
        </button>
        <button
          onClick={() => onChangeTab('action-cards')}
          className={`flex-1 py-1.5 text-center font-medium rounded ${
            activeTab === 'action-cards' ? 'text-emerald-800 font-bold bg-emerald-100/60' : 'text-stone-600'
          }`}
        >
          {t.actionCards}
        </button>
        {role === 'expert' && (
          <button
            onClick={() => onChangeTab('expert-queue')}
            className={`flex-1 py-1.5 text-center font-medium rounded relative ${
              activeTab === 'expert-queue' ? 'text-emerald-800 font-bold bg-emerald-100/60' : 'text-stone-600'
            }`}
          >
            <span>{t.expertQueue}</span>
            {pendingReviewsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px]">
                {pendingReviewsCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
