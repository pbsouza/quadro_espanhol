import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  MidweekMeeting, 
  WeekendMeeting, 
  Announcement, 
  CleaningSchedule, 
  PublicWitnessingSchedule, 
  CongregationGroup 
} from '../types';
import { 
  INITIAL_MIDWEEK_MEETINGS, 
  INITIAL_WEEKEND_MEETINGS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_CLEANING, 
  INITIAL_WITNESSING, 
  INITIAL_GROUPS 
} from '../data/initialData';
import { filterMeetingsBy21Weeks, sortMeetingsChronologically } from '../utils/weekUtils';
import { cacheService } from './cacheService';

// Collection references
const MIDWEEK_COL = 'midweek_meetings';
const WEEKEND_COL = 'weekend_meetings';
const ANNOUNCEMENTS_COL = 'announcements';
const CLEANING_COL = 'cleaning_schedule';
const WITNESSING_COL = 'public_witnessing';
const GROUPS_COL = 'groups';

// Subscribe to Midweek Meetings (10 past weeks, current week, 10 future weeks)
export function subscribeMidweekMeetings(
  onUpdate: (data: MidweekMeeting[]) => void,
  onError?: (err: Error) => void
) {
  // 1. Instantly deliver cached data from LocalStorage if available
  const cached = cacheService.getMidweek<MidweekMeeting>();
  if (cached && cached.length > 0) {
    const filteredCached = sortMeetingsChronologically(filterMeetingsBy21Weeks(cached));
    onUpdate(filteredCached);
  } else {
    onUpdate(INITIAL_MIDWEEK_MEETINGS);
  }

  if (!db) return () => {};

  try {
    const colRef = collection(db, MIDWEEK_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          // Seed automatically if empty with 21 weeks
          seedCollection(MIDWEEK_COL, INITIAL_MIDWEEK_MEETINGS);
          cacheService.setMidweek(INITIAL_MIDWEEK_MEETINGS);
          onUpdate(INITIAL_MIDWEEK_MEETINGS);
        } else {
          const rawList: MidweekMeeting[] = [];
          snapshot.forEach((doc) => {
            rawList.push({ id: doc.id, ...doc.data() } as MidweekMeeting);
          });

          // Filter strictly for 21-weeks window (10 past, 1 current, 10 future)
          const windowedList = sortMeetingsChronologically(filterMeetingsBy21Weeks(rawList));
          
          // Save locally to cache
          cacheService.setMidweek(windowedList);
          onUpdate(windowedList);
        }
      },
      (error) => {
        console.warn('Firestore subscription error (midweek):', error);
        if (onError) onError(error);
        const fallback = cacheService.getMidweek<MidweekMeeting>() || INITIAL_MIDWEEK_MEETINGS;
        onUpdate(sortMeetingsChronologically(filterMeetingsBy21Weeks(fallback)));
      }
    );
  } catch (err) {
    console.warn('Error connecting to firestore midweek:', err);
    if (onError && err instanceof Error) onError(err);
    const fallback = cacheService.getMidweek<MidweekMeeting>() || INITIAL_MIDWEEK_MEETINGS;
    onUpdate(sortMeetingsChronologically(filterMeetingsBy21Weeks(fallback)));
    return () => {};
  }
}

// Subscribe to Weekend Meetings (10 past weeks, current week, 10 future weeks)
export function subscribeWeekendMeetings(
  onUpdate: (data: WeekendMeeting[]) => void
) {
  const cached = cacheService.getWeekend<WeekendMeeting>();
  if (cached && cached.length > 0) {
    onUpdate(sortMeetingsChronologically(filterMeetingsBy21Weeks(cached)));
  } else {
    onUpdate(INITIAL_WEEKEND_MEETINGS);
  }

  if (!db) return () => {};

  try {
    const colRef = collection(db, WEEKEND_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedCollection(WEEKEND_COL, INITIAL_WEEKEND_MEETINGS);
          cacheService.setWeekend(INITIAL_WEEKEND_MEETINGS);
          onUpdate(INITIAL_WEEKEND_MEETINGS);
        } else {
          const rawList: WeekendMeeting[] = [];
          snapshot.forEach((doc) => {
            rawList.push({ id: doc.id, ...doc.data() } as WeekendMeeting);
          });
          const windowedList = sortMeetingsChronologically(filterMeetingsBy21Weeks(rawList));
          cacheService.setWeekend(windowedList);
          onUpdate(windowedList);
        }
      },
      () => {
        const fallback = cacheService.getWeekend<WeekendMeeting>() || INITIAL_WEEKEND_MEETINGS;
        onUpdate(sortMeetingsChronologically(filterMeetingsBy21Weeks(fallback)));
      }
    );
  } catch {
    const fallback = cacheService.getWeekend<WeekendMeeting>() || INITIAL_WEEKEND_MEETINGS;
    onUpdate(sortMeetingsChronologically(filterMeetingsBy21Weeks(fallback)));
    return () => {};
  }
}

// Subscribe to Announcements
export function subscribeAnnouncements(
  onUpdate: (data: Announcement[]) => void
) {
  const cached = cacheService.getAnnouncements<Announcement>();
  if (cached && cached.length > 0) {
    onUpdate(cached);
  } else {
    onUpdate(INITIAL_ANNOUNCEMENTS);
  }

  if (!db) return () => {};

  try {
    const colRef = collection(db, ANNOUNCEMENTS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedCollection(ANNOUNCEMENTS_COL, INITIAL_ANNOUNCEMENTS);
          cacheService.setAnnouncements(INITIAL_ANNOUNCEMENTS);
          onUpdate(INITIAL_ANNOUNCEMENTS);
        } else {
          const list: Announcement[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Announcement);
          });
          cacheService.setAnnouncements(list);
          onUpdate(list);
        }
      },
      () => {
        const fallback = cacheService.getAnnouncements<Announcement>() || INITIAL_ANNOUNCEMENTS;
        onUpdate(fallback);
      }
    );
  } catch {
    const fallback = cacheService.getAnnouncements<Announcement>() || INITIAL_ANNOUNCEMENTS;
    onUpdate(fallback);
    return () => {};
  }
}

// Subscribe to Cleaning Schedule
export function subscribeCleaning(onUpdate: (data: CleaningSchedule[]) => void) {
  const cached = cacheService.getCleaning<CleaningSchedule>();
  if (cached && cached.length > 0) {
    onUpdate(cached);
  } else {
    onUpdate(INITIAL_CLEANING);
  }

  if (!db) return () => {};

  try {
    const colRef = collection(db, CLEANING_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedCollection(CLEANING_COL, INITIAL_CLEANING);
          cacheService.setCleaning(INITIAL_CLEANING);
          onUpdate(INITIAL_CLEANING);
        } else {
          const list: CleaningSchedule[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as CleaningSchedule);
          });
          cacheService.setCleaning(list);
          onUpdate(list);
        }
      },
      () => {
        const fallback = cacheService.getCleaning<CleaningSchedule>() || INITIAL_CLEANING;
        onUpdate(fallback);
      }
    );
  } catch {
    const fallback = cacheService.getCleaning<CleaningSchedule>() || INITIAL_CLEANING;
    onUpdate(fallback);
    return () => {};
  }
}

// Subscribe to Public Witnessing
export function subscribeWitnessing(onUpdate: (data: PublicWitnessingSchedule[]) => void) {
  const cached = cacheService.getWitnessing<PublicWitnessingSchedule>();
  if (cached && cached.length > 0) {
    onUpdate(cached);
  } else {
    onUpdate(INITIAL_WITNESSING);
  }

  if (!db) return () => {};

  try {
    const colRef = collection(db, WITNESSING_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedCollection(WITNESSING_COL, INITIAL_WITNESSING);
          cacheService.setWitnessing(INITIAL_WITNESSING);
          onUpdate(INITIAL_WITNESSING);
        } else {
          const list: PublicWitnessingSchedule[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as PublicWitnessingSchedule);
          });
          cacheService.setWitnessing(list);
          onUpdate(list);
        }
      },
      () => {
        const fallback = cacheService.getWitnessing<PublicWitnessingSchedule>() || INITIAL_WITNESSING;
        onUpdate(fallback);
      }
    );
  } catch {
    const fallback = cacheService.getWitnessing<PublicWitnessingSchedule>() || INITIAL_WITNESSING;
    onUpdate(fallback);
    return () => {};
  }
}

// Subscribe to Groups
export function subscribeGroups(onUpdate: (data: CongregationGroup[]) => void) {
  const cached = cacheService.getGroups<CongregationGroup>();
  if (cached && cached.length > 0) {
    onUpdate(cached);
  } else {
    onUpdate(INITIAL_GROUPS);
  }

  if (!db) return () => {};

  try {
    const colRef = collection(db, GROUPS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedCollection(GROUPS_COL, INITIAL_GROUPS);
          cacheService.setGroups(INITIAL_GROUPS);
          onUpdate(INITIAL_GROUPS);
        } else {
          const list: CongregationGroup[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as CongregationGroup);
          });
          list.sort((a, b) => a.number - b.number);
          cacheService.setGroups(list);
          onUpdate(list);
        }
      },
      () => {
        const fallback = cacheService.getGroups<CongregationGroup>() || INITIAL_GROUPS;
        onUpdate(fallback);
      }
    );
  } catch {
    const fallback = cacheService.getGroups<CongregationGroup>() || INITIAL_GROUPS;
    onUpdate(fallback);
    return () => {};
  }
}

// Utility to seed collection
async function seedCollection<T extends { id: string }>(collectionName: string, items: T[]) {
  if (!db) return;
  try {
    for (const item of items) {
      await setDoc(doc(db, collectionName, item.id), item);
    }
  } catch (err) {
    console.warn(`Could not seed collection ${collectionName}:`, err);
  }
}

// Save or Update Midweek Meeting
export async function saveMidweekMeeting(meeting: MidweekMeeting): Promise<void> {
  const cached = cacheService.getMidweek<MidweekMeeting>() || [];
  const idx = cached.findIndex((m) => m.id === meeting.id);
  let updated = [...cached];
  if (idx >= 0) {
    updated[idx] = meeting;
  } else {
    updated.push(meeting);
  }
  updated = sortMeetingsChronologically(filterMeetingsBy21Weeks(updated));
  cacheService.setMidweek(updated);

  if (db) {
    const docRef = doc(db, MIDWEEK_COL, meeting.id);
    await setDoc(docRef, meeting, { merge: true });
  }
}

// Delete Midweek Meeting
export async function deleteMidweekMeeting(id: string): Promise<void> {
  const cached = cacheService.getMidweek<MidweekMeeting>() || [];
  const updated = cached.filter((m) => m.id !== id);
  cacheService.setMidweek(updated);

  if (db) {
    await deleteDoc(doc(db, MIDWEEK_COL, id));
  }
}

// Save or Update Weekend Meeting
export async function saveWeekendMeeting(meeting: WeekendMeeting): Promise<void> {
  const cached = cacheService.getWeekend<WeekendMeeting>() || [];
  const idx = cached.findIndex((m) => m.id === meeting.id);
  let updated = [...cached];
  if (idx >= 0) {
    updated[idx] = meeting;
  } else {
    updated.push(meeting);
  }
  updated = sortMeetingsChronologically(filterMeetingsBy21Weeks(updated));
  cacheService.setWeekend(updated);

  if (db) {
    const docRef = doc(db, WEEKEND_COL, meeting.id);
    await setDoc(docRef, meeting, { merge: true });
  }
}

// Delete Weekend Meeting
export async function deleteWeekendMeeting(id: string): Promise<void> {
  const cached = cacheService.getWeekend<WeekendMeeting>() || [];
  const updated = cached.filter((m) => m.id !== id);
  cacheService.setWeekend(updated);

  if (db) {
    await deleteDoc(doc(db, WEEKEND_COL, id));
  }
}

// Save Announcement
export async function saveAnnouncement(announcement: Announcement): Promise<void> {
  const cached = cacheService.getAnnouncements<Announcement>() || [];
  const idx = cached.findIndex((a) => a.id === announcement.id);
  const updated = [...cached];
  if (idx >= 0) updated[idx] = announcement;
  else updated.unshift(announcement);
  cacheService.setAnnouncements(updated);

  if (db) {
    const docRef = doc(db, ANNOUNCEMENTS_COL, announcement.id);
    await setDoc(docRef, announcement, { merge: true });
  }
}

// Delete Announcement
export async function deleteAnnouncement(id: string): Promise<void> {
  const cached = cacheService.getAnnouncements<Announcement>() || [];
  const updated = cached.filter((a) => a.id !== id);
  cacheService.setAnnouncements(updated);

  if (db) {
    await deleteDoc(doc(db, ANNOUNCEMENTS_COL, id));
  }
}

// Save Cleaning Schedule
export async function saveCleaningSchedule(item: CleaningSchedule): Promise<void> {
  const cached = cacheService.getCleaning<CleaningSchedule>() || [];
  const idx = cached.findIndex((c) => c.id === item.id);
  const updated = [...cached];
  if (idx >= 0) updated[idx] = item;
  else updated.push(item);
  cacheService.setCleaning(updated);

  if (db) {
    const docRef = doc(db, CLEANING_COL, item.id);
    await setDoc(docRef, item, { merge: true });
  }
}

// Delete Cleaning Schedule
export async function deleteCleaningSchedule(id: string): Promise<void> {
  const cached = cacheService.getCleaning<CleaningSchedule>() || [];
  const updated = cached.filter((c) => c.id !== id);
  cacheService.setCleaning(updated);

  if (db) {
    await deleteDoc(doc(db, CLEANING_COL, id));
  }
}

// Save Witnessing Schedule
export async function saveWitnessingSchedule(item: PublicWitnessingSchedule): Promise<void> {
  const cached = cacheService.getWitnessing<PublicWitnessingSchedule>() || [];
  const idx = cached.findIndex((w) => w.id === item.id);
  const updated = [...cached];
  if (idx >= 0) updated[idx] = item;
  else updated.push(item);
  cacheService.setWitnessing(updated);

  if (db) {
    const docRef = doc(db, WITNESSING_COL, item.id);
    await setDoc(docRef, item, { merge: true });
  }
}

// Delete Witnessing Schedule
export async function deleteWitnessingSchedule(id: string): Promise<void> {
  const cached = cacheService.getWitnessing<PublicWitnessingSchedule>() || [];
  const updated = cached.filter((w) => w.id !== id);
  cacheService.setWitnessing(updated);

  if (db) {
    await deleteDoc(doc(db, WITNESSING_COL, id));
  }
}

// Save Congregation Group
export async function saveGroup(group: CongregationGroup): Promise<void> {
  const cached = cacheService.getGroups<CongregationGroup>() || [];
  const idx = cached.findIndex((g) => g.id === group.id);
  const updated = [...cached];
  if (idx >= 0) updated[idx] = group;
  else updated.push(group);
  updated.sort((a, b) => a.number - b.number);
  cacheService.setGroups(updated);

  if (db) {
    const docRef = doc(db, GROUPS_COL, group.id);
    await setDoc(docRef, group, { merge: true });
  }
}

// Delete Group
export async function deleteGroup(id: string): Promise<void> {
  const cached = cacheService.getGroups<CongregationGroup>() || [];
  const updated = cached.filter((g) => g.id !== id);
  cacheService.setGroups(updated);

  if (db) {
    await deleteDoc(doc(db, GROUPS_COL, id));
  }
}

// Seed All Initial Data explicitly
export async function seedAllData(): Promise<void> {
  await seedCollection(MIDWEEK_COL, INITIAL_MIDWEEK_MEETINGS);
  await seedCollection(WEEKEND_COL, INITIAL_WEEKEND_MEETINGS);
  await seedCollection(ANNOUNCEMENTS_COL, INITIAL_ANNOUNCEMENTS);
  await seedCollection(CLEANING_COL, INITIAL_CLEANING);
  await seedCollection(WITNESSING_COL, INITIAL_WITNESSING);
  await seedCollection(GROUPS_COL, INITIAL_GROUPS);
}

// Clear All Database Data Permanently
export async function clearAllDatabaseData(): Promise<void> {
  cacheService.setMidweek([]);
  cacheService.setWeekend([]);
  cacheService.setAnnouncements([]);
  cacheService.setCleaning([]);
  cacheService.setWitnessing([]);
  cacheService.setGroups([]);

  if (db) {
    const cols = [MIDWEEK_COL, WEEKEND_COL, ANNOUNCEMENTS_COL, CLEANING_COL, WITNESSING_COL, GROUPS_COL];
    for (const cName of cols) {
      try {
        const snapshot = await getDocs(collection(db, cName));
        for (const docItem of snapshot.docs) {
          await deleteDoc(doc(db, cName, docItem.id));
        }
      } catch (err) {
        console.warn(`Error clearing collection ${cName}:`, err);
      }
    }
  }
}
