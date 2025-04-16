import { useEffect } from "react";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const useActivePing = (roomId: string, uid: string) => {
  useEffect(() => {
    if (!roomId || !uid) return;

    const interval = setInterval(() => {
      const playerRef = doc(db, "Rooms", roomId, "player", uid); // ✅ 서브컬렉션 경로
      updateDoc(playerRef, {
        lastActive: serverTimestamp(),
      });
    }, 30000); // 30초마다 ping

    return () => clearInterval(interval);
  }, [roomId, uid]);
};
