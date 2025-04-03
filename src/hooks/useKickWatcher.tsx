// hooks/useKickWatcher.ts
import { useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

export const useKickWatcher = (roomId: string) => {
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!roomId || !uid) return;

    const roomRef = doc(db, "A.rooms", roomId);

    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      const data = docSnap.data();
      const players = data?.player || {};

      if (!players[uid]) {
        alert("방에서 강퇴되었습니다.");
        navigate("/roomlist");
      }
    });

    return () => unsubscribe();
  }, [roomId, uid, navigate]);
};
