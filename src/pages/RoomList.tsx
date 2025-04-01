import { useEffect, useState } from "react";
import { db } from "../firebase/firebase.tsx";
import { getDocs, query, where, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./RoomList.css";

interface Room {
  title: string;
  state: string;
  players: [];
  passwordYn: string;
  password: string;
  messages: string;
  maxPlayers: number;
  game: string;
  id: string;
}

const RoomList = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();

  const navigateWaitingRoom = (roomId: string) => {
    navigate(`/room/${roomId}/wait`);
  };

  const searchRoomList = async () => {
    try {
      const roomQuery = query(
        collection(db, "A.rooms"),
        where("state", "==", "waiting")
      );
      const roomSnapshot = await getDocs(roomQuery);
      const roomList = roomSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          state: data.state,
          players: data.players.length,
          passwordYn: data.passwordYn,
          password: data.password,
          messages: data.messages,
          maxPlayers: data.maxPlayers,
          game: data.game,
        };
      });

      setRooms(roomList);
    } catch (error) {
      console.error("방 목록 조회 실패", error);
    }
  };

  useEffect(() => {
    searchRoomList();
  }, []);

  return (
    <div className="room-list-container">
      <div className="room-list-header">
        <h2>방 목록</h2>
        <button>방 만들기</button>
      </div>

      {/* 데스크탑 테이블 */}
      <table className="room-table desktop-only">
        <thead>
          <tr>
            <th>게임</th>
            <th>방제목</th>
            <th>게임상태</th>
            <th>시간제한</th>
            <th>인원 수</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>{room.game}</td>
              <td>{room.title}</td>
              <td>{room.state}</td>
              <td>0</td>
              <td>
                {room.players}/{room.maxPlayers}
              </td>
              <td>
                <button
                  className="enter-button"
                  onClick={() => navigateWaitingRoom(room.id)}
                >
                  입장
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
              <span>
                {room.players}/{room.maxPlayers} 명
              </span>
              <button
                className="enter-button"
                onClick={() => navigateWaitingRoom(room.id)}
              >
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
