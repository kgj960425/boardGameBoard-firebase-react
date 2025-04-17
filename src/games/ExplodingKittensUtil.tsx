import {doc, setDoc, getDoc, updateDoc, collection, getDocs} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

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
  const historyDocRef = doc(db, "Rooms", roomId, "history", "00000000");
  const playerCollectionRef = collection(db, "Rooms", roomId, "player");

  const playerSnapshots = await getDocs(playerCollectionRef);
  const players = playerSnapshots.docs.map((doc) => doc.id);
  if (players.length === 0) return;

  const turnOrder = shuffle(players);
  const deck = shuffle(generateFullDeck());

  const playerCards: Record<string, Record<string, string>> = {};
  for (const uid of players) {
    const hand: string[] = [];
    while (hand.length < 7) {
      const card = deck.shift();
      if (card && !["Defuse", "Exploding Kitten"].includes(card)) hand.push(card);
      else deck.push(card!);
    }
    const defuseIdx = deck.findIndex(c => c === "Defuse");
    if (defuseIdx !== -1) hand.push(deck.splice(defuseIdx, 1)[0]);
    playerCards[uid] = {};
    hand.forEach((c, i) => (playerCards[uid][`${i + 1}`] = c));
  }

  const remainingDefuses = deck.filter(c => c === "Defuse").slice(0, 2);
  const kittens = deck.filter(c => c === "Exploding Kitten").slice(0, players.length - 1);
  const finalDeck = shuffle([
    ...deck.filter(c => !["Defuse", "Exploding Kitten"].includes(c)),
    ...remainingDefuses,
    ...kittens,
  ]);

  const gameData = {
    turn: 1,
    turnStart: new Date(),
    turnEnd: null,
    currentPlayer: turnOrder[0],
    nextPlayer: turnOrder[1] ?? null,
    playerCards,
    deck: finalDeck,
    discardPile: [],
    discard: [],
    playedCard: null,
    lastPlayedCard: null,
    turnStack: 0,
    remainingActions: 1,
    deadPlayers: [],
    turnOrder,
    modalRequest: {
      type: null,
      targets: [],
      from: null,
      payload: {},
      createdAt: new Date(),
    },
    explosionEvent: {
      player: null,
      hasDefuse: null,
    },
  };

  await setDoc(historyDocRef, gameData);
};

async function submitCard(
  roomId: string,
  selectedCards: string[],
  gameData: any,
  onNeedInsertBomb: (deck: string[], updatedHand: Record<string, string>) => void
) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  // 1. 현재 유저의 핸드 정보 복사
  const myHand = { ...gameData.playerCards[uid] };
  const myCards = Object.values(myHand);

  // 2. 선택한 카드가 유저 핸드에 모두 포함되어 있는지 검증
  const isValid = selectedCards.every(card => myCards.includes(card));
  if (!isValid) return;

  // 3. 핸드에서 선택한 카드를 제거
  const updatedHand: Record<string, string> = {};
  let removed = 0;
  for (const [key, value] of Object.entries(myHand) as [string, string][]) {
    if (selectedCards.includes(value) && removed < selectedCards.length) {
      removed++;
    } else {
      updatedHand[key] = value as string;
    }
  }

  const isAttack = selectedCards.includes("Attack");
  const isSkip = selectedCards.includes("Skip");

  const updatedDiscard = [...(gameData.discard ?? []), ...selectedCards];
  const nextTurn = gameData.turn + 1;
  const currentTurnId = gameData.turn.toString().padStart(8, "0");
  const nextTurnId = nextTurn.toString().padStart(8, "0");

  // 4. 현재 턴 데이터 기록 (history 백업)
  await setDoc(doc(db, "Rooms", roomId, "history", currentTurnId), {
    ...gameData,
    historyType: true,
  });

  // 5. Attack 또는 Skip 카드면 드로우 없이 바로 턴 종료
  if (isAttack || isSkip) {
    await setDoc(doc(db, "Rooms", roomId, "history", nextTurnId), {
      ...gameData,
      playerCards: {
        ...gameData.playerCards,
        [uid]: updatedHand,
      },
      discard: [],
      discardPile: [...(gameData.discardPile ?? []), ...selectedCards],
      currentPlayer: gameData.nextPlayer,
      nextPlayer: getPlayerByTurn(nextTurn + 1, gameData.turnOrder, gameData.deadPlayers),
      turn: nextTurn,
      turnStart: new Date(),
      turnEnd: null,
      turnStack: isAttack ? gameData.turnStack + 1 : 0,
      remainingActions: 0,
    });
    return;
  }

  // 6. 일반 카드일 경우: 드로우 진행
  const deck = [...gameData.deck];
  const topCard = deck.shift();
  if (!topCard) return;

  // 6-1. 드로우한 카드가 폭탄일 경우
  if (topCard === "Exploding Kitten") {
    const defuseEntry = Object.entries(updatedHand).find(([_, v]) => v === "Defuse");

    if (defuseEntry) {
      // 6-1-a. Defuse가 있으면 제거하고 유저에게 폭탄 삽입 위치 요청
      delete updatedHand[defuseEntry[0]];
      onNeedInsertBomb(deck, updatedHand);
      return;
    } else {
      // 6-1-b. Defuse가 없으면 유저 탈락 처리 후 턴 넘김
      const updatedDead = [...gameData.deadPlayers, uid];
      await setDoc(doc(db, "Rooms", roomId, "history", nextTurnId), {
        ...gameData,
        playerCards: {
          ...gameData.playerCards,
          [uid]: updatedHand,
        },
        discard: updatedDiscard,
        discardPile: [...(gameData.discardPile ?? []), ...selectedCards],
        deadPlayers: updatedDead,
        turnOrder: gameData.turnOrder.filter((x: string) => x !== uid),
        turn: nextTurn,
        turnStart: new Date(),
        turnEnd: null,
        remainingActions: 0,
      });
      return;
    }
  }

  // 6-2. 일반 카드면 핸드에 추가
  updatedHand[Date.now().toString()] = topCard;

  // 7. 다음 턴 정보로 새로운 게임 상태 저장
  await setDoc(doc(db, "Rooms", roomId, "history", nextTurnId), {
    ...gameData,
    playerCards: {
      ...gameData.playerCards,
      [uid]: updatedHand,
    },
    discard: [],
    discardPile: [...(gameData.discardPile ?? []), ...selectedCards],
    deck,
    turn: nextTurn,
    currentPlayer: gameData.nextPlayer,
    nextPlayer: getPlayerByTurn(nextTurn + 1, gameData.turnOrder, gameData.deadPlayers),
    turnStart: new Date(),
    turnEnd: null,
    remainingActions: 0,
  });
}

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
  await setDoc(doc(db, "Rooms", roomId, "history", nextTurnId), {
    ...nowData,
    playerCards: {
      ...nowData.playerCards,
      [uid]: updatedHand,
    },
    deck: newDeck,
    discard: [],
    turn: nextTurn,
    currentPlayer: nowData.nextPlayer,
    nextPlayer,
    turnStart: new Date(),
    turnEnd: null,
    remainingActions: 0,
  });
}


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

export {
  generateFullDeck,
  shuffle,
  getPlayerByTurn,
  initializeGame,
  submitCard,
  insertBombAt,
  handleFavorSelectedCard,
};