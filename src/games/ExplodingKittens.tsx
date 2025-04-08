import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import "./ExplodingKittens.css";
import ExplodingKittensUtil from "./ExplodingKittensUtil";

interface GameData {
  turn: number;
  currentPlayer: string;
  nextPlayer: string;
  turnStart: Timestamp;
  turnEnd: Timestamp | null;
  playerCards: Record<string, Record<string, string>>;
  deck: string[];
  discardPile: string[];
  discard: string[];
  playedCard: string | null;
  lastPlayedCard: string | null;
}

const ExplodingKittens = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [myUid, setMyUid] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const { initializeGame } = ExplodingKittensUtil();

  useEffect(() => {
    const fetchGame = async () => {
      const user = auth.currentUser;
      if (!user || !roomId) return;

      setMyUid(user.uid);

      const gameRef = doc(db, `r.${roomId}`, "0");
      const gameSnap = await getDoc(gameRef);
      if (gameSnap.exists()) {
        const data = gameSnap.data() as GameData;

        if (!data.playerCards) {
          console.error("playerCards가 없습니다.");
          return;
        }

        setGameData(data);
        setPlayers(Object.keys(data.playerCards));
      } else {
        console.warn("게임 데이터가 존재하지 않습니다. 초기화를 먼저 실행해야 합니다.");
      }
    };

    fetchGame();
  }, [roomId]);

  const handleStartGame = async () => {
    if (!roomId) return;
    await initializeGame(roomId);
    window.location.reload(); // 새로고침하여 r.{roomId}/0 로드 유도
  };

  if (!gameData || !myUid)
    return (
      <div className="ek-board">
        <div>게임 데이터가 없습니다.</div>
        <button onClick={handleStartGame}>게임 시작</button>
      </div>
    );

  const myCards = Object.values(gameData.playerCards?.[myUid] || {});
  const renderPlayerInfo = (uid: string, index: number) => {
    const cardCount = Object.keys(gameData.playerCards?.[uid] || {}).length;
    const isCurrent = gameData.currentPlayer === uid;

    return (
      <div className="player-info" key={uid} style={{ gridArea: `p${index + 1}` }}>
        <div className="player-circle">displayName<br />{uid}</div>
        <div className="player-status">
          <div className="turn-order">{(index + 1).toString()}</div>
          <div>🃏 {cardCount}</div>
        </div>
        {isCurrent && <div className="current-player-mark">⭐</div>}
      </div>
    );
  };

  return (
    <div className="ek-board">
      <div className="players-grid">
        {players.map((uid, idx) => uid !== myUid && renderPlayerInfo(uid, idx))}
      </div>

      <div className="game-center">
        <div className="danger-bar">위협도 : 8%</div>
        <div className="deck-buttons">
          <button className="deck-btn">카드 덱</button>
          <button className="deck-btn">카드 제출</button>
        </div>
      </div>

      <div className="my-hand">
        <button className="submit-btn">전달</button>
        <div className="my-cards">
          {myCards.map((card, idx) => (
            <div key={idx} className="card">{card}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExplodingKittens;
