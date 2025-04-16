import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useState } from "react";
import userDefault from "../assets/images/userDefault.jpg";

export default function useAddBot(roomId: string | undefined, playerCount: number) {
  const [botCounter, setBotCounter] = useState(playerCount + 1);

  const addBot = async () => {
    if (!roomId) return;

    const botUid = `bot_${botCounter}`;
    const botRef = doc(db, "Rooms", roomId, "player", botUid);

    try {
      await setDoc(botRef, {
        nickname: `봇 ${botCounter}`,
        photoURL: userDefault,
        isBot: true,
        state: "ready",
        status: "online", // 혹시 필요하면 추가
        joinedAt: new Date(),
        lastActive: new Date(),
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
