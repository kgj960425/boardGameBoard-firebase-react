import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./ExplodingKittens.css";

interface GameData {
  turn: number;
  currentPlayer: string;
  nextPlayer: string;
  turnStart: any;
  turnEnd: any;
  playerCards: Record<string, Record<string, string>>;
  deck: string[];
  discardPile: string[];
  discard: string[];
  playedCard: string | null;
  lastPlayedCard: string | null;
  turnOrder: string[];
  deadPlayers: string[];
}

const ExplodingKittens = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [myUid, setMyUid] = useState<string | null>(null);
  const [turnId, setTurnId] = useState<string | null>(null);
  const [turnData, setTurnData] = useState<GameData | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedCardKeys, setSelectedCardKeys] = useState<string[]>([]);

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
    const alivePlayers = turnOrder.filter(uid => !deadPlayers.includes(uid));
    const index = turn % alivePlayers.length;
    return alivePlayers[index];
  };

  const initializeGame = async (roomId: string) => {
    const roomRef = doc(db, "A.rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;

    const roomData = roomSnap.data();
    const gameId = `r.${roomId}`;
    const firstTurnRef = doc(db, gameId, "0");
    if ((await getDoc(firstTurnRef)).exists()) return;

    const players = Object.keys(roomData.player);
    const turnOrder = shuffle(players);
    let deck = shuffle(generateFullDeck());

    const playerCards: Record<string, Record<string, string>> = {};
    for (const uid of players) {
      const hand: string[] = [];

      while (hand.length < 7) {
        const card = deck.shift();
        if (card && card !== "Defuse" && card !== "Exploding Kitten") {
          hand.push(card);
        } else {
          deck.push(card!);
        }
      }

      const defuseIdx = deck.findIndex(c => c === "Defuse");
      if (defuseIdx !== -1) hand.push(deck.splice(defuseIdx, 1)[0]);

      playerCards[uid] = {};
      hand.forEach((card, idx) => {
        playerCards[uid][(idx + 1).toString()] = card;
      });
    }

    const remainingDefuses = deck.filter(c => c === "Defuse").slice(0, 2);
    deck = deck.filter(c => c !== "Defuse");

    const kittens = deck.filter(c => c === "Exploding Kitten").slice(0, players.length - 1);
    deck = deck.filter(c => c !== "Exploding Kitten");

    const finalDeck = shuffle([...deck, ...remainingDefuses, ...kittens]);

    await setDoc(firstTurnRef, {
      turn: 0,
      currentPlayer: turnOrder[0],
      nextPlayer: turnOrder[1] ?? null,
      turnStart: new Date(),
      turnEnd: null,
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
    });
  };

  const saveNextTurn = async ({
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
    deadPlayers = [],
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
    const turnRef = doc(db, `r.${roomId}`, `${turn}`);
    await setDoc(turnRef, {
      turn,
      turnStart: new Date(),
      turnEnd: null,
      deadPlayers,
      currentPlayer,
      nextPlayer,
      playerCards,
      deck,
      discardPile,
      discard,
      playedCard,
      lastPlayedCard,
    });
  };

  useEffect(() => {
    const fetchGame = async () => {
      const user = auth.currentUser;
      if (!user || !roomId) return;
      setMyUid(user.uid);

      const firstTurnRef = doc(db, `r.${roomId}`, "0");
      const snap = await getDoc(firstTurnRef);
      if (snap.exists()) {
        setTurnId(snap.id);
        setTurnData(snap.data() as GameData);
      } else {
        await initializeGame(roomId);
        window.location.reload();
      }
    };

    fetchGame();
  }, [roomId]);

  const handleCardClick = (card: string) => {
    if (!myUid || !turnData) return;
    const myCards = turnData.playerCards[myUid];
    const sameCardEntries = Object.entries(myCards).filter(([_, v]) => v === card);

    if (selectedCard === card) {
      setSelectedCard(null);
      setSelectedCardKeys([]);
    } else {
      const keysToSelect = sameCardEntries.slice(0, 3).map(([key]) => key);
      setSelectedCard(card);
      setSelectedCardKeys(keysToSelect);
    }
  };

  const handleDrawCard = async () => {
    if (!roomId || !turnData || !myUid || !turnId) return;
    const nextTurn = parseInt(turnId, 10) + 1;

    const deck = [...turnData.deck];
    const drawnCard = deck.shift();

    const myHand = { ...turnData.playerCards[myUid] };
    const playerCardKeys = Object.keys(myHand);
    const nextCardKey = (Math.max(0, ...playerCardKeys.map(k => parseInt(k))) + 1).toString();

    const updatedDiscard = [...turnData.discard];
    const updatedDeadPlayers = [...turnData.deadPlayers];
    const updatedPlayerCards = { ...turnData.playerCards };
    let playedCard: string | null = null;

    if (drawnCard === "Exploding Kitten") {
      const defuseKey = Object.entries(myHand).find(([, card]) => card === "Defuse")?.[0];
      if (defuseKey) {
        delete myHand[defuseKey];
        deck.splice(Math.floor(Math.random() * (deck.length + 1)), 0, "Exploding Kitten");
        updatedDiscard.push("Defuse");
        playedCard = "Defuse";
      } else {
        updatedDeadPlayers.push(myUid);
        delete updatedPlayerCards[myUid];
        playedCard = "Exploding Kitten";
      }
    } else {
      myHand[nextCardKey] = drawnCard!;
    }

    if (updatedPlayerCards[myUid]) {
      updatedPlayerCards[myUid] = myHand;
    }

    const currentPlayer = getPlayerByTurn(nextTurn, turnData.turnOrder, updatedDeadPlayers);
    const nextPlayer = getPlayerByTurn(nextTurn + 1, turnData.turnOrder, updatedDeadPlayers);

    await saveNextTurn({
      roomId,
      turn: nextTurn,
      currentPlayer,
      nextPlayer,
      playerCards: updatedPlayerCards,
      deck,
      discardPile: turnData.discardPile,
      discard: updatedDiscard,
      playedCard,
      lastPlayedCard: turnData.playedCard,
      deadPlayers: updatedDeadPlayers,
    });

    setTurnId(`${nextTurn}`);
    setTurnData({
      ...turnData,
      turn: nextTurn,
      currentPlayer,
      nextPlayer,
      playerCards: updatedPlayerCards,
      deck,
      discard: updatedDiscard,
      deadPlayers: updatedDeadPlayers,
      playedCard,
      lastPlayedCard: turnData.playedCard,
    });

    setSelectedCard(null);
    setSelectedCardKeys([]);
  };

  const handleNextTurn = async () => {
    if (!roomId || !turnData || !myUid || !turnId || selectedCardKeys.length === 0 || !selectedCard) return;
    const nextTurn = parseInt(turnId, 10) + 1;

    const myHand = { ...turnData.playerCards[myUid] };
    selectedCardKeys.forEach(key => delete myHand[key]);

    const updatedPlayerCards = {
      ...turnData.playerCards,
      [myUid]: myHand,
    };

    const updatedDiscard = [...turnData.discard, ...selectedCardKeys.map(() => selectedCard)];

    const currentPlayer = getPlayerByTurn(nextTurn, turnData.turnOrder, turnData.deadPlayers);
    const nextPlayer = getPlayerByTurn(nextTurn + 1, turnData.turnOrder, turnData.deadPlayers);

    await saveNextTurn({
      roomId,
      turn: nextTurn,
      currentPlayer,
      nextPlayer,
      playerCards: updatedPlayerCards,
      deck: turnData.deck,
      discardPile: turnData.discardPile,
      discard: updatedDiscard,
      playedCard: selectedCard,
      lastPlayedCard: turnData.playedCard,
      deadPlayers: turnData.deadPlayers,
    });

    setTurnId(`${nextTurn}`);
    setTurnData({
      ...turnData,
      turn: nextTurn,
      currentPlayer,
      nextPlayer,
      playerCards: updatedPlayerCards,
      discard: updatedDiscard,
      playedCard: selectedCard,
      lastPlayedCard: turnData.playedCard,
    });

    setSelectedCard(null);
    setSelectedCardKeys([]);
  };

  const players = Object.keys(turnData?.playerCards ?? {});
  const myCards = Object.entries(turnData?.playerCards?.[myUid ?? ""] ?? {});

  const renderPlayerInfo = (uid: string, index: number) => {
    const cardCount = Object.keys(turnData?.playerCards?.[uid] ?? {}).length;
    const isCurrent = turnData?.currentPlayer === uid;

    return (
      <div className="player-info" key={uid} style={{ gridArea: `p${index + 1}` }}>
        <div className="player-circle">displayName<br />{uid}</div>
        <div className="player-status">
          <div className="turn-order">{index + 1}</div>
          <div>🃏 {cardCount}</div>
        </div>
        {isCurrent && <div className="current-player-mark">⭐</div>}
      </div>
    );
  };

  return (
    <div className="ek-board">
      <div>
        <h2>현재 턴: {turnId ? parseInt(turnId, 10) + 1 : "..."}</h2>
        <h3>플레이어: {turnData?.currentPlayer ?? "..."}</h3>
      </div>

      <div className="players-grid">
        {players.map((uid, idx) => uid !== myUid && renderPlayerInfo(uid, idx))}
      </div>

      <div className="game-center">
        <div className="danger-bar">위협도 : 8%</div>
        <div className="deck-buttons">
          <button className="deck-btn" onClick={handleDrawCard}>카드 덱</button>
          <button className="deck-btn" onClick={handleNextTurn} disabled={selectedCardKeys.length === 0}>
            카드 제출
          </button>
        </div>
      </div>

      <div className="my-hand">
        <div className="my-cards">
          {myCards.map(([key, card]) => (
            <div
              key={key}
              className={`card ${selectedCardKeys.includes(key) ? "selected" : ""}`}
              onClick={() => handleCardClick(card)}
            >
              {card}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExplodingKittens;
