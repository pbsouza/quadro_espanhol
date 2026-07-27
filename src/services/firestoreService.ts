import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc,
  query,
  orderBy
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

// Collection references
const MIDWEEK_COL = 'midweek_meetings';
const WEEKEND_COL = 'weekend_meetings';
const ANNOUNCEMENTS_COL = 'announcements';
const CLEANING_COL = 'cleaning_schedule';
const WITNESSING_COL = 'public_witnessing';
const GROUPS_COL = 'groups';

// Subscribe to Midweek Meetings
export function subscribeMidweekMeetings(
  onUpdate: (data: MidweekMeeting[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, MIDWEEK_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          // Seed automatically if empty
          seedCollection(MIDWEEK_COL, INITIAL_MIDWEEK_MEETINGS);
          onUpdate(INITIAL_MIDWEEK_MEETINGS);
        } else {
          const list: MidweekMeeting[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as MidweekMeeting);
          });
          onUpdate(list);
        }
      },
      (error) => {
        console.warn('Firestore subscription error (midweek):', error);
        if (onError) onError(error);
        onUpdate(INITIAL_MIDWEEK_MEETINGS);
      }
    );
  } catch (err) {
    console.warn('Error connecting to firestore midweek:', err);
    if (onError && err instanceof Error) onError(err);
    onUpdate(INITIAL_MIDWEEK_MEETINGS);
    return () => {};
  }
}

// Subscribe to Weekend Meetings
export function subscribeWeekendMeetings(
  onUpdate: (data: WeekendMeeting[]) => void
) {
  try {
    const colRef = collection(db, WEEKEND_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedCollection(WEEKEND_COL, INITIAL_WEEKEND_MEETINGS);
          onUpdate(INITIAL_WEEKEND_MEETINGS);
        } else {
          const list: WeekendMeeting[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as WeekendMeeting);
          });
          onUpdate(list);
        }
      },
      () => onUpdate(INITIAL_WEEKEND_MEETINGS)
    );
  } catch {
    onUpdate(INITIAL_WEEKEND_MEETINGS);
    return () => {};
  }
}

// Subscribe to Announcements
export function subscribeAnnouncements(
  onUpdate: (data: Announcement[]) => void
) {
  try {
    const colRef = collection(db, ANNOUNCEMENTS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedCollection(ANNOUNCEMENTS_COL, INITIAL_ANNOUNCEMENTS);
          onUpdate(INITIAL_ANNOUNCEMENTS);
        } else {
          const list: Announcement[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Announcement);
          });
          onUpdate(list);
        }
      },
      () => onUpdate(INITIAL_ANNOUNCEMENTS)
    );
  } catch {
    onUpdate(INITIAL_ANNOUNCEMENTS);
    return () => {};
  }
}

// Subscribe to Cleaning Schedule
export function subscribeCleaning(onUpdate: (data: CleaningSchedule[]) => void) {
  try {
    const colRef = collection(db, CLEANING_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedCollection(CLEANING_COL, INITIAL_CLEANING);
          onUpdate(INITIAL_CLEANING);
        } else {
          const list: CleaningSchedule[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as CleaningSchedule);
          });
          onUpdate(list);
        }
      },
      () => onUpdate(INITIAL_CLEANING)
    );
  } catch {
    onUpdate(INITIAL_CLEANING);
    return () => {};
  }
}

// Subscribe to Public Witnessing
export function subscribeWitnessing(onUpdate: (data: PublicWitnessingSchedule[]) => void) {
  try {
    const colRef = collection(db, WITNESSING_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedCollection(WITNESSING_COL, INITIAL_WITNESSING);
          onUpdate(INITIAL_WITNESSING);
        } else {
          const list: PublicWitnessingSchedule[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as PublicWitnessingSchedule);
          });
          onUpdate(list);
        }
      },
      () => onUpdate(INITIAL_WITNESSING)
    );
  } catch {
    onUpdate(INITIAL_WITNESSING);
    return () => {};
  }
}

// Subscribe to Groups
export function subscribeGroups(onUpdate: (data: CongregationGroup[]) => void) {
  try {
    const colRef = collection(db, GROUPS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedCollection(GROUPS_COL, INITIAL_GROUPS);
          onUpdate(INITIAL_GROUPS);
        } else {
          const list: CongregationGroup[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as CongregationGroup);
          });
          list.sort((a, b) => a.number - b.number);
          onUpdate(list);
        }
      },
      () => onUpdate(INITIAL_GROUPS)
    );
  } catch {
    onUpdate(INITIAL_GROUPS);
    return () => {};
  }
}

// Utility to seed collection
async function seedCollection<T extends { id: string }>(collectionName: string, items: T[]) {
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
  const docRef = doc(db, MIDWEEK_COL, meeting.id);
  await setDoc(docRef, meeting, { merge: true });
}

// Delete Midweek Meeting
export async function deleteMidweekMeeting(id: string): Promise<void> {
  await deleteDoc(doc(db, MIDWEEK_COL, id));
}

// Save or Update Weekend Meeting
export async function saveWeekendMeeting(meeting: WeekendMeeting): Promise<void> {
  const docRef = doc(db, WEEKEND_COL, meeting.id);
  await setDoc(docRef, meeting, { merge: true });
}

// Delete Weekend Meeting
export async function deleteWeekendMeeting(id: string): Promise<void> {
  await deleteDoc(doc(db, WEEKEND_COL, id));
}

// Save Announcement
export async function saveAnnouncement(announcement: Announcement): Promise<void> {
  const docRef = doc(db, ANNOUNCEMENTS_COL, announcement.id);
  await setDoc(docRef, announcement, { merge: true });
}

// Delete Announcement
export async function deleteAnnouncement(id: string): Promise<void> {
  await deleteDoc(doc(db, ANNOUNCEMENTS_COL, id));
}

// Save Cleaning Schedule
export async function saveCleaningSchedule(item: CleaningSchedule): Promise<void> {
  const docRef = doc(db, CLEANING_COL, item.id);
  await setDoc(docRef, item, { merge: true });
}

// Delete Cleaning Schedule
export async function deleteCleaningSchedule(id: string): Promise<void> {
  await deleteDoc(doc(db, CLEANING_COL, id));
}

// Save Witnessing Schedule
export async function saveWitnessingSchedule(item: PublicWitnessingSchedule): Promise<void> {
  const docRef = doc(db, WITNESSING_COL, item.id);
  await setDoc(docRef, item, { merge: true });
}

// Delete Witnessing Schedule
export async function deleteWitnessingSchedule(id: string): Promise<void> {
  await deleteDoc(doc(db, WITNESSING_COL, id));
}

// Save Congregation Group
export async function saveGroup(group: CongregationGroup): Promise<void> {
  const docRef = doc(db, GROUPS_COL, group.id);
  await setDoc(docRef, group, { merge: true });
}

// Delete Group
export async function deleteGroup(id: string): Promise<void> {
  await deleteDoc(doc(db, GROUPS_COL, id));
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
