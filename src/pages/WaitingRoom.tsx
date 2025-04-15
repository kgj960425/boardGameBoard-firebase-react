import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { ChatMessage } from "../hooks/useRoomMessages";
import useRoomMessages from "../hooks/useRoomMessages";
import useSendMessage from "../hooks/useSendMessage";
import useAddBot from "../hooks/useAddBot";
import GameSettingPanel from "./gameSettingPanel/GameSettingPanels";
import "./WaitingRoom.css";
import {initializeGame} from "../games/ExplodingKittensUtil.tsx";

export default function WaitingRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const sendMessage = useSendMessage(roomId ?? null);
  const messages: ChatMessage[] = useRoomMessages(roomId ?? null);

  const currentUserUid = auth.currentUser?.uid;
  const { addBot } = useAddBot(roomId, players.length);

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    const ref = doc(db, "Rooms", roomId);
    const unsubscribe = onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) setRoomInfo(docSnap.data());
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = onSnapshot(collection(db, "Rooms", roomId, "player"), (snap) => {
      const playerList = snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
      setPlayers(playerList);
    });
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (roomInfo?.status === "playing") {
      if (!currentUserUid) return;
      const isInRoom = players.some((p) => p.uid === currentUserUid);
      if (isInRoom) {
        navigate(`/room/${roomId}/play`);
      } else {
        navigate("/");
      }
    }
  }, [roomInfo?.status, players, currentUserUid, roomId, navigate]);

  useEffect(() => {
    if (!currentUserUid) return;
    const isInRoom = players.some((p) => p.uid === currentUserUid);
    if (isInRoom && !hasJoined) setHasJoined(true);
    if (!isInRoom && hasJoined && !leaving) {
      alert("강퇴되었습니다.");
      navigate("/");
    }
  }, [players, currentUserUid, hasJoined, leaving, navigate]);

  if (!roomInfo) return <div>로딩 중...</div>;

  const hostUid = roomInfo.host;
  const isHost = currentUserUid === hostUid;
  const readyPlayers = players.filter((p) => p.state === "ready");
  const currentUser = players.find((p) => p.uid === currentUserUid);
  const minPlayers = parseInt(roomInfo?.gameSetting?.min ?? "2");
  const canStartGame = isHost && players.length >= minPlayers && readyPlayers.length === players.length;

  const toggleReady = async () => {
    if (!roomId || !currentUserUid || !currentUser) return;
    const playerRef = doc(db, "Rooms", roomId, "player", currentUserUid);
    const newState = currentUser.state === "ready" ? "not ready" : "ready";
    try {
      await updateDoc(playerRef, { state: newState });
    } catch (e) {
      console.error("준비 상태 변경 실패:", e);
    }
  };

  const handleStartGame = async () => {
    if (!roomId) return;

    try {
      const roomRef = doc(db, "Rooms", roomId);
      await updateDoc(roomRef, { status: "playing" });
      initializeGame(roomId);
      navigate(`/room/${roomId}/play`);
    } catch (error) {
      console.error("게임 시작 실패:", error);
    }
  };

  const handleKick = async (uid: string) => {
    if (!roomId) return;
    try {
      await deleteDoc(doc(db, "Rooms", roomId, "player", uid));
    } catch (error) {
      console.error("강퇴 실패:", error);
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomId || !currentUserUid) return;
    try {
      setLeaving(true);
      await deleteDoc(doc(db, "Rooms", roomId, "player", currentUserUid));

      if (isHost) {
        const remaining = players.filter(p => p.uid !== currentUserUid && !p.nickname?.startsWith("봇"));
        if (remaining.length === 0) {
          await updateDoc(doc(db, "Rooms", roomId), { state: "finished" });
        } else {
          const sorted = remaining.sort((a, b) => (a.joinedAt?.seconds ?? 0) - (b.joinedAt?.seconds ?? 0));
          await updateDoc(doc(db, "Rooms", roomId), { host: sorted[0].uid });
        }
      }

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
        <div className="player-list" style={{ display: 'flex', flexDirection: 'column', gap: '1em', padding: '1em' }}>
          {players.map((p) => (
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
                onClick={handleStartGame}
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