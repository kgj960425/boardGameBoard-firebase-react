import { Suspense } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loading from './pages/Loading';

// Layouts
import LoginLayout from '../src/layouts/LoginLayout';
import LobbyLayout from '../src/layouts/LobbyLayout';
import WaitingRoomLayout from '../src/layouts/WaitingRoomLayout';
import PlayRoomLayout from '../src/layouts/PlayRoomLayout';

// Pages
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import TraningPage from './pages/TraningPage';
import AdminPage from './pages/AdminPage';
import Store from './pages/Store';
import Upload from './pages/Upload';
import RoomList from './pages/RoomList';
import WaitingRoom from './pages/WaitingRoom';

function App() {
  return (
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* 로그인 레이아웃 */}
          <Route element={<LoginLayout />}>
            <Route path="/login" element={<Login />} />
            {/* <Route path="/signup" element={<Signup />} /> */}
          </Route>

          {/* 로비/기본 레이아웃 */}
          <Route element={<LobbyLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/Store" element={<Store />} />
            <Route path="/Upload" element={<Upload />} />
            <Route path="/TraningPage" element={<TraningPage />} />
            <Route path="/RoomList" element={<RoomList />} />
            <Route path="/AdminPage" element={<AdminPage />} />
          </Route>

          {/* 대기방 */}
          <Route element={<WaitingRoomLayout />}>
            <Route path="/room/:roomId/wait" element={<WaitingRoom />} />
          </Route>

          {/* 게임 플레이 룸 */}
          <Route element={<PlayRoomLayout />}>
            <Route path="/room/:roomId/play" element={<div>게임 플레이 화면</div>} />
          </Route>

          {/* 없는 페이지 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
  );
}

export default App;
