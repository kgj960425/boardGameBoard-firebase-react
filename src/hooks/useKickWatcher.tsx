import { useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

export const useKickWatcher = (roomId: string) => {
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!roomId || !uid) return;

    const myPlayerRef = doc(db, "Rooms", roomId, "player", uid);

    const unsubscribe = onSnapshot(myPlayerRef, (docSnap) => {
      if (!docSnap.exists()) {
        alert("방에서 강퇴되었습니다.");
        navigate("/roomlist");
      }
    });

    return () => unsubscribe();
  }, [roomId, uid, navigate]);
};
