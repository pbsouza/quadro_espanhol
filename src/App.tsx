import { useState, useEffect, useCallback } from 'react';
import { 
  AppLanguage, 
  PageView, 
  MidweekMeeting, 
  WeekendMeeting, 
  Announcement, 
  CleaningSchedule, 
  PublicWitnessingSchedule, 
  CongregationGroup 
} from './types';
import { 
  subscribeMidweekMeetings, 
  subscribeWeekendMeetings, 
  subscribeAnnouncements, 
  subscribeCleaning, 
  subscribeWitnessing, 
  subscribeGroups 
} from './services/firestoreService';
import { findCurrentWeekIndex } from './utils/weekUtils';

import { HomePage } from './components/HomePage';
import { MidweekMeetingPage } from './components/MidweekMeetingPage';
import { WeekendMeetingPage } from './components/WeekendMeetingPage';
import { CleaningPage } from './components/CleaningPage';
import { WitnessingPage } from './components/WitnessingPage';
import { GroupsPage } from './components/GroupsPage';
import { AnnouncementsPage } from './components/AnnouncementsPage';
import { MenuDrawer } from './components/MenuDrawer';
import { AdminPage } from './components/AdminPage';

// Helper to parse valid PageView from URL hash
const getPageViewFromHash = (hash: string): PageView => {
  const cleanHash = hash.replace(/^#\/?/, '').split('?')[0].split('-')[0];
  const validPages: PageView[] = [
    'home',
    'midweek',
    'weekend',
    'cleaning',
    'witnessing',
    'groups',
    'announcements',
    'admin'
  ];
  if (validPages.includes(cleanHash as PageView)) {
    return cleanHash as PageView;
  }
  return 'home';
};

export default function App() {
  const [language, setLanguage] = useState<AppLanguage>('pt');
  
  // Initialize pageView from hash or default to 'home'
  const [pageView, setPageView] = useState<PageView>(() => {
    if (typeof window !== 'undefined') {
      return getPageViewFromHash(window.location.hash);
    }
    return 'home';
  });

  const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);

  const [midweekMeetings, setMidweekMeetings] = useState<MidweekMeeting[]>([]);
  const [weekendMeetings, setWeekendMeetings] = useState<WeekendMeeting[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [cleaningList, setCleaningList] = useState<CleaningSchedule[]>([]);
  const [witnessingList, setWitnessingList] = useState<PublicWitnessingSchedule[]>([]);
  const [groupsList, setGroupsList] = useState<CongregationGroup[]>([]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  // Set up history state management to support browser/mobile back & forward buttons
  useEffect(() => {
    const initialPage = getPageViewFromHash(window.location.hash);
    
    // Ensure initial entry in history has our state structure
    if (!window.history.state || !window.history.state.pageView) {
      window.history.replaceState(
        { pageView: initialPage, isMenuOpen: false },
        '',
        `#${initialPage}`
      );
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.pageView) {
        setPageView(event.state.pageView);
        setIsMenuOpen(!!event.state.isMenuOpen);
      } else {
        const pageFromHash = getPageViewFromHash(window.location.hash);
        setPageView(pageFromHash);
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Controlled navigation function that updates history stack
  const handleNavigate = useCallback((newPage: PageView) => {
    setIsMenuOpen(false);

    setPageView(prevPage => {
      if (window.history.state?.isMenuOpen) {
        // If menu was open, replace history entry instead of stacking duplicate
        window.history.replaceState(
          { pageView: newPage, isMenuOpen: false },
          '',
          `#${newPage}`
        );
      } else if (prevPage !== newPage) {
        // Push new page entry to history stack
        window.history.pushState(
          { pageView: newPage, isMenuOpen: false },
          '',
          `#${newPage}`
        );
      }
      return newPage;
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleToggleMenu = useCallback((open: boolean) => {
    setIsMenuOpen(open);
    if (open) {
      window.history.pushState(
        { pageView, isMenuOpen: true },
        '',
        `#${pageView}?menu=open`
      );
    } else {
      if (window.history.state?.isMenuOpen) {
        window.history.replaceState(
          { pageView, isMenuOpen: false },
          '',
          `#${pageView}`
        );
      }
    }
  }, [pageView]);

  // Subscribe to real-time Firestore collections with local cache fallback
  useEffect(() => {
    let hasSetInitialWeek = false;

    const unsubMidweek = subscribeMidweekMeetings(
      (data) => {
        setMidweekMeetings(data);
        setConnectionError(false);

        // Position on current week automatically when data arrives
        if (!hasSetInitialWeek && data.length > 0) {
          const currentIdx = findCurrentWeekIndex(data);
          setCurrentWeekIndex(currentIdx);
          hasSetInitialWeek = true;
        }
      },
      () => setConnectionError(true)
    );

    const unsubWeekend = subscribeWeekendMeetings((data) => setWeekendMeetings(data));
    const unsubAnnouncements = subscribeAnnouncements((data) => setAnnouncements(data));
    const unsubCleaning = subscribeCleaning((data) => setCleaningList(data));
    const unsubWitnessing = subscribeWitnessing((data) => setWitnessingList(data));
    const unsubGroups = subscribeGroups((data) => setGroupsList(data));

    return () => {
      unsubMidweek();
      unsubWeekend();
      unsubAnnouncements();
      unsubCleaning();
      unsubWitnessing();
      unsubGroups();
    };
  }, []);

  const activeMidweekMeeting = midweekMeetings[currentWeekIndex] || midweekMeetings[0];
  const activeWeekendMeeting = weekendMeetings[currentWeekIndex] || weekendMeetings[0];

  return (
    <div className="min-h-screen bg-[#FDFBF7] selection:bg-[#E8F0E6] selection:text-[#1C4123]">
      {pageView === 'home' && (
        <HomePage
          language={language}
          setLanguage={setLanguage}
          onNavigate={handleNavigate}
          announcements={announcements}
          onOpenAdmin={() => handleNavigate('admin')}
        />
      )}

      {pageView === 'midweek' && (
        <MidweekMeetingPage
          meeting={activeMidweekMeeting}
          allMeetings={midweekMeetings}
          currentWeekIndex={currentWeekIndex}
          setWeekIndex={setCurrentWeekIndex}
          language={language}
          onNavigate={handleNavigate}
          onToggleMenu={() => handleToggleMenu(true)}
          connectionError={connectionError}
          onRetryConnection={() => setConnectionError(false)}
        />
      )}

      {pageView === 'weekend' && (
        <WeekendMeetingPage
          meeting={activeWeekendMeeting}
          allMeetings={weekendMeetings}
          currentWeekIndex={currentWeekIndex}
          setWeekIndex={setCurrentWeekIndex}
          language={language}
          onNavigate={handleNavigate}
          onToggleMenu={() => handleToggleMenu(true)}
        />
      )}

      {pageView === 'cleaning' && (
        <CleaningPage
          cleaningList={cleaningList}
          language={language}
          onNavigate={handleNavigate}
          onToggleMenu={() => handleToggleMenu(true)}
        />
      )}

      {pageView === 'witnessing' && (
        <WitnessingPage
          witnessingList={witnessingList}
          language={language}
          onNavigate={handleNavigate}
          onToggleMenu={() => handleToggleMenu(true)}
        />
      )}

      {pageView === 'groups' && (
        <GroupsPage
          groupsList={groupsList}
          language={language}
          onNavigate={handleNavigate}
          onToggleMenu={() => handleToggleMenu(true)}
        />
      )}

      {pageView === 'announcements' && (
        <AnnouncementsPage
          announcements={announcements}
          language={language}
          onNavigate={handleNavigate}
          onToggleMenu={() => handleToggleMenu(true)}
        />
      )}

      {pageView === 'admin' && (
        <AdminPage
          language={language}
          setLanguage={setLanguage}
          onNavigate={handleNavigate}
          midweekMeetings={midweekMeetings}
          weekendMeetings={weekendMeetings}
          announcements={announcements}
          cleaningList={cleaningList}
          witnessingList={witnessingList}
          groupsList={groupsList}
        />
      )}

      {/* Slide-over menu drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => handleToggleMenu(false)}
        onNavigate={handleNavigate}
        language={language}
        onOpenAdmin={() => handleNavigate('admin')}
      />
    </div>
  );
}
