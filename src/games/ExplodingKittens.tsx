import { useEffect, useState, useRef, useCallback, SetStateAction } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  initializeGame,
  submitCard,
  drawCard,
  insertBombAt,
  handleFavorSelectedCard,
} from "./ExplodingKittensUtil";
import useRoomMessages, { ChatMessage } from "../hooks/useRoomMessages";
import useSendMessage from "../hooks/useSendMessage";
import { usePlayerInfo } from "../hooks/usePlayerInfo";
// Ensure the correct path to FavorModal is used
import FavorModal from "../components/FavorModal"; // Update this path if the file is located elsewhere
import InsertBombModal from "../components/InsertBombModal";
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
  turnStack: number; // Added property
  remainingActions: number; // Added property
}

const ExplodingKittens = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [input, setInput] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedCardKeys, setSelectedCardKeys] = useState<string[]>([]);
  const [favorModalOpen, setFavorModalOpen] = useState(false);
  const [favorTarget, setFavorTarget] = useState<string | null>(null);
  const [insertBombModalOpen, setInsertBombModalOpen] = useState(false);
  const [bombDeck, setBombDeck] = useState<string[]>([]);
  const [bombHand, setBombHand] = useState<Record<string, string>>({});

  const resizingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const myUid = auth.currentUser?.uid;
  const playerInfo = usePlayerInfo(roomId);
  const sendMessage = useSendMessage(`m.${roomId}`);
  const messages: ChatMessage[] = useRoomMessages(`m.${roomId}`);

  const resizeChat = useCallback((e: MouseEvent) => {
    if (!resizingRef.current) return;
    const containerHeight = window.innerHeight;
    const newHeightPx = containerHeight - e.clientY;
    const newHeightPercent = (newHeightPx / containerHeight) * 100;
    const clamped = Math.max(10, Math.min(newHeightPercent, 60));
    const chat = document.querySelector('.playroom-chat-container') as HTMLElement;
    if (chat) chat.style.height = `${clamped}%`;
  }, []);

  useEffect(() => {
    if (roomId) initializeGame(roomId);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, `r.${roomId}`, "now"), (docSnap) => {
      if (docSnap.exists()) {
        setGameData(docSnap.data() as GameData);
      }
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    window.addEventListener("mousemove", resizeChat);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resizeChat);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resizeChat]);

  const handleCardClick = (card: string, cardKey: string) => {
    if (!myUid || !gameData) return;
    const powerlessCards = [
      "Taco Cat",
      "Hairy Potato Cat",
      "Cattermelon",
      "Beard Cat",
      "Rainbow Ralphing Cat",
    ];
    const myHand = gameData.playerCards[myUid];
    const sameCardEntries = Object.entries(myHand).filter(([_, v]) => v === card);
    if (selectedCardKeys.includes(cardKey)) {
      setSelectedCard(null);
      setSelectedCardKeys([]);
      return;
    }
    if (powerlessCards.includes(card)) {
      const keysToSelect = sameCardEntries.slice(0, 3).map(([key]) => key);
      setSelectedCard(card);
      setSelectedCardKeys(keysToSelect);
    } else {
      setSelectedCard(card);
      setSelectedCardKeys([cardKey]);
    }
  };

  const handleCardSubmit = async () => {
    if (!roomId || !gameData || selectedCardKeys.length === 0 || !selectedCard) return;
    await submitCard(roomId, selectedCardKeys.map(k => gameData.playerCards[myUid!][k]), gameData);
    setSelectedCard(null);
    setSelectedCardKeys([]);
  };

  const handleDraw = async () => {
    if (!roomId || !gameData) return;
    await drawCard(roomId, gameData, (deck: SetStateAction<string[]>, updatedHand: SetStateAction<Record<string, string>>) => {
      setBombDeck(deck);
      setBombHand(updatedHand);
      setInsertBombModalOpen(true);
    });
  };

  const handleInsertBomb = async (index: number) => {
    if (!roomId || !gameData) return;
    await insertBombAt(roomId, gameData, bombDeck, bombHand, index);
    setInsertBombModalOpen(false);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const startResizing = () => {
    resizingRef.current = true;
  };

  const stopResizing = () => {
    resizingRef.current = false;
  };

  if (!gameData || !roomId) return null;

  const myCards = myUid ? Object.entries(gameData.playerCards[myUid] || {}) : [];

  return (
    <div className="playroom-container">
      <div className="playroom-player-bar" style={{ height: "15%" }}>
        {gameData.turnOrder.map((uid) => {
          const cardCount = Object.keys(gameData.playerCards?.[uid] ?? {}).length;
          return (
            <div key={uid} className="playroom-player-profile">
              <img
                src={playerInfo[uid]?.photoURL ?? "/default-profile.png"}
                className="playroom-player-photo"
                alt="profile"
              />
              <div className="playroom-player-info">{playerInfo[uid]?.nickname}</div>
              <div className="playroom-player-info">{cardCount}장</div>
            </div>
          );
        })}
      </div>

      <div className="playroom-center-zone" style={{ height: "30%", display: "flex", gap: "2rem", justifyContent: "center", alignItems: "center" }}>
        <div className="playroom-card playroom-used-card">
          {gameData.playedCard || ""}
        </div>
        <div className="playroom-card playroom-deck-card" onClick={handleDraw}>
          <div className="playroom-deck-count">{gameData.deck.length}</div>
        </div>
        <button onClick={handleCardSubmit} disabled={selectedCardKeys.length === 0}>
          카드 제출
        </button>
      </div>

      <div className="playroom-my-cards" style={{ height: "35%" }}>
        {myUid && myCards.map(([key, card]) => (
          <div
            key={key}
            className={`playroom-card ${selectedCardKeys.includes(key) ? "selected" : ""}`}
            onClick={() => handleCardClick(card, key)}
          >
            {card}
          </div>
        ))}
      </div>

      <div className="playroom-chat-container" style={{ height: "20%" }}>
        <div className="playroom-chat-resizer" onMouseDown={startResizing}></div>
        <div className="playroom-chat-box">
          <div className="playroom-chat-messages">
            {messages.map((msg, i) => {
              const isMine = msg.uid === myUid;
              return (
                <div key={i} className={`chat-message ${isMine ? "mine" : "other"}`}>
                  {!isMine && <div className="chat-nickname">{msg.nickname}</div>}
                  <div className={`chat-bubble ${isMine ? "mine" : "other"}`}>{msg.content}</div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
          <div className="playroom-chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="메시지를 입력하세요"
            />
            <button onClick={handleSend}>전송</button>
          </div>
        </div>
      </div>

      <FavorModal
        isOpen={favorModalOpen}
        hand={gameData?.playerCards[myUid!] || {}}
        onCardSelect={async (key: any) => {
          if (favorTarget && roomId && myUid) {
            await handleFavorSelectedCard(roomId, myUid, favorTarget, key);
            setFavorModalOpen(false);
          }
        }}
      />

      <InsertBombModal
        isOpen={insertBombModalOpen}
        deck={bombDeck}
        onSelect={handleInsertBomb}
      />
    </div>
  );
};

export default ExplodingKittens;