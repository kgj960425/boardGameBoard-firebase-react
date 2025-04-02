import { useEffect, useState } from "react";
import { db } from "../firebase/firebase.tsx";
import { getDocs, query, where, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./RoomList.css";

interface Room {
  id: string;
  title: string;
  state: string;
  players: number;
  passwordYn: string;
  password: string;
  messages: string;
  maxPlayers: number;
  game: string;
}

const RoomList = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const q = query(collection(db, "A.rooms"), where("state", "==", "waiting"));
      const snapshot = await getDocs(q);
      const list: Room[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          state: data.state,
          players: data.players?.length || 0,
          passwordYn: data.passwordYn,
          password: data.password,
          messages: data.messages,
          maxPlayers: data.maxPlayers,
          game: data.game,
        };
      });
      setRooms(list);
    } catch (err) {
      console.error("방 목록 조회 실패", err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const navigateToRoom = (roomId: string) => {
    navigate(`/room/${roomId}/wait`);
  };

  return (
    <div className="room-list-container">
      <div className="room-list-header">
        <h2>방 목록</h2>
        <button>방 만들기</button>
      </div>

      {/* 데스크탑 테이블 */}
      <div className="room-table-wrapper desktop-only">
        <table className="room-table room-table-head">
          <thead>
            <tr>
              <th>게임</th>
              <th>방 제목</th>
              <th>게임 상태</th>
              <th>시간 제한</th>
              <th>인원 수</th>
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
                  <td>{room.players}/{room.maxPlayers}</td>
                  <td>
                    <button className="enter-button" onClick={() => navigateToRoom(room.id)}>
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
              <span>{room.players}/{room.maxPlayers} 명</span>
              <button className="enter-button" onClick={() => navigateToRoom(room.id)}>
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
