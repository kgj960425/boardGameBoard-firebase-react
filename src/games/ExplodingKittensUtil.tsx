import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  runTransaction, Timestamp
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import {useGameEvents} from "../utils/useGameEvents.tsx";
import {addGameEvent} from "../utils/addGameEvent.tsx";
import {GameEventModel, RoomDoc, historyModel} from "../models/ExplodingKittensModel.tsx";
import {useEffect, useState} from "react";


// 이벤트 로그 구독 훅
export function useSubscribeToRoomEvents(roomId: string) {
  const [events, setEvents] = useState<GameEventModel[]>([]);

  useEffect(() => {
    if (!roomId) return;
    const eventsCol = collection(db, "Rooms", roomId, "events");
    const q = query(eventsCol, orderBy("createDttm", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as GameEventModel),
          }))
      );
    });
    return () => unsub();
  }, [roomId]);

  return events;
}

export function useSubscribeToRoomDoc(roomId: string) {
  const [room, setRoom] = useState<RoomDoc>();

  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, "Rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, (snap) => {
      setRoom(snap.data() as RoomDoc);
    });
    return () => unsubscribe();
  }, [roomId]);

  return room;
}

export function useSubscribeToRoomHistory(roomId: string) {
  const [history, setHistory] = useState<historyModel>();

  useEffect(() => {
    if (!roomId) return;
    const historyDoc = doc(db, "Rooms", roomId, "history", "00000000");
    const unsub = onSnapshot(historyDoc, (snap) => {
      setHistory(snap.data() as historyModel);
    });
    return () => unsub();
  }, [roomId]);

  return history;
}

type CardType =
    | "Favor"
    | "Shuffle"
    | "SeeFuture"
    | "Attack"
    | "Skip"
    | "Nope"
    | "Defuse"
    | "Taco Cat"
    | "Hairy Potato Cat"
    | "Rainbow Ralphing Cat"
    | "Cattermelon"
    | "Beard Cat";

interface CardSubmission {
  cards: CardType[]; // 제출된 카드 배열
}

export const validateCardSubmission = (submission: CardSubmission): string | null => {
  const { cards } = submission;

  // Nope 카드가 포함된 경우 검증 실패
  if (cards.includes("Nope" as unknown as CardType)) {
    return "Nope 카드는 일반 카드 제출로 사용할 수 없습니다."; // 오류 메시지 반환
  }

  // 카드 타입별 개수 계산
  const cardCounts: Record<CardType, number> = cards.reduce((acc, card) => {
    acc[card] = acc[card] ? acc[card] + 1 : 1;
    return acc;
  }, {} as Record<CardType, number>);

  // 함수: 규칙 체크 헬퍼
  const isSingleCard = (card: CardType) => cardCounts[card] === 1;

  const countCardTypes = () => Object.keys(cardCounts).length;

  const isTwoOfSameType = () => Object.values(cardCounts).some((count) => count === 2);

  const isThreeOfSameType = () => Object.values(cardCounts).some((count) => count === 3);

  const isFiveUniqueTypes = () => countCardTypes() === 5 && cards.length === 5;

  // 검증 로직
  if (cards.length === 1) {
    // 단일 카드 제출 규칙
    const singleCardTypes: CardType[] = [
      "Favor",
      "Shuffle",
      "SeeFuture",
      "Attack",
      "Skip",
      "Nope",
      "Defuse",
      "Taco Cat",
      "Hairy Potato Cat",
      "Rainbow Ralphing Cat",
      "Cattermelon",
      "Beard Cat",
    ];

    if (singleCardTypes.includes(cards[0])) return null; // 유효한 단일 카드
    return "잘못된 단일 카드 제출입니다.";
  }

  if (cards.length === 2 && isTwoOfSameType()) {
    // 동일한 카드 2장 규칙
    return null;
  }

  if (cards.length === 3 && isThreeOfSameType()) {
    // 동일한 카드 3장 규칙
    return null;
  }

  if (isFiveUniqueTypes()) {
    // 서로 다른 5종 카드 규칙
    return null;
  }

  return "제출된 카드가 규칙에 맞지 않습니다.";
};


const generateFullDeck = (): string[] => [
  ...Array(4).fill("Attack"),
  ...Array(4).fill("Skip"),
  ...Array(4).fill("Favor"),
  ...Array(4).fill("Shuffle"),
  ...Array(5).fill("See the Future"),
  ...Array(5).fill("Nope"),
  ...Array(4).fill("Taco Cat"),
  ...Array(4).fill("Hairy Potato Cat"),
  ...Array(4).fill("Rainbow Ralphing Cat"),
  ...Array(4).fill("Cattermelon"),
  ...Array(4).fill("Beard Cat"),
  ...Array(6).fill("Defuse"),
  ...Array(4).fill("Exploding Kitten"),
];

const shuffle = <T,>(array: T[]): T[] =>
    array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

const getPlayerByTurn = (
    turn: number,
    turnOrder: string[],
    deadPlayers: string[] = []
) => {
  const alive = turnOrder.filter(uid => !deadPlayers.includes(uid));
  return alive[turn % alive.length];
};

const initializeGame = async (roomId: string) => {
  const playerSnap = await getDocs(collection(db, "Rooms", roomId, "player"));
  const players = playerSnap.docs.map((d) => d.id);

  //게임 순서 셋팅
  const turnOrder = shuffle(players);
  //덱 셋팅
  let deck = shuffle(generateFullDeck());

  //
  const playerCards: Record<string, Record<string, string>> = {};

  for (const uid of players) {
    const hand: string[] = [];
    // 7장 뽑기 (폭탄·디퓨즈 제외)
    while (hand.length < 7) {
      const c = deck.shift()!;
      if (c !== "Defuse" && c !== "Exploding Kitten") hand.push(c);
      else deck.push(c);
    }
    // 디퓨즈 1장 반드시 포함
    const defIdx = deck.findIndex((c) => c === "Defuse");
    if (defIdx >= 0) hand.push(deck.splice(defIdx, 1)[0]);

    // slot 번호 매핑
    playerCards[uid] = {};
    hand.forEach((c, i) => {
      playerCards[uid][String(i + 1)] = c;
    });
  }

  // 남은 카드 + 폭탄 섞기
  const defuses = deck.filter((c) => c === "Defuse").slice(0, 2);
  const kittens = deck
      .filter((c) => c === "Exploding Kitten")
      .slice(0, players.length - 1);
  deck = shuffle([
    ...deck.filter((c) => c !== "Defuse" && c !== "Exploding Kitten"),
    ...defuses,
    ...kittens,
  ]);

  const baseData = {
    turn: 1,
    turnStart: Timestamp.now(),
    turnEnd: Timestamp.now(),
    currentPlayer: "INITIALIZE",
    turnOrder,
    playerCards,
    deck,
    discardPile: [],
    discard: [],
    lastPlayedCard: null,
    turnStack: 0,
    deadPlayers: [],
    modalRequest: null,
    explosionEvent: null,
  };

  const eventMeta = {
    eventId: "00000001",
    actionType: "INITIALIZE" as const,
    actorUid: "SYSTEM",
    timestamp: Timestamp.now(),
  };

  const firstEvent = {
    ...baseData,
    ...eventMeta,
  };

  // 3) 트랜잭션으로 동시에 쓰기
  await runTransaction(db, async (tx) => {
    const histPath = `Rooms/${roomId}/history`;
    const snapRef = doc(db, histPath, "00000000");
    const firstRef = doc(db, histPath, "00000001");

    // 첫 이벤트(로그) 저장
    tx.set(firstRef, firstEvent);
    // 최신 상태 스냅샷 덮어쓰기
    tx.set(snapRef, firstEvent);
  });
};

async function submitCard(
    roomId: string,
    selectedCards: string[],
    gameData: historyModel
){
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  if (selectedCards.length === 0) {
    return passTurn(roomId, gameData);
  }

  //핸드 인증
  const myHand: Record<string, string> = { ...gameData.playerCards[uid] };
  const myCards = Object.values(myHand);
  const isValid = selectedCards.every(card => myCards.includes(card));
  if (!isValid) return null;

  // 카드 제출
  const updatedHand: Record<string, string> = {};
  let removed = 0;
  for (const [key, value] of Object.entries(myHand)) {
    if (selectedCards.includes(value) && removed < selectedCards.length) {
      removed++;
    } else {
      updatedHand[key] = value as string;
    }
  }

  const updatedDiscard = [...(gameData.discard ?? []), ...selectedCards];
  const currentTurnRef = doc(db, "Rooms", roomId, "history", "00000000");

  await updateDoc(currentTurnRef, {
    playerCards: {
      ...gameData.playerCards,
      [uid]: updatedHand,
    },
    discard: updatedDiscard,
  });

  //모달 요청 처리
  await triggerModalRequestIfNeeded(roomId, gameData, selectedCards);

  return {
    updatedHand,
    updatedDiscard,
  };
}

export async function passTurn(
    roomId: string,
    gameData: historyModel
): Promise<{ drawnCard?: string; updatedHand: Record<string, string> }> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No auth");

  // 1) 덱에서 한 장 드로우
  const newDeck = [...gameData.deck];
  const drawn = newDeck.shift();

  // 2) 내 핸드에 추가
  const newHand = { ...gameData.playerCards[uid] };
  if (drawn) {
    newHand[Date.now().toString()] = drawn;
  }

  // 3) 다음 턴으로 넘어가기 (endTurn 유틸 사용)
  //    endTurn(roomId, gameData, updatedPlayerCards, updatedDeck, discard, discardPile)
  await endTurn(
      roomId,
      gameData,
      { ...gameData.playerCards, [uid]: newHand },
      newDeck,
      [],                   // 새로 쌓는 discard는 없음
      gameData.discardPile  // 기존 discardPile 유지
  );

  return { drawnCard: drawn, updatedHand: newHand };
}

async function drawCard(
    roomId: string,
    gameData: any,
    onNeedInsertBomb: (deck: string[], updatedHand: Record<string, string>) => void
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const deck = [...gameData.deck];
  const topCard = deck.shift();
  const myHand = { ...gameData.playerCards[uid] };

  if (!topCard) return;

  // 폭탄 뽑은 경우
  if (topCard === "Exploding Kitten") {
    const defuseEntry = Object.entries(myHand).find(([_, v]) => v === "Defuse");

    if (defuseEntry) {
      const [defuseKey] = defuseEntry;
      delete myHand[defuseKey];
      onNeedInsertBomb(deck, myHand);
      return;
    } else {
      const updatedDead = [...gameData.deadPlayers, uid];
      const updatedOrder = gameData.turnOrder.filter((x: string) => x !== uid);

      await endTurn(
          roomId,
          {
            ...gameData,
            deadPlayers: updatedDead,
            turnOrder: updatedOrder,
          },
          gameData.playerCards,
          deck,
          [],
          gameData.discardPile
      );
      return;
    }
  }

  // 일반 카드 뽑은 경우
  const slot = Date.now().toString();
  myHand[slot] = topCard;

  await endTurn(
      roomId,
      gameData,
      {
        ...gameData.playerCards,
        [uid]: myHand,
      },
      deck,
      [],
      gameData.discardPile
  );
}

/// 모달 요청 처리
/// - Favor: 상대에게 카드 요청
async function triggerModalRequestIfNeeded(
    roomId: string,
    gameData: any,
    selectedCards: string[]
) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const effectCard = selectedCards[0];
  if (!effectCard) return;

  const currentTurnId = gameData.turn.toString().padStart(8, "0");
  const currentTurnRef = doc(db, "Rooms", roomId, "history", currentTurnId);
  const allTargets = Object.keys(gameData.playerCards).filter(id => id !== uid);

  switch (effectCard) {
    case "Favor":
      await updateDoc(currentTurnRef, {
        modalRequest: {
          type: "favor",
          from: uid,
          targets: allTargets,
          createdAt: new Date(),
          payload: {},
        },
      });
      break;

    case "See the Future":
      await updateDoc(currentTurnRef, {
        modalRequest: {
          type: "seeFuture",
          from: uid,
          targets: [uid],
          createdAt: new Date(),
          payload: {
            topCards: gameData.deck.slice(0, 3),
          },
        },
      });
      break;

    case "ChooseCard":
      await updateDoc(currentTurnRef, {
        modalRequest: {
          type: "chooseCard",
          from: uid,
          targets: allTargets,
          createdAt: new Date(),
          payload: {},
        },
      });
      break;

    default: {
      const powerless = [
        "Taco Cat",
        "Hairy Potato Cat",
        "Rainbow Ralphing Cat",
        "Cattermelon",
        "Beard Cat",
      ];
      const uniquePowerless = [...new Set(selectedCards.filter(c => powerless.includes(c)))];

      if (selectedCards.length === 5 && uniquePowerless.length === 5) {
        await updateDoc(currentTurnRef, {
          modalRequest: {
            type: "recover-from-discard",
            from: uid,
            targets: [uid],
            createdAt: new Date(),
            payload: {
              discardPile: gameData.discardPile ?? [],
            },
          },
        });
      }
      break;
    }
  }
}

//폭탄 삽입 이벤트인건가?
async function insertBombAt(
    roomId: string,
    nowData: any,
    deck: string[],
    updatedHand: Record<string, string>,
    insertIndex: number
) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const newDeck = [...deck];
  newDeck.splice(insertIndex, 0, "Exploding Kitten");

  const currentTurnId = nowData.turn.toString().padStart(8, "0");
  const nextTurn = nowData.turn + 1;
  const nextTurnId = nextTurn.toString().padStart(8, "0");
  const nextPlayer = getPlayerByTurn(nextTurn, nowData.turnOrder, nowData.deadPlayers);

  await setDoc(doc(db, "Rooms", roomId, "history", currentTurnId), {
    ...nowData,
    historyType: true,
  });

  await endTurn(
      roomId,
      nowData,
      {
        ...nowData.playerCards,
        [uid]: updatedHand,
      },
      newDeck,
      [],
      nowData.discardPile,
  );
}

//이건 뭐지???
async function handleFavorSelectedCard(
    roomId: string,
    fromUid: string,
    toUid: string,
    cardKey: string,
    turn: any,
) {
  const ref = doc(db, "Rooms", roomId, "history", turn);
  console.log(ref);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as any;

  const fromHand = { ...data.playerCards[fromUid] };
  const toHand = { ...data.playerCards[toUid] };
  const selectedCard = fromHand[cardKey];
  if (!selectedCard) return;

  delete fromHand[cardKey];
  const newSlot = Date.now().toString();
  toHand[newSlot] = selectedCard;

  await updateDoc(ref, {
    playerCards: {
      ...data.playerCards,
      [fromUid]: fromHand,
      [toUid]: toHand,
    },
  });
}

const endTurn = async (
    roomId: string,
    gameData: any,
    updatedPlayerCards: Record<string, Record<string, string>>,
    updatedDeck: string[],
    discard: string[],
    discardPile: string[],
) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const nextTurn = gameData.turn + 1;
  const nextTurnId = nextTurn.toString().padStart(8, "0");
  const nextPlayer = getPlayerByTurn(nextTurn, gameData.turnOrder, gameData.deadPlayers);

  await setDoc(doc(db, "Rooms", roomId, "history", nextTurnId), {
    ...gameData,
    playerCards: updatedPlayerCards,
    deck: updatedDeck,
    discard: [],
    discardPile,
    currentPlayer: gameData.nextPlayer,
    nextPlayer,
    turn: nextTurn,
    turnStart: new Date(),
    turnEnd: null,
    remainingActions: 0,
  });
};

const resolveCardEffect = async (
    roomId: string,
    gameData: any,
    selectedCards: string[]
) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const effectCard = selectedCards[0];
  if (!effectCard) return;

  const currentTurnId = gameData.turn.toString().padStart(8, "0");
  const currentTurnRef = doc(db, "Rooms", roomId, "history", currentTurnId);

  if (["Favor", "Shuffle", "See the Future"].includes(effectCard)) {
    await updateDoc(currentTurnRef, {
      modalRequest: {
        type: effectCard.toLowerCase(),
        from: uid,
        targets: Object.keys(gameData.playerCards).filter((id) => id !== uid),
        createdAt: new Date(),
        payload: {},
      },
    });
    return;
  }

  if (["Attack", "Skip"].includes(effectCard)) {
    await updateDoc(currentTurnRef, {
      nopeQueue: {
        effectCard,
        effectFrom: uid,
        selectedCards,
        createdAt: new Date(),
        expireAt: new Date(Date.now() + 3000),
        resolved: false,
        nopes: [],
      },
    });
    return;
  }

  const powerlessCards = [
    "Taco Cat",
    "Hairy Potato Cat",
    "Rainbow Ralphing Cat",
    "Cattermelon",
    "Beard Cat",
  ];

  const allPowerless = selectedCards.every(card => powerlessCards.includes(card));
  const unique = [...new Set(selectedCards)];

  if (selectedCards.length === 2 && unique.length === 1 && allPowerless) {
    await updateDoc(currentTurnRef, {
      modalRequest: {
        type: "steal-random",
        from: uid,
        targets: Object.keys(gameData.playerCards).filter((id) => id !== uid),
        createdAt: new Date(),
        payload: {},
      },
    });
    return;
  }

  if (selectedCards.length === 3 && unique.length === 1 && allPowerless) {
    await updateDoc(currentTurnRef, {
      modalRequest: {
        type: "steal-specific",
        from: uid,
        targets: Object.keys(gameData.playerCards).filter((id) => id !== uid),
        createdAt: new Date(),
        payload: {},
      },
    });
    return;
  }

  const uniquePowerless = [...new Set(selectedCards.filter(c => powerlessCards.includes(c)))];
  if (selectedCards.length === 5 && uniquePowerless.length === 5) {
    await updateDoc(currentTurnRef, {
      modalRequest: {
        type: "recover-from-discard",
        from: uid,
        targets: [],
        createdAt: new Date(),
        payload: {
          discardPile: gameData.discardPile ?? [],
        },
      },
    });
    return;
  }
};

export const handleNopeEvent = async (roomId: string, from: string, to: string | null = null) => {
  const payload = {}; // nope 이벤트에는 추가 데이터가 필요하지 않을 수 있음
  await addGameEvent(roomId, "nope", payload, from, to);
};

export const handleRecoverFromDiscard = async (
    roomId: string,
    from: string,
    chosenCard: string
) => {
  const payload = { card: chosenCard };
  await addGameEvent(roomId, "recover-from-discard", payload, from);
};

export async function consumeTurnAndAdvancePlayer(
    roomId: string,
    gameState: historyModel
): Promise<void> {
  const { turnStack, currentPlayer, turnOrder, turn } = gameState;

  // 1턴 소모
  const newTurnStack = turnStack - 1;

  // 다음 플레이어 결정
  let newCurrentPlayer = currentPlayer;
  if (newTurnStack < 1) {
    const idx = turnOrder.indexOf(currentPlayer);
    // 다음 인덱스(마지막이면 처음으로)
    const nextIdx = (idx + 1) % turnOrder.length;
    newCurrentPlayer = turnOrder[nextIdx];
  }

  // Firestore 에 반영
  const turnId = String(turn).padStart(8, "0");
  const turnRef = doc(db, "Rooms", roomId, "history", turnId);
  await updateDoc(turnRef, {
    turnStack: newTurnStack,
    currentPlayer: newCurrentPlayer,
  });
}

export {
  useGameEvents,
  addGameEvent,
  generateFullDeck,
  shuffle,
  getPlayerByTurn,
  initializeGame,
  submitCard,
  drawCard,
  endTurn,
  insertBombAt,
  handleFavorSelectedCard,
};