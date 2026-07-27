import React, { useState, useEffect } from 'react';
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

import { HomePage } from './components/HomePage';
import { MidweekMeetingPage } from './components/MidweekMeetingPage';
import { WeekendMeetingPage } from './components/WeekendMeetingPage';
import { CleaningPage } from './components/CleaningPage';
import { WitnessingPage } from './components/WitnessingPage';
import { GroupsPage } from './components/GroupsPage';
import { AnnouncementsPage } from './components/AnnouncementsPage';
import { MenuDrawer } from './components/MenuDrawer';
import { AdminPage } from './components/AdminPage';

export default function App() {
  const [language, setLanguage] = useState<AppLanguage>('pt');
  const [pageView, setPageView] = useState<PageView>('home');
  const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);

  const [midweekMeetings, setMidweekMeetings] = useState<MidweekMeeting[]>([]);
  const [weekendMeetings, setWeekendMeetings] = useState<WeekendMeeting[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [cleaningList, setCleaningList] = useState<CleaningSchedule[]>([]);
  const [witnessingList, setWitnessingList] = useState<PublicWitnessingSchedule[]>([]);
  const [groupsList, setGroupsList] = useState<CongregationGroup[]>([]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  // Subscribe to real-time Firestore collections
  useEffect(() => {
    const unsubMidweek = subscribeMidweekMeetings(
      (data) => {
        setMidweekMeetings(data);
        setConnectionError(false);
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
          onNavigate={setPageView}
          announcements={announcements}
          onOpenAdmin={() => setPageView('admin')}
        />
      )}

      {pageView === 'midweek' && (
        <MidweekMeetingPage
          meeting={activeMidweekMeeting}
          allMeetings={midweekMeetings}
          currentWeekIndex={currentWeekIndex}
          setWeekIndex={setCurrentWeekIndex}
          language={language}
          onNavigate={setPageView}
          onToggleMenu={() => setIsMenuOpen(true)}
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
          onNavigate={setPageView}
          onToggleMenu={() => setIsMenuOpen(true)}
        />
      )}

      {pageView === 'cleaning' && (
        <CleaningPage
          cleaningList={cleaningList}
          language={language}
          onNavigate={setPageView}
          onToggleMenu={() => setIsMenuOpen(true)}
        />
      )}

      {pageView === 'witnessing' && (
        <WitnessingPage
          witnessingList={witnessingList}
          language={language}
          onNavigate={setPageView}
          onToggleMenu={() => setIsMenuOpen(true)}
        />
      )}

      {pageView === 'groups' && (
        <GroupsPage
          groupsList={groupsList}
          language={language}
          onNavigate={setPageView}
          onToggleMenu={() => setIsMenuOpen(true)}
        />
      )}

      {pageView === 'announcements' && (
        <AnnouncementsPage
          announcements={announcements}
          language={language}
          onNavigate={setPageView}
          onToggleMenu={() => setIsMenuOpen(true)}
        />
      )}

      {pageView === 'admin' && (
        <AdminPage
          language={language}
          onNavigate={setPageView}
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
        onClose={() => setIsMenuOpen(false)}
        onNavigate={setPageView}
        language={language}
        onOpenAdmin={() => setPageView('admin')}
      />
    </div>
  );
}
