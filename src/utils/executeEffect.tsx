import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { GameData, PendingEffect } from "../types/game";
import { saveGameEvent } from "./saveGameEvent";

export async function executeEffect(
  roomId: string,
  effect: PendingEffect
): Promise<void> {
  const gameRef = doc(db, "Rooms", roomId, "history", "00000000");
  const snap = await getDoc(gameRef);
  if (!snap.exists()) return;

  const game = snap.data() as GameData;

  // Nope 유예 해제
  game.waitingNope = false;
  game.nopeDeadline = undefined;
  game.pendingEffect = null;

  switch (effect.type) {
    case "favor":
      game.modalRequest = {
        type: "favor",
        from: effect.from,
        targets: [effect.to!],
        payload: {},
        createdAt: effect.createdAt ?? game.turnStart,
      };
      break;

    case "attack":
      game.turnStack = (game.turnStack || 0) + 1;
      break;

    case "skip":
      game.remainingActions = 0;
      break;

    case "shuffle":
      game.deck = game.deck.sort(() => Math.random() - 0.5);
      break;

    case "seeFuture":
      game.modalRequest = {
        type: "seeFuture",
        from: effect.from,
        targets: [effect.from],
        payload: { topCards: effect.topCards },
        createdAt: effect.createdAt ?? game.turnStart,
      };
      break;

    default:
      console.warn("지원하지 않는 카드 효과:", effect.type);
      break;
  }

  await updateDoc(gameRef, game);
  await saveGameEvent(`execute_${effect.type}`, effect.from, game, roomId);
}
