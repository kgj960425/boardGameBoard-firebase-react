import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deleteField, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { ChatMessage } from "../hooks/useRoomMessages";
import useRoomMessages from "../hooks/useRoomMessages";
import useSendMessage from "../hooks/useSendMessage";
import useAddBot from "../hooks/useAddBot";
import GameSettingPanel from "./gameSettingPanel/GameSettingPanels";
import "./WaitingRoom.css";

export default function WaitingRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const sendMessage = useSendMessage(roomInfo?.messages ?? null);
  const messages: ChatMessage[] = useRoomMessages(roomInfo?.messages ?? null);

  const currentUserUid = auth.currentUser?.uid;

  const players = Object.entries(roomInfo?.player || {}).map(([uid, data]: any) => ({ uid, ...data }));
  const { addBot, nextBotNumber } = useAddBot(roomId, players.length);

  useEffect(() => {
      if (!roomId) {
        navigate("/");
        return;
      }
  
      const ref = doc(db, "A.rooms", roomId);
      const unsubscribe = onSnapshot(ref, (docSnap) => {
        if (docSnap.exists()) setRoomInfo(docSnap.data());
      });
  
      return () => unsubscribe();
    }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!roomInfo || !currentUserUid) return;

    const isInRoom = !!roomInfo.player?.[currentUserUid];

    if (isInRoom && !hasJoined) {
      setHasJoined(true);
    }

    if (!isInRoom && hasJoined && !leaving) {
      alert("강퇴되었습니다.");
      navigate("/");
    }
  }, [roomInfo, currentUserUid, hasJoined, leaving]);

  if (!roomInfo) return <div>로딩 중...</div>;

  const hostUid = roomInfo.host;
  const isHost = currentUserUid === hostUid;
  const readyPlayers = players.filter((p) => p.state === "ready");
  const currentUser = players.find((p) => p.uid === currentUserUid);
  const canStartGame = isHost && players.length >= parseInt(roomInfo?.gameSetting?.min ?? "2") && readyPlayers.length === players.length - 1;

  const toggleReady = async () => {
    if (!roomId || !currentUserUid) return;
    const ref = doc(db, "A.rooms", roomId);
    const newState = currentUser?.state === "ready" ? "not ready" : "ready";
    try {
      await updateDoc(ref, {
        [`player.${currentUserUid}.state`]: newState,
      });
    } catch (e) {
      console.error("준비 상태 변경 실패:", e);
    }
  };

  const handleKick = async (uid: string) => {
    if (!roomId) return;
    try {
      await updateDoc(doc(db, "A.rooms", roomId), {
        [`player.${uid}`]: deleteField(),
      });
    } catch (error) {
      console.error("강퇴 실패:", error);
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomId || !currentUserUid) return;
    try {
      setLeaving(true);
      await updateDoc(doc(db, "A.rooms", roomId), {
        [`player.${currentUserUid}`]: deleteField(),
      });
      navigate("/");
    } catch (error) {
      console.error("방 나가기 실패:", error);
    }
  };

  const handleSend = () => {
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="waiting-room">
      <div className="left-panel">
        <div className="player-list">
          {players.filter((p) => p.uid !== currentUserUid).slice(0, 4).map((p) => (
            <div key={p.uid} className="player-box">
              <img src={p.photoURL || "/default-profile.png"} alt={`${p.nickname} 프로필`} className="player-photo" />
              <div className="player-info">
                <div className="player-name">{p.nickname}</div>
                <div className={`player-status ${p.uid === hostUid ? "host" : p.state === "ready" ? "ready" : "not-ready"}`}>
                  {p.uid === hostUid ? "HOST" : p.state === "ready" ? "Ready" : "Not Ready"}
                </div>
                {isHost && (
                  <button className="kick-button" onClick={() => handleKick(p.uid)}>
                    강퇴
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="chat-box">
          <div className="chat-messages">
            {messages.map((msg, i) => {
              const isMine = msg.uid === currentUserUid;
              return (
                <div key={i} className={`chat-message ${isMine ? "mine" : "other"}`}>
                  {!isMine && <div className="chat-nickname">{msg.nickname}</div>}
                  <div className={`chat-bubble ${isMine ? "mine" : "other"}`}>{msg.content}</div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>

          <div className="chat-input">
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

      <div className="right-panel">
        <GameSettingPanel />

        <div className="button-group">
          {isHost ? (
            <>
              <button className="leave-button" onClick={addBot}>
                봇 추가
              </button>
              <button
                className={`start-button ${canStartGame ? "active" : "disabled"}`}
                disabled={!canStartGame}
              >
                {canStartGame ? "게임 시작" : "준비중..."}
              </button>
            </>
          ) : (
            <button
              className={`ready-button ${currentUser?.state === "ready" ? "cancel" : "active"}`}
              onClick={toggleReady}
            >
              {currentUser?.state === "ready" ? "준비 취소" : "준비하기"}
            </button>
          )}

          <button className="leave-button" onClick={handleLeaveRoom}>
            방 나가기
          </button>
        </div>
      </div>
    </div>
  );
}