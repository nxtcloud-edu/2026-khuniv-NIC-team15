import React, { useState, useEffect, useMemo } from 'react';
import { AFFILIATE_STORES } from './data/stores';
import { FilterType, Store, StudentProfile, KyungHeeCollege } from './types';
import { isStoreAffiliatedWithCollege } from './utils/collegeAffiliation';
import { HeaderNav } from './components/HeaderNav';
import { MapArea } from './components/MapArea';
import { BottomDock } from './components/BottomDock';
import { LadderModal } from './components/LadderModal';
import { RankingModal } from './components/RankingModal';
import { ChatbotModal } from './components/ChatbotModal';
import { FeedbackModal } from './components/FeedbackModal';
import { SavingsCalculatorModal } from './components/SavingsCalculatorModal';
import { StoreDetailModal } from './components/StoreDetailModal';
import { StudentProfileModal } from './components/StudentProfileModal';

export default function App() {
  const [stores] = useState<Store[]>(AFFILIATE_STORES);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isGateFocused, setIsGateFocused] = useState<boolean>(false);

  // Student Profile state
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem('khu_student_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [activeCollege, setActiveCollege] = useState<KyungHeeCollege | 'all'>(() => {
    try {
      const saved = localStorage.getItem('khu_student_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.college) return parsed.college;
      }
    } catch {
      // ignore
    }
    return '공과대학';
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('khu_student_profile');
      return !saved; // Open modal on initial launch if profile is not set
    } catch {
      return true;
    }
  });
  const [isInitialSetup, setIsInitialSetup] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('khu_student_profile');
      return !saved;
    } catch {
      return true;
    }
  });

  // Modals state
  const [isLadderOpen, setIsLadderOpen] = useState(false);
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [rankingTab, setRankingTab] = useState<'popular' | 'discount'>('popular');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSavingsOpen, setIsSavingsOpen] = useState(false);
  const [detailStore, setDetailStore] = useState<Store | null>(null);

  // Active stores based on college selection
  const collegeFilteredStores = useMemo(() => {
    if (activeCollege === 'all') {
      return stores;
    }
    return stores.filter((s) => isStoreAffiliatedWithCollege(s, activeCollege));
  }, [stores, activeCollege]);

  // Total count for current college
  const totalAffiliatedCount = useMemo(() => {
    const targetCollege = activeCollege === 'all' ? (studentProfile?.college || '공과대학') : activeCollege;
    return stores.filter((s) => isStoreAffiliatedWithCollege(s, targetCollege)).length;
  }, [stores, activeCollege, studentProfile]);

  // Filter count for category + college
  const filteredCount = useMemo(() => {
    return collegeFilteredStores.filter(
      (s) => currentFilter === 'all' || s.type === currentFilter
    ).length;
  }, [collegeFilteredStores, currentFilter]);

  const handleSaveProfile = (profile: StudentProfile) => {
    setStudentProfile(profile);
    setActiveCollege(profile.college);
    try {
      localStorage.setItem('khu_student_profile', JSON.stringify(profile));
    } catch {
      // ignore
    }
    setIsInitialSetup(false);
  };

  const handleOpenRank = (tab: 'popular' | 'discount') => {
    setRankingTab(tab);
    setIsRankingOpen(true);
  };

  const handleSelectStoreFromAnywhere = (store: Store) => {
    // If store is filtered out by college, temporarily switch to all or check
    if (activeCollege !== 'all' && !isStoreAffiliatedWithCollege(store, activeCollege)) {
      setActiveCollege('all');
    }
    // If filtered out by category, switch filter to 'all' so marker is visible
    if (currentFilter !== 'all' && store.type !== currentFilter) {
      setCurrentFilter('all');
    }
    setSelectedStore(store);
  };

  const handleFocusGate = () => {
    setIsGateFocused(true);
  };

  const currentCollegeName = activeCollege === 'all' ? (studentProfile?.college || null) : activeCollege;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100 font-sans">
      {/* 1. Header Navigation & Filter Bar */}
      <HeaderNav
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        onSearch={() => {}}
        onSelectStore={handleSelectStoreFromAnywhere}
        onFocusGate={handleFocusGate}
        onOpenLadder={() => setIsLadderOpen(true)}
        onOpenSavings={() => setIsSavingsOpen(true)}
        onOpenProfile={() => {
          setIsInitialSetup(false);
          setIsProfileModalOpen(true);
        }}
        studentProfile={studentProfile}
        stores={collegeFilteredStores}
        activeCollege={activeCollege}
        onSelectActiveCollege={setActiveCollege}
        filteredCount={filteredCount}
        totalAffiliatedCount={totalAffiliatedCount}
      />

      {/* 2. Interactive Map */}
      <main className="w-full h-full">
        <MapArea
          stores={collegeFilteredStores}
          currentFilter={currentFilter}
          selectedStore={selectedStore}
          onSelectStore={setSelectedStore}
          onOpenDetailModal={(store) => setDetailStore(store)}
          isGateFocused={isGateFocused}
          onGateFocusReset={() => setIsGateFocused(false)}
          currentCollege={currentCollegeName}
        />
      </main>

      {/* 3. Bottom Action Dock & AI Chatbot FAB */}
      <BottomDock
        onOpenRank={handleOpenRank}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onToggleChatbot={() => setIsChatbotOpen(!isChatbotOpen)}
        isChatOpen={isChatbotOpen}
      />

      {/* 4. Modals */}
      {/* Student Profile Input Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={studentProfile}
        onSaveProfile={handleSaveProfile}
        isInitialSetup={isInitialSetup}
      />

      <LadderModal
        isOpen={isLadderOpen}
        onClose={() => setIsLadderOpen(false)}
        stores={collegeFilteredStores}
        onSelectStore={handleSelectStoreFromAnywhere}
      />

      <RankingModal
        isOpen={isRankingOpen}
        onClose={() => setIsRankingOpen(false)}
        stores={stores}
        onSelectStore={handleSelectStoreFromAnywhere}
        initialTab={rankingTab}
        currentCollege={studentProfile?.college || '공과대학'}
      />

      <ChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        stores={collegeFilteredStores}
        onSelectStore={handleSelectStoreFromAnywhere}
        studentProfile={studentProfile}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <SavingsCalculatorModal
        isOpen={isSavingsOpen}
        onClose={() => setIsSavingsOpen(false)}
      />

      <StoreDetailModal
        store={detailStore}
        onClose={() => setDetailStore(null)}
        currentCollege={currentCollegeName}
      />
    </div>
  );
}
