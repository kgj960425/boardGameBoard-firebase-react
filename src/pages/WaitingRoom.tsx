import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { deleteField, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase.tsx";
import ChattingRoom from "../components/chattingRoom";
import { useActivePing } from "../hooks/useActivePing"; // ✅ 올바른 import

const WaitingRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;

  // ✅ 30초마다 내 lastActive 갱신
  useActivePing(roomId || "", uid || "");

  const leaveRoom = async () => {
    if (!roomId) {
      alert("방 ID가 유효하지 않습니다.");
      return;
    }
    const roomRef = doc(db, "A.rooms", roomId);
    await updateDoc(roomRef, {
      [`player.${uid}`]: deleteField()
    });
    navigate('/RoomList');
  };

  useEffect(() => {
    const fetchRoomInfo = async () => {
      if (!roomId) return;

      try {
        const roomDoc = await getDoc(doc(db, "A.rooms", roomId));
        if (!roomDoc.exists()) {
          alert("해당 방이 존재하지 않습니다.");
          navigate("/RoomList");
          return;
        }

        const roomData = roomDoc.data();
        setRoomInfo(roomData);
      } catch (error) {
        alert("방 정보 불러오기 실패: " + error);
        navigate("/RoomList");
      }
    };

    fetchRoomInfo();
  }, [roomId, navigate]);

  if (!roomInfo || !roomInfo.player) return <div>로딩 중...</div>;

  return (
    <>
      <div style={{ backgroundColor: "#000", color: "#fff", width: "100%", height: "100%", padding: "40px" }}>
        <h1>대기방</h1>
        <p>방 ID: {roomId}</p>
        <p>방 제목: {roomInfo.title}</p>
        <p>게임: {roomInfo.game}</p>
        <p>인원: {Object.keys(roomInfo.player).length} / {roomInfo.maxPlayers}</p>
        <button onClick={() => leaveRoom()}>방 나가기</button>
      </div>
      {roomId && <ChattingRoom roomId={roomId} />}
    </>
  );
};

export default WaitingRoom;
