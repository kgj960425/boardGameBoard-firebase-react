import React from "react";
import "./PlayRoomDesktopUI.css";

interface Props {
  gameData: any;
}

const PlayRoomDesktopUI = ({ gameData }: Props) => {
  const [input, setInput] = React.useState("");
  const myCards: string[] = Object.values(gameData.playerCards[myUid] || {}) as string[];
  const otherPlayers = gameData.turnOrder.filter((uid: string) => uid !== myUid);

  return (
    <div className="desktop-container">
      {/* 상단 - 플레이어 프로필 */}
      <div className="desktop-top">
        <div className="player-profiles">
          {gameData.turnOrder.map((uid: string, idx: number) => (
            <div key={uid} className="profile-item">
              <div className="profile-circle"></div>
              <div className="profile-info">
                {idx + 1}/{Object.keys(gameData.playerCards[uid] || {}).length}장
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 중앙 - 덱 정보 */}
      <div className="deck-area">
        <div className="card used-card">쓴카드: {gameData.playedCard || "없음"}</div>
        <div className="card deck-card">Deck: {gameData.deck.length}</div>
      </div>

      {/* 하단 - 채팅 + 카드 */}
      <div className="desktop-bottom">
        <div className="chat-section">
          <div className="chat-log">
          </div>
          <div className="chat-input-area">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지 입력"
            />
            <button onClick={() => { onSendMessage(input); setInput(""); }}>전달</button>
          </div>
        </div>

        <div className="my-cards">
          {myCards.map((card: string, idx: number) => (
            <div key={idx} className="card">{card}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayRoomDesktopUI;
