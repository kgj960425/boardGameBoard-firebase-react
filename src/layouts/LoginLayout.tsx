import { Outlet } from 'react-router-dom';

export default function LoginLayout() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: `url('/assets/images/cazino_table.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <main
        style={{
          width: '100%',
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
