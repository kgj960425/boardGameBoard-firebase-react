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

    const allGhosts = playerEntries.every(([_, player]: [string, any]) => {
      const lastActive = player?.lastActive?.toMillis?.();
      return !lastActive || lastActive < now - threeMinute;
    });

    if (allGhosts) {
      const roomRef = doc(db, "A.rooms", roomDoc.id);
      await updateDoc(roomRef, {
        state: "finished"
      });
    }
  }
};
