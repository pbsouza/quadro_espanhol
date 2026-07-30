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
  CongregationGroup,
  CardImages,
  DEFAULT_CARD_IMAGES
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
const SETTINGS_COL = 'app_settings';

// Subscribe to Midweek Meetings (All weeks from database)
export function subscribeMidweekMeetings(
  onUpdate: (data: MidweekMeeting[]) => void,
  onError?: (err: Error) => void
) {
  // 1. Instantly deliver cached data from LocalStorage if available
  const cached = cacheService.getMidweek<MidweekMeeting>();
  if (cached && Array.isArray(cached)) {
    const filteredCached = sortMeetingsChronologically(cached);
    onUpdate(filteredCached);
  } else {
    onUpdate([]);
  }

  if (!db) return () => {};

  try {
    const colRef = collection(db, MIDWEEK_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          cacheService.setMidweek([]);
          onUpdate([]);
        } else {
          const rawList: MidweekMeeting[] = [];
          snapshot.forEach((doc) => {
            rawList.push({ id: doc.id, ...doc.data() } as MidweekMeeting);
          });

          const sortedList = sortMeetingsChronologically(rawList);
          
          // Save locally to cache
          cacheService.setMidweek(sortedList);
          onUpdate(sortedList);
        }
      },
      (error) => {
        console.warn('Firestore subscription error (midweek):', error);
        if (onError) onError(error);
        const fallback = cacheService.getMidweek<MidweekMeeting>() || [];
        onUpdate(sortMeetingsChronologically(fallback));
      }
    );
  } catch (err) {
    console.warn('Error connecting to firestore midweek:', err);
    if (onError && err instanceof Error) onError(err);
    const fallback = cacheService.getMidweek<MidweekMeeting>() || [];
    onUpdate(sortMeetingsChronologically(fallback));
    return () => {};
  }
}

// Subscribe to Weekend Meetings (All weeks from database)
export function subscribeWeekendMeetings(
  onUpdate: (data: WeekendMeeting[]) => void
) {
  const cached = cacheService.getWeekend<WeekendMeeting>();
  if (cached && Array.isArray(cached)) {
    onUpdate(sortMeetingsChronologically(cached));
  } else {
    onUpdate([]);
  }

  if (!db) return () => {};

  try {
    const colRef = collection(db, WEEKEND_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          cacheService.setWeekend([]);
          onUpdate([]);
        } else {
          const rawList: WeekendMeeting[] = [];
          snapshot.forEach((doc) => {
            rawList.push({ id: doc.id, ...doc.data() } as WeekendMeeting);
          });
          const sortedList = sortMeetingsChronologically(rawList);
          cacheService.setWeekend(sortedList);
          onUpdate(sortedList);
        }
      },
      () => {
        const fallback = cacheService.getWeekend<WeekendMeeting>() || [];
        onUpdate(sortMeetingsChronologically(fallback));
      }
    );
  } catch {
    const fallback = cacheService.getWeekend<WeekendMeeting>() || [];
    onUpdate(sortMeetingsChronologically(fallback));
    return () => {};
  }
}

// Subscribe to Announcements
export function subscribeAnnouncements(
  onUpdate: (data: Announcement[]) => void
) {
  const cached = cacheService.getAnnouncements<Announcement>();
  if (cached && Array.isArray(cached)) {
    onUpdate(cached);
  } else {
    onUpdate([]);
  }

  if (!db) return () => {};

  try {
    const colRef = collection(db, ANNOUNCEMENTS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          cacheService.setAnnouncements([]);
          onUpdate([]);
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
        const fallback = cacheService.getAnnouncements<Announcement>() || [];
        onUpdate(fallback);
      }
    );
  } catch {
    const fallback = cacheService.getAnnouncements<Announcement>() || [];
    onUpdate(fallback);
    return () => {};
  }
}

// Subscribe to Cleaning Schedule
export function subscribeCleaning(onUpdate: (data: CleaningSchedule[]) => void) {
  const cached = cacheService.getCleaning<CleaningSchedule>();
  if (cached && Array.isArray(cached)) {
    onUpdate(cached);
  } else {
    onUpdate([]);
  }

  if (!db) return () => {};

  try {
    const colRef = collection(db, CLEANING_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          cacheService.setCleaning([]);
          onUpdate([]);
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
        const fallback = cacheService.getCleaning<CleaningSchedule>() || [];
        onUpdate(fallback);
      }
    );
  } catch {
    const fallback = cacheService.getCleaning<CleaningSchedule>() || [];
    onUpdate(fallback);
    return () => {};
  }
}

// Subscribe to Card Images
export function subscribeCardImages(onUpdate: (data: CardImages) => void) {
  const cached = cacheService.getCardImages<CardImages>();
  const initial = { ...DEFAULT_CARD_IMAGES, ...(cached || {}) };
  onUpdate(initial);

  if (!db) return () => {};

  try {
    const docRef = doc(db, SETTINGS_COL, 'card_images');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as CardImages;
          const merged = { ...DEFAULT_CARD_IMAGES, ...data };
          cacheService.setCardImages(merged);
          onUpdate(merged);
        } else {
          cacheService.setCardImages(DEFAULT_CARD_IMAGES);
          onUpdate(DEFAULT_CARD_IMAGES);
        }
      },
      (err) => {
        console.warn('Firestore subscription error (card_images):', err);
        const fallback = cacheService.getCardImages<CardImages>() || DEFAULT_CARD_IMAGES;
        onUpdate({ ...DEFAULT_CARD_IMAGES, ...fallback });
      }
    );
  } catch (err) {
    console.warn('Error connecting to firestore card_images:', err);
    const fallback = cacheService.getCardImages<CardImages>() || DEFAULT_CARD_IMAGES;
    onUpdate({ ...DEFAULT_CARD_IMAGES, ...fallback });
    return () => {};
  }
}

export async function saveCardImages(images: CardImages): Promise<void> {
  const merged = { ...DEFAULT_CARD_IMAGES, ...images };
  cacheService.setCardImages(merged);

  if (db) {
    const docRef = doc(db, SETTINGS_COL, 'card_images');
    await setDoc(docRef, merged, { merge: true });
  }
}

export function subscribeWitnessing(onUpdate: (data: PublicWitnessingSchedule[]) => void) {
  const cached = cacheService.getWitnessing<PublicWitnessingSchedule>();
  if (cached && Array.isArray(cached)) {
    onUpdate(cached);
  } else {
    onUpdate([]);
  }

  if (!db) return () => {};

  try {
    const colRef = collection(db, WITNESSING_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          cacheService.setWitnessing([]);
          onUpdate([]);
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
        const fallback = cacheService.getWitnessing<PublicWitnessingSchedule>() || [];
        onUpdate(fallback);
      }
    );
  } catch {
    const fallback = cacheService.getWitnessing<PublicWitnessingSchedule>() || [];
    onUpdate(fallback);
    return () => {};
  }
}

// Subscribe to Groups
export function subscribeGroups(onUpdate: (data: CongregationGroup[]) => void) {
  const cached = cacheService.getGroups<CongregationGroup>();
  if (cached && Array.isArray(cached)) {
    onUpdate(cached);
  } else {
    onUpdate([]);
  }

  if (!db) return () => {};

  try {
    const colRef = collection(db, GROUPS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          cacheService.setGroups([]);
          onUpdate([]);
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
        const fallback = cacheService.getGroups<CongregationGroup>() || [];
        onUpdate(fallback);
      }
    );
  } catch {
    const fallback = cacheService.getGroups<CongregationGroup>() || [];
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
  const cleanMeeting: MidweekMeeting = JSON.parse(JSON.stringify(meeting));
  const cached = cacheService.getMidweek<MidweekMeeting>() || [];
  const idx = cached.findIndex((m) => m.id === cleanMeeting.id);
  let updated = [...cached];
  if (idx >= 0) {
    updated[idx] = cleanMeeting;
  } else {
    updated.push(cleanMeeting);
  }
  updated = sortMeetingsChronologically(updated);
  cacheService.setMidweek(updated);

  if (db) {
    try {
      const docRef = doc(db, MIDWEEK_COL, cleanMeeting.id);
      await setDoc(docRef, cleanMeeting, { merge: true });
    } catch (err) {
      console.error(`Error saving midweek meeting ${cleanMeeting.id} to Firestore:`, err);
      throw err;
    }
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
  const cleanMeeting: WeekendMeeting = JSON.parse(JSON.stringify(meeting));
  const cached = cacheService.getWeekend<WeekendMeeting>() || [];
  const idx = cached.findIndex((m) => m.id === cleanMeeting.id);
  let updated = [...cached];
  if (idx >= 0) {
    updated[idx] = cleanMeeting;
  } else {
    updated.push(cleanMeeting);
  }
  updated = sortMeetingsChronologically(updated);
  cacheService.setWeekend(updated);

  if (db) {
    try {
      const docRef = doc(db, WEEKEND_COL, cleanMeeting.id);
      await setDoc(docRef, cleanMeeting, { merge: true });
    } catch (err) {
      console.error(`Error saving weekend meeting ${cleanMeeting.id} to Firestore:`, err);
      throw err;
    }
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
