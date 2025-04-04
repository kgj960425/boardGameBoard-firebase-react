import { Outlet } from 'react-router-dom';
import './WaitingRoomLayout.css'; // CSS 따로 관리 추천

export default function WaitingRoomLayout() {
  return (
    <div className="waitingroom-layout">
      <main className="waitingroom-main">
        <Outlet />
      </main>
    </div>
  );
}