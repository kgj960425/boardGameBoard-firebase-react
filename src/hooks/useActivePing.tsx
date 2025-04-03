// hooks/useActivePing.ts
import { useEffect } from "react";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const useActivePing = (roomId: string, uid: string) => {
  useEffect(() => {
    if (!roomId || !uid) return;

    const interval = setInterval(() => {
      const userField = `player.${uid}.lastActive`;
      updateDoc(doc(db, "A.rooms", roomId), {
        [userField]: serverTimestamp()
      });
    }, 30000); // 30초

    return () => clearInterval(interval);
  }, [roomId, uid]);
};
