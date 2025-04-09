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
    const gameId: string = `r.${roomId}`;

    const alreadyInitializedRef = doc(db, gameId, "0");
    const alreadyInitializedSnap = await getDoc(alreadyInitializedRef);
    if (alreadyInitializedSnap.exists()) {
      console.log("이미 게임이 초기화되어 있음");
      return;
    }

    const players: string[] = Object.keys(roomData.player);
    const playerCount = players.length;

    // 전체 카드 생성 및 셔플
    let deck = shuffle(generateFullDeck());

    // 플레이어별 핸드 생성
    const playerCards: Record<string, Record<string, string>> = {};
    for (const uid of players) {
      const hand: string[] = [];

      // 디퓨즈, 폭탄 제외하고 7장 뽑기
      while (hand.length < 7) {
        const card = deck.shift();
        if (card && card !== "Defuse" && card !== "Exploding Kitten") {
          hand.push(card);
        } else {
          deck.push(card!); // 다시 넣기
        }
      }

      // 디퓨즈 1장 강제로 넣기
      const defuseIdx = deck.findIndex(c => c === "Defuse");
      if (defuseIdx !== -1) {
        hand.push(deck.splice(defuseIdx, 1)[0]);
      }

      // 핸드 저장
      playerCards[uid] = {};
      hand.forEach((card, idx) => {
        playerCards[uid][(idx + 1).toString()] = card;
      });
    }

    // 남은 디퓨즈 2장만 살림
    const remainingDefuses = deck.filter(c => c === "Defuse").slice(0, 2);
    deck = deck.filter(c => c !== "Defuse");

    // 폭탄 카드는 (플레이어 수 - 1)개만 사용
    const kittens = deck.filter(c => c === "Exploding Kitten").slice(0, playerCount - 1);
    deck = deck.filter(c => c !== "Exploding Kitten");

    // 최종 덱: 디퓨즈 + 폭탄 + 나머지
    const finalDeck = shuffle([...deck, ...remainingDefuses, ...kittens]);

    // 턴 순서 랜덤 결정
    const turnOrder = shuffle(players);
    const currentPlayer = turnOrder[0];
    const nextPlayer = turnOrder[1] ?? null;

    // 초기 게임 상태 저장
    const firstTurnRef = doc(db, gameId, "0");
    await setDoc(firstTurnRef, {
      turn: 0,
      currentPlayer,
      nextPlayer,
      turnStart: new Date(),
      turnEnd: null,
      playerCards,
      deck: finalDeck,
      discardPile: [],
      discard: [],
      playedCard: null,
      lastPlayedCard: null,
      turnStack: 0,
      remainingActions: 1, // 기본 액션 1회, 이후 공격 카드 사용 등으로 증가 가능
      deadPlayers: [],
    });

    console.log(`[${roomId}] 게임 초기화 완료`);
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
    saveNextTurn,
  };
};

export default ExplodingKittensUtil;
