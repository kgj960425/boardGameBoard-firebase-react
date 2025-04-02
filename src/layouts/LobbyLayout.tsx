import Navbar from '../pages/Navbar';
import { Outlet } from 'react-router-dom';
import './LobbyLayout.css';

export default function LobbyLayout() {

  return (
    <div className="lobby-layout">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
