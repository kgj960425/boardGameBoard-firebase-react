import { Outlet } from 'react-router-dom';
import loginLayoutImage from '../assets/images/loginLayout.png'; // 이미지 경로를 수정하세요

export default function LoginLayout() {
  return (
    <div
      style={{
        width: '100dvw',
        height: '100dvh',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: `url(${loginLayoutImage})`, /* playing room에서는 적용하기 싫은 코드*/
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <main
        style={{
          maxWidth: '500px',
          padding: '40px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '16px',
          boxShadow: '0 0 20px rgba(0,0,0,0.6)',
          color: '#fff',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
