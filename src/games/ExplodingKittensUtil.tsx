import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const ExplodingKittensUtil = () => {
    function generateFullDeck(): string[] {
        return [
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
    }

  function shuffle<T>(array: T[]): T[] {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  async function initializeGame(roomId: string): Promise<void> {
    const roomRef = doc(db, "A.rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;

    const roomData = roomSnap.data();
    const gameId: string = roomData?.gameSetting?.games ?? `r.${roomId}`;

    const alreadyInitializedRef = doc(db, gameId, "0");
    const alreadyInitializedSnap = await getDoc(alreadyInitializedRef);

    if (alreadyInitializedSnap.exists()) {
      return; // 이미 초기화됨 아무 것도 하지 않음
    }

    const players = Object.keys(roomData.player);
    const playerCount = players.length;

    let deck = shuffle(generateFullDeck());

    const playerCards: Record<string, Record<string, string>> = {};
    for (const uid of players) {
      const hand: string[] = [];

      while (hand.length < 4) {
        const card = deck.shift();
        if (card && card !== "Defuse" && card !== "Exploding Kitten") {
          hand.push(card);
        } else {
          deck.push(card!);
        }
      }

      const defuseIdx = deck.findIndex(c => c === "Defuse");
      if (defuseIdx !== -1) {
        hand.push(deck.splice(defuseIdx, 1)[0]);
      }

      playerCards[uid] = {};
      hand.forEach((card, idx) => {
        playerCards[uid][(idx + 1).toString()] = card;
      });
    }

    const remainingDefuses = deck.filter(c => c === "Defuse").slice(0, 2);
    deck = deck.filter(c => c !== "Defuse");

    const kittens = deck.filter(c => c === "Exploding Kitten").slice(0, playerCount - 1);
    deck = deck.filter(c => c !== "Exploding Kitten");

    const finalDeck = shuffle([...deck, ...remainingDefuses, ...kittens]);

    const turnOrder = shuffle(players);
    const currentPlayer = turnOrder[0];
    const nextPlayer = turnOrder[1] ?? null;

    const gameDocRef = doc(db, gameId, "0");
    await setDoc(gameDocRef, {
      turn: 0,
      currentPlayer,
      nextPlayer,
      turnStart: new Date(),
      turnEnd: null,
      playerCards,
      deck: finalDeck,
      discardPile: [],
      lastPlayedCard: null,
      playedCard: null
    });

    console.log(`초기화 완료: ${gameId}`);
  }

  async function saveNextTurn({
    roomId,
    turn,
    currentPlayer,
    nextPlayer,
    playerCards,
    deck,
    discardPile,
    discard,
    playedCard,
    lastPlayedCard,
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
  }) {
    const gameId = `r.${roomId}`;
    const turnRef = doc(db, gameId, `${turn}`);

    await setDoc(turnRef, {
      turn,
      currentPlayer,
      nextPlayer,
      turnStart: new Date(),
      turnEnd: null,
      playerCards,
      deck,
      discardPile,
      discard,
      playedCard,
      lastPlayedCard,
    });

    console.log(`[턴 ${turn}] 저장 완료`);
  }

  return {
    generateFullDeck,
    shuffle,
    initializeGame,
    saveNextTurn
  };
};

export default ExplodingKittensUtil;
