import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useState } from "react";

export default function useAddBot(roomId: string | undefined, playerCount: number) {
  const [botCounter, setBotCounter] = useState(playerCount + 1);

  const addBot = async () => {
    if (!roomId) return;

    const botUid = `bot_${botCounter}`;
    const botRef = doc(db, "A.rooms", roomId);

    try {
      await updateDoc(botRef, {
        [`player.${botUid}`]: {
          nickname: `봇 ${botCounter}`,
          photoURL: "/bot-profile.png", // public 폴더에 이미지 두기
          isBot: true,
          state: "ready",
        },
      });

      setBotCounter((prev) => prev + 1);
    } catch (err) {
      console.error("봇 추가 실패:", err);
    }
  };

  return {
    addBot,
    nextBotNumber: botCounter,
  };
}
