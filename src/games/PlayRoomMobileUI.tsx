import React, { useState } from "react";
import "./PlayRoomMobileUI.css";
import { auth } from "../firebase/firebase";
import { Resizable } from "react-resizable";
import {
  generateFullDeck,
  shuffle,
  getPlayerByTurn,
  initializeGame,
  saveNextTurn
} from "./ExplodingKittensUtil";


interface GameData {
  currentPlayer: string;
  deck: string[];
  discard: string[];
  playerCards: Record<string, string[]>;
  turnOrder: string[];
}

interface Props {
  gameData: GameData;
}

const PlayRoomMobileUI: React.FC<Props> = ({ gameData }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const myUid = auth.currentUser ? auth.currentUser.uid : null;
  const dummyMessages = [
    "안녕!",
    "디퓨즈 썼어!",
    "이번에 내가 먼저야!",
    "고양이 폭발했다!",
  ];

  const isMyTurn = auth.currentUser ? gameData.currentPlayer === auth.currentUser.uid : false;
  const myCards = myUid ? gameData.playerCards[myUid] || [] : [];

  console.log("Game Data:", gameData);
  console.log("My UID:", isMyTurn);

  return (
    <div className="playroom-mobile-container">
      <div className="player-info-row">
        {gameData.turnOrder.map((uid, i) => (
          <div key={uid} className="player-avatar-block">
            <div className="player-avatar"></div>
            <div className="player-info-text">{i + 1} | {gameData.playerCards[uid]?.length || 0}장</div>
          </div>
        ))}
      </div>

      <div className="top-card-row">
        <div className="used-card-box">
          <span className="card-label">쓴 카드: {gameData.discard.slice(-1)[0] || "없음"}</span>
        </div>
        <div className="deck-box">
          <span className="card-label">Deck: {gameData.deck.length}</span>
        </div>
      </div>

      <div className="my-card-area">
        {myCards.map((card, i) => (
          <div
            key={i}
            className="card-item"
          >
            {card}
          </div>
        ))}
      </div>

      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="chat-toggle-button"
      >
        {chatOpen ? "채팅 닫기" : "이전 채팅 목록 펼치기"}
      </button>

      {chatOpen ? (
        <Resizable
          width={Infinity}
          height={120}
          minConstraints={[100, 60]}
          maxConstraints={[500, 300]}
          resizeHandles={["n"]}
        >
          <div className="playroom-chat-box">
            {dummyMessages.map((msg, idx) => (
              <div key={idx} className="chat-message">
                {msg}
              </div>
            ))}
          </div>
        </Resizable>
      ) : (
        <div className="chat-preview">
          {dummyMessages[dummyMessages.length - 1]}
        </div>
      )}

      <div className="playroom-chat-input-row">
        <input
          type="text"
          className="playroom-chat-input"
          placeholder="메시지 입력"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
        />
        <button className="chat-send-button">
          전달
        </button>
      </div>
    </div>
  );
};

export default PlayRoomMobileUI;