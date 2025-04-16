import { getDocs, updateDoc, doc, collection, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const cleanupGhostRooms = async () => {
  const now = Date.now();
  const threeMinute = 3 * 60 * 1000;

  const roomQuery = query(collection(db, "Rooms"), where("state", "==", "waiting"));
  const snapshot = await getDocs(roomQuery);

  for (const roomDoc of snapshot.docs) {
    const roomId = roomDoc.id;
    const playerColRef = collection(db, "Rooms", roomId, "player");
    const playerSnap = await getDocs(playerColRef);

    // 플레이어가 없으면 => 유령방 취급
    if (playerSnap.empty) {
      await updateDoc(doc(db, "Rooms", roomId), { state: "finished" });
      continue;
    }

    const allGhosts = playerSnap.docs.every((doc) => {
      const data = doc.data();
      const lastActive = data.lastActive?.toMillis?.();
      return !lastActive || lastActive < now - threeMinute;
    });

    if (allGhosts) {
      await updateDoc(doc(db, "Rooms", roomId), { state: "finished" });
    }
  }
};
