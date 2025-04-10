import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

// 🔹 카드 덱 생성 및 셔플
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

// 🔹 턴 저장
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

// generateFullDeck — 전체 카드 구성
// shuffle — 셔플 함수
// getPlayerByTurn — 턴 수에 따라 현재 플레이어 계산
// initializeGame — 게임 초기화 로직
// saveNextTurn — 턴 저장 로직

export {
  generateFullDeck, 
  shuffle,
  getPlayerByTurn,
  initializeGame,
  saveNextTurn
};
