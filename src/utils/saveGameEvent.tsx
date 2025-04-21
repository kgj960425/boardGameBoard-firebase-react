import {
    doc,
    setDoc,
  } from "firebase/firestore";
  import { db } from "../firebase/firebase";
  import { GameData } from "../types/game";
  import { getNextEventId } from "./getNextEventId";
  
  export async function saveGameEvent(
    actionType: string,
    actor: string,
    gameState: GameData,
    roomId: string
  ): Promise<void> {
    // 1) 항상 최신 상태 문서에 덮어쓰기
    const latestRef = doc(db, "Rooms", roomId, "history", "00000000");
    await setDoc(latestRef, gameState);
  
    // 2) 새로운 이벤트 ID 계산
    const eventId = await getNextEventId(roomId);
  
    // 3) 이벤트 문서 저장
    await setDoc(
      doc(db, "Rooms", roomId, "history", eventId),
      {
        eventId,
        turn: gameState.turn,
        actionType,
        actor,
        gameState,
        createdAt: Date.now(),
      }
    );
  }
  