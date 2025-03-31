import Navbar from '../pages/Navbar';
// import { Outlet, Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth'; // 로그인 상태 체크

export default function LobbyLayout() {
//   const user = useAuth();
//   if (!user) return <Navigate to="/login" />;

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
