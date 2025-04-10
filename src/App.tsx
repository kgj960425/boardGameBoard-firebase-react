import { Suspense } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loading from './pages/Loading';
import { useResponsiveLogger } from "./utils/useResponsiveLogger";

// Layouts
import LoginLayout from '../src/layouts/LoginLayout';
import LobbyLayout from '../src/layouts/LobbyLayout';
import WaitingRoomLayout from '../src/layouts/WaitingRoomLayout';
import PlayRoomLayout from '../src/layouts/PlayRoomLayout';

// Pages
import Login from './pages/Login';
import RoomList from './pages/RoomList';
import WaitingRoom from './pages/WaitingRoom';
import useAuthCheck from "./hooks/useAuthCheck.tsx";
import UserProfileEditor from "./pages/UserProfileEditor.tsx";
import usePresenceManager from './hooks/usePresenceManager';
import CommunityPage from "./pages/CommunityPage.tsx"
import ExplodingKittens from './games/ExplodingKittens.tsx';
import Test from './pages/tests/Test.tsx';
import Test2 from './pages/tests/Test2.tsx';
import Test3 from './pages/tests/Test3.tsx';
function App() {

  useResponsiveLogger();
  useAuthCheck(); // 내부에서 navigate는 checking이 false일 때만 실행
  usePresenceManager(); // 내부에서 user가 있을 때만 작동

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<LoginLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<LobbyLayout />}>
          <Route path="/" element={<RoomList />} />
          <Route path="/UserProfileEditor" element={<UserProfileEditor />} />
          <Route path="/CommunityPage" element={<CommunityPage />} />
          <Route path="/test" element={<Test />} />
          <Route path="/test2" element={<Test2 />} />
          <Route path="/test3" element={<Test3 />} />
        </Route>

        <Route element={<WaitingRoomLayout />}>
          <Route path="/room/:roomId/wait" element={<WaitingRoom />} />
        </Route>

        <Route element={<PlayRoomLayout />}>
          <Route path="/room/:roomId/play" element={<ExplodingKittens />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}


export default App;

