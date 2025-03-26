import { useEffect, useState } from "react";
import { db } from './firebase';
import { getDocs, query, where } from "firebase/firestore";
import { collection } from "firebase/firestore";

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
const RoomTable = () => {
  const [ rooms, setRooms ] = useState<Room[]>([]);

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
    <div style={{ padding: '50px', width: '1220px', margin: '0 auto', background: `url('/path/to/cazino_table.jpg')` }}>
      <div style={{ height: '20px', color: 'red'}}></div>
      <div>
        <button
          className="btn-main"
          id="clkMakeRoom"
          type="button"
          style={{
            height: '38px',
            boxShadow: '0 0 10px 2px rgb(120 68 152 / 62%)',
            fontWeight: 'bold',
          }}
        >
          방만들기
        </button>
      </div>

      <div style={{ height: '10px' }}></div>
      <div id='roomTbody'>
        <table id="room-table" style={{ border : '1px solid black' , borderCollapse: 'collapse'}}>
          <thead style={{ border : '1px solid black' , borderCollapse: 'collapse'}}>
            <tr>
              <th scope="col" style={{ width: '210px' }}>게임</th>
              <th scope="col" style={{ width: '210px' }}>방제목</th>
              <th scope="col" style={{ width: '65px' }}>게임상태</th>
              <th scope="col" style={{ width: '65px' }}>시간제한</th>
              <th scope="col" style={{ width: '60px' }}>인원 수</th>
              <th scope="col" style={{ width: '65px' }}></th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr data-room-seq={room.id} style={{ border : '1px solid black'}}>
                <td style={{ wordBreak: 'keep-all' }}>{room.game}</td>
                <td style={{ wordBreak: 'keep-all' }}>
                  <span style={{ color: 'black', fontSize: '11px' }}>{room.title}</span>
                </td>
                <td>{room.state}</td>
                <td>0</td>
                <td>{room.players}/{room.maxPlayers}</td>
                <td>
                  <button
                    className="btn-main"
                    type="button"
                    name="btn"
                    data-kickuid="0"
                    style={{ height: '24px' }}
                  >
                    입장
                  </button>
                </td>
              </tr>
            ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomTable;
