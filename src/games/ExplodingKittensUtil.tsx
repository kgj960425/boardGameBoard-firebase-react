import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

// ---------------------- 카드 로직 유틸 ----------------------

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

// ---------------------- 초기화 및 턴 저장 ----------------------

const initializeGame = async (roomId: string) => {
  const gameId = `r.${roomId}`;
  const firstTurnRef = doc(db, gameId, "0");
  if ((await getDoc(firstTurnRef)).exists()) return;

  const roomSnap = await getDoc(doc(db, "A.rooms", roomId));
  if (!roomSnap.exists()) return;

  const players = Object.keys(roomSnap.data().player);
  const turnOrder = shuffle(players);
  let deck = shuffle(generateFullDeck());

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
  };

  await setDoc(firstTurnRef, gameData);
  await setDoc(doc(db, gameId, "now"), gameData);
};

const saveNextTurn = async ({
  roomId, turn, currentPlayer, nextPlayer,
  playerCards, deck, discardPile, discard,
  playedCard, lastPlayedCard, deadPlayers = [],
}: {
  roomId: string;
  turn: number;
  currentPlayer: string;
  nextPlayer: string;
  playerCards: Record<string, Record<string, string>>;
  deck: string[];
  discardPile: string[];
  discard: string[];
  playedCard: string | null;
  lastPlayedCard: string | null;
  deadPlayers?: string[];
}) => {
  await setDoc(doc(db, `r.${roomId}`, `${turn}`), {
    turn,
    turnStart: new Date(),
    turnEnd: null,
    currentPlayer,
    nextPlayer,
    playerCards,
    deck,
    discardPile,
    discard,
    playedCard,
    lastPlayedCard,
    deadPlayers,
  });
};

// ---------------------- 카드 제출 처리 ----------------------

type GameData = {
  turn: number;
  turnStart: Date;
  turnEnd: Date | null;
  currentPlayer: string;
  nextPlayer: string | null;
  playerCards: Record<string, Record<string, string>>;
  deck: string[];
  discardPile: string[];
  discard: string[];
  playedCard: string | null;
  lastPlayedCard: string | null;
  turnStack: number;
  remainingActions: number;
  deadPlayers: string[];
  turnOrder: string[];
};

async function submitCard(
  roomId: string,
  selectedCards: string[],
  nowData: GameData
) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  if (nowData.currentPlayer !== uid) {
    alert("지금은 당신의 턴이 아닙니다.");
    return;
  }

  const myHand = Object.values(nowData.playerCards[uid] || {});
  const isValid = selectedCards.every(card => myHand.includes(card));
  if (!isValid) {
    alert("제출한 카드 중 유효하지 않은 카드가 있습니다.");
    return;
  }

  const updatedHand = { ...nowData.playerCards[uid] };
  Object.entries(updatedHand).forEach(([k, v]) => {
    if (selectedCards.includes(v)) delete updatedHand[k];
  });

  const updatedDiscard = [...(nowData.discard ?? []), ...selectedCards];
  const updatedNowData = {
    ...nowData,
    playerCards: {
      ...nowData.playerCards,
      [uid]: updatedHand,
    },
    discard: updatedDiscard,
    turnStack: selectedCards.includes("Attack")
      ? nowData.turnStack + 1
      : nowData.turnStack,
  };

  const nowRef = doc(db, `r.${roomId}`, "now");
  const turnId = nowData.turn.toString().padStart(3, "0");
  const turnRef = doc(db, `r.${roomId}`, turnId);

  await updateDoc(nowRef, updatedNowData);
  await setDoc(turnRef, {
    ...nowData,
    discard: updatedDiscard,
    historyType: true,
  });
}

async function drawCard(
  roomId: string,
  nowData: GameData,
  onNeedInsertBomb: (deck: string[], updatedHand: Record<string, string>) => void
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const nowRef = doc(db, `r.${roomId}`, "now");

  const deck = [...nowData.deck];
  const topCard = deck.shift();
  const myHand = { ...nowData.playerCards[uid] };

  if (!topCard) return;

  if (topCard === "Exploding Kitten") {
    const defuseEntry = Object.entries(myHand).find(([_, v]) => v === "Defuse");

    if (defuseEntry) {
      const [defuseKey] = defuseEntry;
      delete myHand[defuseKey];
      onNeedInsertBomb(deck, myHand);
      return;
    } else {
      const updatedDead = [...nowData.deadPlayers, uid];
      const updatedOrder = nowData.turnOrder.filter((x) => x !== uid);

      await updateDoc(nowRef, {
        ...nowData,
        deadPlayers: updatedDead,
        turnOrder: updatedOrder,
      });
      return;
    }
  }

  const slot = Date.now().toString();
  myHand[slot] = topCard;

  const nextPlayer = getPlayerByTurn(
    nowData.turn + 1,
    nowData.turnOrder,
    nowData.deadPlayers
  );

  await setDoc(doc(db, `r.${roomId}`, nowData.turn.toString().padStart(3, "0")), {
    ...nowData,
    historyType: true,
  });

  await updateDoc(nowRef, {
    playerCards: {
      ...nowData.playerCards,
      [uid]: myHand,
    },
    deck,
    discard: [],
    turnStack: 0,
    currentPlayer: nowData.nextPlayer,
    nextPlayer,
    turn: nowData.turn + 1,
  });
}

async function insertBombAt(
  roomId: string,
  nowData: GameData,
  deck: string[],
  updatedHand: Record<string, string>,
  insertIndex: number
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const newDeck = [...deck];
  newDeck.splice(insertIndex, 0, "Exploding Kitten");

  const nowRef = doc(db, `r.${roomId}`, "now");
  const nextPlayer = getPlayerByTurn(
    nowData.turn + 1,
    nowData.turnOrder,
    nowData.deadPlayers
  );

  await setDoc(doc(db, `r.${roomId}`, nowData.turn.toString().padStart(3, "0")), {
    ...nowData,
    historyType: true,
  });

  await updateDoc(nowRef, {
    playerCards: {
      ...nowData.playerCards,
      [uid]: updatedHand,
    },
    deck: newDeck,
    discard: [],
    turnStack: 0,
    currentPlayer: nowData.nextPlayer,
    nextPlayer,
    turn: nowData.turn + 1,
  });
}

async function handleFavorSelectedCard(
  roomId: string,
  fromUid: string,
  toUid: string,
  cardKey: string
): Promise<void> {
  const nowRef = doc(db, `r.${roomId}`, "now");
  const nowSnap = await getDoc(nowRef);
  const nowData = nowSnap.data() as GameData;
  if (!nowData) return;

  const fromHand = { ...nowData.playerCards[fromUid] };
  const toHand = { ...nowData.playerCards[toUid] };
  const selectedCard = fromHand[cardKey];
  if (!selectedCard) return;

  delete fromHand[cardKey];
  const newSlot = Date.now().toString();
  toHand[newSlot] = selectedCard;

  await updateDoc(nowRef, {
    playerCards: {
      ...nowData.playerCards,
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
  saveNextTurn,
  submitCard,
  drawCard,
  insertBombAt,
  handleFavorSelectedCard,
};