import { Outlet } from 'react-router-dom';
import ChattingRoom from "../components/chattingRoom";

export default function PlayRoomLayout() {
  const currentUser = {
      uid: "uid1",
      nickname: "철수"
  };
    
  const roomId = "r.2025033100001";

  return (
    <div className="PlayRoom-layout">
      <Outlet />
      <div style={{ position: "relative", width: "100%", height: "100vh" }}>
        <ChattingRoom roomId={roomId} currentUser={currentUser} />
      </div>
    </div>
  );
}