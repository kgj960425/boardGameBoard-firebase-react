import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { initializeGame } from "./ExplodingKittensUtil";
import { ChatMessage } from "../hooks/useRoomMessages";
import useRoomMessages from "../hooks/useRoomMessages";
import useSendMessage from "../hooks/useSendMessage";
import { usePlayerInfo } from "../hooks/usePlayerInfo";
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
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [input, setInput] = useState("");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { roomId } = useParams<{ roomId: string }>();
  const myUid = auth.currentUser?.uid;
  const playerInfo = usePlayerInfo(roomId);
  const sendMessage = useSendMessage(`m.${roomId}`);
  const messages: ChatMessage[] = useRoomMessages(`m.${roomId}`);

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

  if (!gameData || !roomId) return null;

  const myCards = myUid ? Object.values(gameData.playerCards[myUid] || {}) : [];

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="playroom-container">
      {/* 상단 플레이어들 */}
      <div className="playroom-player-bar">
        {gameData.turnOrder.map((uid, idx) => {
          const cardCount = Object.keys(gameData.playerCards?.[uid] ?? {}).length;
          return (
            <div key={uid} className="playroom-player-profile">
              <img
                src={playerInfo[uid]?.photoURL ?? '/default-profile.png'}
                className="playroom-player-photo"
                alt="profile"
              />
              <div className="playroom-player-info">{playerInfo[uid]?.nickname}</div>
              <div className="playroom-player-info">{cardCount}장</div>
            </div>
          );
        })}
      </div>

      {/* 중앙 카드 정보 */}
      <div className="playroom-center-zone">
        <div className="playroom-card playroom-used-card">
          {gameData.playedCard || "쓴카드 없음"}
        </div>
        <div className="playroom-card playroom-deck-card">
          Deck: {gameData.deck.length}
        </div>
      </div>

      {/* 내 카드 패 */}
      <div className="playroom-my-cards">
        {myCards.map((card, idx) => (
          <div
            key={idx}
            className={`playroom-card ${selectedCard === card ? "selected" : ""}`}
            onClick={() => setSelectedCard(prev => (prev === card ? null : card))}
          >
            {card}
          </div>
        ))}
      </div>

      {/* 채팅 영역 */}
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
  );
};

export default ExplodingKittens;
