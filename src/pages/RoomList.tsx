import { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./RoomList.css";
import Modal from "../components/Modal";
import RoomCreateForm from "../components/RoomCreateForm";
import { cleanupGhostRooms } from "../hooks/cleanUpGhostRooms";
import userDefaultImage from "../assets/images/userDefault.jpg";

interface Room {
  id: string;
  title: string;
  state: string;
  player: Record<string, any>;
  host: string;
  passwordYn: string;
  password: string;
  messages: string;
  max: number;
  min: number;
  game: string;
}

const RoomList = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "Rooms"), where("state", "==", "waiting")),
      (snapshot) => {
        const list: Room[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            state: data.state,
            player: data.player || {},
            host: data.host || "",
            passwordYn: data.passwordYn,
            password: data.password,
            messages: data.messages,
            max: data.max || 0,
            min: data.min || 0,
            game: data.game,
          };
        });
        setRooms(list);
      },
      (err) => {
        console.error("방 목록 실시간 조회 실패", err);
      }
    );

    cleanupGhostRooms();

    return () => unsubscribe();
  }, []);

  const handleEnterRoom = async (roomId: string) => {
    const user = auth.currentUser;
    const uid = user?.uid;
    const nickname = user?.displayName || "이름을 지정해 주세요.";
    const photoURL = user?.photoURL || userDefaultImage;

    if (!uid) {
      alert("로그인이 필요합니다.");
      return;
    }

    const roomRef = doc(db, "Rooms", roomId);
    const newPlayerRef = doc(db, "Rooms", roomId, "player", uid);
    try {
      await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) throw new Error("방이 존재하지 않습니다.");
  
        const roomData = roomSnap.data();
        if (roomData.state !== "waiting") throw new Error("게임이 시작되었거나 종료된 방입니다.");
  
        const playerDocsSnap = await getDocs(collection(db, "Rooms", roomId, "player")); // 🔥 수정된 부분
        const currentPlayers = playerDocsSnap.docs.map((doc) => doc.id);
  
        if (currentPlayers.includes(uid)) return;
        if (currentPlayers.length >= roomData.max) throw new Error("방 정원이 가득 찼습니다.");
  
        transaction.set(newPlayerRef, {
          nickname : nickname,
          photoURL : photoURL,
          joinedAt: new Date(),
          lastActive: new Date(),
          ready: false,
          status: "online",
        });
      });
  
      navigate(`/room/${roomId}/wait`);

    } catch (err: any) {
      console.error("입장 중 오류", err);
      alert(err.message || "방 입장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="room-list-container">
      <div className="room-list-header">
        <h2>방 목록</h2>
        <button onClick={() => setIsCreateOpen(true)}>방 만들기</button>
      </div>

      {isCreateOpen && (
        <Modal onClose={() => setIsCreateOpen(false)}>
          <RoomCreateForm
            currentUser={{ uid: auth.currentUser?.uid || "anonymous" }}
            onClose={() => setIsCreateOpen(false)}
          />
        </Modal>
      )}

      {/* 데스크탑 테이블 */}
      <div className="room-table-wrapper desktop-only">
        <table className="room-table room-table-head">
          <thead>
            <tr>
              <th>게임</th>
              <th>방 제목</th>
              <th>게임 상태</th>
              <th>시간 제한</th>
              <th>인원 제한</th>
              <th></th>
            </tr>
          </thead>
        </table>
        <div className="room-table-body-scroll">
          <table className="room-table">
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.game}</td>
                  <td>{room.title}</td>
                  <td>{room.state}</td>
                  <td>0</td>
                  <td>최대 {room.max} 명</td>
                  <td>
                    <button className="enter-button" onClick={() => handleEnterRoom(room.id)}>
                      입장
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 모바일 카드형 UI */}
      <div className="room-card-list mobile-only">
        {rooms.map((room) => (
          <div className="room-card" key={room.id}>
            <div className="room-card-top">
              <span>{room.game}</span>
              <span>시간제한: 0초</span>
            </div>
            <div className="room-card-title">{room.title}</div>
            <div className="room-card-bottom">
              <span>{Object.keys(room.player || {}).length}/{room.max} 명</span>
              <button className="enter-button" onClick={() => handleEnterRoom(room.id)}>
                입장
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomList;
