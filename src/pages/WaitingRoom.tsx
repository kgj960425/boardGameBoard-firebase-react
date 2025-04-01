import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import ChattingRoom from "../components/chattingRoom";

const WaitingRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const navigate = useNavigate();
  const currentUser = {
        uid: "uid1",
        nickname: "철수"
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

        // 상태가 end 또는 play일 경우 입장 불가
        if (roomData.state !== "ready") {
          alert("게임이 이미 시작되었거나 종료된 방입니다.");
          navigate("/RoomList");
          return;
        }

        // 인원이 꽉 찼을 경우 입장 불가
        if (roomData.players.length >= roomData.maxPlayers) {
          alert("방 인원이 가득 찼습니다.");
          navigate("/RoomList");
          return;
        }

        // 모든 조건을 통과한 경우 방 정보 저장
        setRoomInfo(roomData);
      } catch (error) {
        alert("방 정보 불러오기 실패: " + error);
        navigate("/RoomList");
      }
    };

    fetchRoomInfo();
  }, [roomId, navigate]);

  if (!roomInfo) return <div>로딩 중...</div>;

  return (
    <>
    <div style={{ backgroundColor: "#000", color: "#fff", width: "100%", height: "100vh", padding: "40px" }}>
      <h1>대기방</h1>
      <p>방 ID: {roomId}</p>
      <p>방 제목: {roomInfo.title}</p>
      <p>게임: {roomInfo.game}</p>
      <p>인원: {roomInfo.players.length} / {roomInfo.maxPlayers}</p>
    </div>
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
        {roomId && <ChattingRoom roomId={roomId} currentUser={currentUser} />}
    </div>
    </>
  );
};

export default WaitingRoom;
