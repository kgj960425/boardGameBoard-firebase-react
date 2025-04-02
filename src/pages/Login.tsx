import { useEffect, useState } from 'react';
import { setCookie, getCookie, removeCookie } from '../utils/CookieUtils.tsx';
import { useNavigate } from 'react-router-dom';
import { useLoginAction } from '../stores/LoginStore';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

const Login = () => {
  const [id, setID] = useState('');
  const [password, setPassword] = useState('');
  const [saveId, setSaveId] = useState(false);
  const [savePassword, setSavePassword] = useState(false);
  const { setIsLoginValid } = useLoginAction();
  const navigate = useNavigate();

  useEffect(() => {
    const storedId = getCookie("id");
    const storedPassword = getCookie("password");
    setID(storedId || '');
    setPassword(storedPassword || '');
    setSaveId(!!storedId);
    setSavePassword(!!storedPassword);
  }, []);

  const handleClickLogin = async () => {
    if (!id || !password) {
      alert("아이디 와 비밀번호 를 입력해주세요.");
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, id, password);
      const user = result.user;
      setIsLoginValid(true);
      setCookie('accessToken', await user.getIdToken(), { maxAge: 7 * 24 * 60 * 60 });
      setCookie('isLogin', 'true', { maxAge: 7 * 24 * 60 * 60 });
      navigate('/');

      saveId ? setCookie("id", id, { maxAge: 7 * 24 * 60 * 60 }) : removeCookie("id");
      savePassword ? setCookie("password", password, { maxAge: 7 * 24 * 60 * 60 }) : removeCookie("password");

    } catch (error) {
      alert('아이디 혹은 비밀번호가 일치하지 않습니다. : ' + error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <input
        style={{
          padding: '12px 20px',
          width: '100%',
          borderRadius: '8px',
          border: 'none',
          background: '#333',
          color: '#fff',
          fontSize: '16px',
        }}
        type="text"
        placeholder="ID를 입력하세요"
        value={id}
        onChange={(e) => setID(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleClickLogin()}
      />

      <input
        style={{
          padding: '12px 20px',
          width: '100%',
          borderRadius: '8px',
          border: 'none',
          background: '#333',
          color: '#fff',
          fontSize: '16px',
        }}
        type="password"
        placeholder="비밀번호를 입력하세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleClickLogin()}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '32px', fontSize: '14px', color: '#ccc', marginTop: '8px' }}>
        <label><input type="checkbox" checked={saveId} onChange={() => setSaveId(!saveId)} /> ID 저장</label>
        <label><input type="checkbox" checked={savePassword} onChange={() => setSavePassword(!savePassword)} /> 비밀번호 저장</label>
      </div>

    <button
        style={{
          width: '100%',
          padding: '12px',
          background: '#FF6B00',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          fontWeight: 'bold',
          fontSize: '16px',
          marginTop: '12px',
          cursor: 'pointer',
        }}
        onClick={handleClickLogin}
      >
        로그인
      </button>
    </div>
  );
};

export default Login;
