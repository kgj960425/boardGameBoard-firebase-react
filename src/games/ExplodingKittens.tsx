import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";

import { db, auth } from "../firebase/firebase";
import { collection, limit, onSnapshot, orderBy, query, Timestamp, where } from "firebase/firestore";
import {
  submitCard,
  insertBombAt,
  handleFavorSelectedCard,
  handleRecoverCard,
} from "./ExplodingKittensUtil";
import "./ExplodingKittens.css";

import useRoomMessages, { ChatMessage } from "../hooks/useRoomMessages";
import useSendMessage from "../hooks/useSendMessage";
import { usePlayerInfo } from "../hooks/usePlayerInfo";
import FavorModal from "../components/FavorModal"; // Update this path if the file is located elsewhere
import InsertBombModal from "../components/InsertBombModal";
import RecoverFromDiscardModal from "../components/RecoverFromDiscardModal"; // Update this path if the file is located elsewhere


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
  turnStack: number;
  remainingActions: number;
  modalRequest: {
    type: string,
    targets: string[],
    from: string,
    payload: {},
    createdAt: Timestamp
  };
  explosionEvent: {
    player: string,
    hasDefuse: false,
  };
}

const ExplodingKittens = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [input, setInput] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedCardKeys, setSelectedCardKeys] = useState<string[]>([]);
  const [favorModalOpen, setFavorModalOpen] = useState(false);
  const [RecoverFromDiscardModalOpen, setRecoverFromDiscardModalOpen] = useState(false);
  const [favorTarget] = useState<string | null>(null);
  const [insertBombModalOpen, setInsertBombModalOpen] = useState(false);
  const [bombDeck, setBombDeck] = useState<string[]>([]);
  const [bombHand, setBombHand] = useState<Record<string, string>>({});

  const resizingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const myUid = auth.currentUser?.uid;
  // const isMyTurn = myUid === gameData?.currentPlayer;
  const playerInfo = usePlayerInfo(roomId);

  if(!roomId) return null;
  const sendMessage = useSendMessage(roomId);
  const messages: ChatMessage[] = useRoomMessages(roomId);

  //game data onSnapshot
  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(db, "Rooms", roomId, "history"),
      where("turnEnd", "!=", null),
      orderBy("turnEnd", "desc"),
      limit(1)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const docSnap = snapshot.docs[0];
      if (docSnap?.exists()) {
        setGameData(docSnap.data() as GameData);
      }
    });
    return () => unsub();
  }, [roomId]);

  //chatting scroll fresh update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function setSeeFutureModalOpen(_arg0: boolean) {
    throw new Error("Function not implemented.");
  }
  function setChooseCardModalOpen(_arg0: boolean) {
    throw new Error("Function not implemented.");
  }
  
  //modal open 이벤트
  useEffect(() => {
    if (!gameData || !myUid) return;

    const { modalRequest, explosionEvent } = gameData;
    
    if(gameData?.modalRequest.targets?.includes(myUid)) {
      switch (modalRequest.type) {
        case "favor":
          setFavorModalOpen(true);
          break;
        case "seeFuture":
          setSeeFutureModalOpen(true);
          break;
        case "chooseCard":
          setChooseCardModalOpen(true);
          break;
        case "recover-from-discard":
          setRecoverFromDiscardModalOpen(true);
          break;
        default:
          break;
      }
    }

    if (explosionEvent?.player === myUid) {
      if (explosionEvent.hasDefuse) {
        // Defuse 카드 사용 로직
      } else {
        // 게임 탈락 처리 로직
      }
    }
  }, [gameData?.modalRequest.targets?.includes(myUid ?? "")]);

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
    await submitCard(
      roomId,
      selectedCardKeys.map(k => gameData.playerCards[myUid!][k]),
      gameData,
    );
    setSelectedCard(null);
    setSelectedCardKeys([]);
  };

  const handleInsertBomb = async (index: number) => {
    if(!roomId || !gameData) return;
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

  const myCards = myUid ? Object.entries(gameData?.playerCards[myUid] || {}) : [];

  if (!gameData || !roomId || !myUid) return;

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
        <div className="playroom-card playroom-deck-card">
          <div className="playroom-deck-count">{gameData.deck.length}</div>
        </div>
        {myUid === gameData.currentPlayer && (
          <button onClick={handleCardSubmit}>
            {selectedCardKeys.length === 0 ? "패스" : "카드 제출"}
          </button>
        )}
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
            await handleFavorSelectedCard(roomId, myUid, favorTarget, key, gameData.turn ); ;
            setFavorModalOpen(false);
          }
        }}
      />

      <InsertBombModal
        isOpen={insertBombModalOpen}
        deck={bombDeck}
        onSelect={handleInsertBomb}
      />

      <RecoverFromDiscardModal
        isOpen={RecoverFromDiscardModalOpen}
        discardPile={gameData.discardPile}
        onSelect={async (card) => {
          if (!roomId || !myUid || !gameData) return;
          await handleRecoverCard(roomId, myUid, card, gameData);
          setRecoverFromDiscardModalOpen(false);
        }}
        onClose={() => setRecoverFromDiscardModalOpen(false)}
      />

    </div>
  );
};

export default ExplodingKittens;