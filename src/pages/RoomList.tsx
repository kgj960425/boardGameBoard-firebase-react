import { useEffect, useState } from "react";
import { db } from './firebase';
import { getDocs, query, where } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import './RoomList.css';
// import CreateRoomModal from "../modals/CreateRoomModal";

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

//player001
const RoomList = () => {
  const [ rooms, setRooms ] = useState<Room[]>([]);
  // const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  
  //대기방으로 이동
  const navigateWaitingRoom = ( roomId: string ) => {
    navigate(`/room/${roomId}/wait`);
  }

  //방 목록 조회
  const searchRoomList = async () => {
    try {
      //                                                 필드 레벨에서 'state' 컬럼을 찾고 값이 end인 document 제외
      const roomQuery = query(collection(db, 'A.rooms'), where("state", "!=", "end"));
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
      
    }
  } 

  useEffect(() => {
    
  }, []);

  //데이터 항상 자동 최신화
  searchRoomList();

  return (
    <div className="room-list-container">
      <div className="room-list-header">
        <h2>방 목록</h2>
        <button>방 만들기</button>
      </div>

      <table className="room-table">
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
              <td><span>{room.title}</span></td>
              <td>{room.state}</td>
              <td>0</td>
              <td>{room.players}/{room.maxPlayers}</td>
              <td>
                <button className="enter-button" onClick={() => navigateWaitingRoom(room.id)}>
                  입장
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoomList;
