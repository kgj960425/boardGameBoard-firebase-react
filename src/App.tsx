import { Suspense } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loading from './pages/Loading';
import { useResponsiveLogger } from "./utils/useResponsiveLogger";

// Layouts
// import LoginLayout from '../src/layouts/LoginLayout';
import LobbyLayout from '../src/layouts/LobbyLayout';
import WaitingRoomLayout from '../src/layouts/WaitingRoomLayout';
import PlayRoomLayout from '../src/layouts/PlayRoomLayout';

// Pages
// import Login from './pages/Login';
import RoomList from './pages/RoomList';
import WaitingRoom from './pages/WaitingRoom';
import useAuthCheck from "./hooks/useAuthCheck.tsx";
import UserProfileEditor from "./pages/UserProfileEditor.tsx";
import CommunityPage from "./pages/CommunityPage.tsx"
import ExplodingKittens from './games/ExplodingKittens.tsx';
import Test from './pages/tests/Test.tsx';
import Test2 from './pages/tests/Test2.tsx';
import Test3 from './pages/tests/Test3.tsx';

function App() {
  //브라우저 css 모드 체크
  useResponsiveLogger();
  // 로그인 상태 확인
  useAuthCheck();
  return (
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* 로그인 레이아웃 */}
          <Route element={<PlayRoomLayout />}>
            <Route path="/login" element={<ExplodingKittens />} />
          </Route>
          {/* <Route element={<LoginLayout />}> 
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route> */}

          {/* 로비/기본 레이아웃 */}
          <Route element={<LobbyLayout />}>
            <Route path="/" element={<RoomList />} />
            <Route path="/UserProfileEditor" element={<UserProfileEditor />} />
            <Route path="/CommunityPage" element={<CommunityPage />} />
            <Route path="/test" element={<Test />} />
            <Route path="/test2" element={<Test2 />} />
          </Route>

          {/* 대기방 */}
          <Route element={<WaitingRoomLayout />}>
            <Route path="/room/:roomId/wait" element={<WaitingRoom />} />
          </Route>

          {/* 게임 플레이 룸 */}
          <Route element={<PlayRoomLayout />}>
            <Route path="/room/:roomId/play" element={<ExplodingKittens />} />
          </Route>

          {/* 없는 페이지 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
  );
}

export default App;
