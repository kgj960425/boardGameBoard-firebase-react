// hooks/cleanupGhostRooms.ts
import { getDocs, updateDoc, doc, collection, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const cleanupGhostRooms = async () => {
  const now = Date.now();
  const threeMinute = 3 * 60 * 1000;

  const roomQuery = query(collection(db, "A.rooms"), where("state", "==", "waiting"));
  const snapshot = await getDocs(roomQuery);

  for (const roomDoc of snapshot.docs) {
    const roomData = roomDoc.data();
    const playerEntries = Object.entries(roomData.player || {});

    if (playerEntries.length === 0) continue;

    const allGhosts = playerEntries.every(([_, player]: [string, any]) => {
      const lastActive = player?.lastActive?.toMillis?.();
      return !lastActive || lastActive < now - threeMinute;
    });

    if (allGhosts) {
      const roomRef = doc(db, "A.rooms", roomDoc.id);
      console.log(`[유령 방] ${roomDoc.id} → 상태 변경: finished`);
      await updateDoc(roomRef, {
        state: "finished"
      });
    }
  }
};
