import { useEffect, useState } from 'react';
import { setCookie } from '../utils/CookieUtils.tsx';
import { useNavigate } from 'react-router-dom';
import { useLoginAction } from '../stores/LoginStore';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

const Login = () => {
  const [ID, setID] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { setIsLoginValid } = useLoginAction();
  const navigate = useNavigate();

  useEffect(() => { 
    navigate('/');
    setIsLoginValid(true);
  }, []);

  const handleClickLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, ID, password);
      const user = userCredential.user;
      setIsLoginValid(true);
      setCookie('accessToken', await user.getIdToken());
      setCookie('isLogin', 'true');
      navigate('/');
    } catch (error) {
      alert('아이디 혹은 비밀번호가 일치하지 않습니다.');
      setIsLoginValid(false);
      setCookie('isLogin', 'false');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>FUCKING LOGIN PAGE</h1>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <input
            style={{ display: 'block', marginBottom: '20px', padding: '10px 20px', width: '400px', fontSize: '20px' }}
            type="text"
            required
            placeholder="ID를 입력하세요"
            // value="player001@gmail.com"
            onChange={(e) => setID(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleClickLogin();
              }
            }}
          />
          <input
            style={{ display: 'block', padding: '10px 20px', width: '400px', fontSize: '20px', marginBottom: '20px' }}
            type="password"
            required
            placeholder="비밀번호를 입력하세요"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleClickLogin();
              }
            }}
          />
          <button style={{ width: '400px', background: '#FF6B00', color: '#fff', padding: '10px 20px' }} onClick={handleClickLogin}>
            LOGIN
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
