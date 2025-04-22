import { useEffect, useState } from "react";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import userDefault from "../assets/images/userDefault.jpg";

interface PlayerInfo {
  uid: string;
  joinedAt: Timestamp;
  lastActive: Timestamp;
  nickname: string;
  photoURL: string;
  state: string;
  status: string;
}

// 플레이어 정보 훅 (Rooms/{roomId}/player 서브컬렉션 실시간 조회)
export const usePlayerInfo = (roomId: string) => {
  const [playerInfo, setPlayerInfo] = useState<Record<string, PlayerInfo>>({});

  useEffect(() => {
    if (!roomId) return;
    const playerCollectionRef = collection(db, "Rooms", roomId, "player");

    const unsub = onSnapshot(playerCollectionRef, (snap) => {
      const info: Record<string, PlayerInfo> = {};
      snap.docs.forEach((doc) => {
        const data = doc.data();
        info[doc.id] = {
          uid : doc.id,
          nickname: data.nickname ?? "이름을 입력해주세요",
          photoURL: data.photoURL ?? userDefault,
          state: data.state ?? "waiting",
          status: data.status ?? "online",
          joinedAt: data.joinedAt ?? Timestamp.now(),
          lastActive: data.lastActive ?? Timestamp.now(),
        };
      });
      setPlayerInfo(info);
    });

    return () => unsub();
  }, [roomId]);

  return playerInfo;
};
