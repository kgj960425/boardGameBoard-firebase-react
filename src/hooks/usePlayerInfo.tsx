import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

interface PlayerInfo {
  nickname: string;
  photoURL: string;
}

// 🔹 플레이어 정보 훅
export const usePlayerInfo = (roomId: string | undefined) => {
  const [playerInfo, setPlayerInfo] = useState<Record<string, PlayerInfo>>({});

  useEffect(() => {
    if (!roomId) return;
    const ref = doc(db, "A.rooms", roomId);
    const unsub = onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const player = data.player ?? {};
        const mapped: Record<string, PlayerInfo> = {};
        Object.entries(player).forEach(([uid, info]: any) => {
          mapped[uid] = {
            nickname: info.nickname ?? "NoName",
            photoURL: info.photoURL ?? "/default-profile.png",
          };
        });
        setPlayerInfo(mapped);
      }
    });
    return () => unsub();
  }, [roomId]);

  return playerInfo;
};