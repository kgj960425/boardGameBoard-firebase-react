import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
  } from "firebase/firestore";
  import { db } from "../firebase/firebase";
  
  export async function getNextEventIdFromRoomid(roomId: string): Promise<string> {
    const q = query(
      collection(db, 'rooms', roomId, 'history'),
      orderBy('eventId', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    const lastId = snap.docs[0]?.data().eventId || '00000000';
    const next = String(Number(lastId) + 1).padStart(8, '0');
    return next;
  }
  
  export function getNextEventIdFromGameData(
    gameDataId: string | { eventId: string }
  ): string {
    const lastId = typeof gameDataId === 'string' ? gameDataId : gameDataId.eventId;
    return String(Number(lastId) + 1).padStart(8, '0');
  }