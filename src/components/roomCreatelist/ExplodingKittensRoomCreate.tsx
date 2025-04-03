import React, { useState } from "react";
import "./ExplodingKittensRoomCreate.css";
import { collection, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

const ExplodingKittensRoomCreate: React.FC = () => {
  const [settings, setSettings] = useState({
    title: "",
    maxPlayers: 5,
    turnTimeLimit: 0,
  });

  const navigate = useNavigate();

  const update = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateRoom = async () => {
    const { title, maxPlayers, turnTimeLimit } = settings;

    if (!title) {
      alert("방 제목을 입력해주세요.");
      return;
    }

    const user = auth.currentUser?.uid;
    const nick = auth.currentUser?.displayName;
    if (!user || !nick) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    try {
      const snapshot = await getDocs(collection(db, "A.rooms"));
      const ids = snapshot.docs
        .map((doc) => parseInt(doc.id))
        .filter((id) => !isNaN(id));

      const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
      const roomId = newId.toString();

      const roomData = {
        title,
        game: "Exploding Kittens",
        maxPlayers,
        turnTimeLimit,
        state: "waiting",
        createdAt: serverTimestamp(),
        player: {
            [user]: { nickname: nick }
        },
        messages: `m.${roomId}`,
        games: `r.${roomId}`,
        passwordYn: false,
        password: "",
      };

      await setDoc(doc(db, "A.rooms", roomId), roomData);
      navigate(`/room/${roomId}/wait`);
    } catch (error) {
      console.error("방 생성 실패:", error);
      alert("방 생성 중 오류가 발생했습니다.");
    }
  };

  const options = {
    time: [0, 15, 30, 60, 120],
    players: [2, 3, 4, 5],
  };

  return (
    <div className="casino-wrapper">
      <div className="casino-option-group">
        <input
          type="text"
          value={settings.title}
          onChange={(e) => update("title", e.target.value)}
          className="casino-input"
          placeholder="방 제목 입력"
        />
      </div>

      <div className="casino-option-group">
        <label>최대 인원 수:</label>
        <div className="casino-button-group">
          {options.players.map((num) => (
            <button
              key={num}
              type="button"
              className={`casino-button ${settings.maxPlayers === num ? "active" : ""}`}
              onClick={() => update("maxPlayers", num)}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="casino-option-group">
        <label>턴당 시간 제한 (초):</label>
        <div className="casino-button-group">
          {options.time.map((sec) => (
            <button
              key={sec}
              type="button"
              className={`casino-button ${settings.turnTimeLimit === sec ? "active" : ""}`}
              onClick={() => update("turnTimeLimit", sec)}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      <button className="casino-create-button" onClick={handleCreateRoom}>
        방 만들기
      </button>
    </div>
  );
};

export default ExplodingKittensRoomCreate;
