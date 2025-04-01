import { useEffect, useState } from 'react';
import { setCookie, getCookie, removeCookie } from '../utils/CookieUtils.tsx';
import { useNavigate } from 'react-router-dom';
import { useLoginAction } from '../stores/LoginStore';
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";

const auth = getAuth();

const Login = () => {
    const [id, setID] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [saveId, setSaveId] = useState<boolean>(false);
    const [savePassword, setSavePassword] = useState<boolean>(false);
    const { setIsLoginValid } = useLoginAction();
    const navigate = useNavigate();

    // 쿠키에서 데이터 가져오기
    useEffect(() => {
        const storedId = getCookie("id");
        const storedPassword = getCookie("password");
        const storedSaveId = !!storedId;
        const storedSavePassword = !!storedPassword;

        setID(storedId || '');
        setPassword(storedPassword || '');
        setSaveId(storedSaveId);
        setSavePassword(storedSavePassword);
        
        //흠... handle click login이 실행 될때는 id, password란 이 비어 있고 input 박스도 전부 비어 있는 상태에서 이벤트가 발생해서 빈 값으로 로그인 시도를한다. 그래서 자동 로그인이 안되었던 듯.
        //이건 javascript의 힙,스택,큐 로딩에 관한 지식이 좀 더 생겨야 가능할 듯하다.
    }, []);

    // 로그인 버튼 클릭 시 동작
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

            if (saveId) {
                setCookie("id", id, { maxAge: 7 * 24 * 60 * 60 });
            } else {
                removeCookie("id");
            }
            if (savePassword) {
                setCookie("password", password, { maxAge: 7 * 24 * 60 * 60 });
            } else {
                removeCookie("password");
            }
        } catch (error) {
            alert('아이디 혹은 비밀번호가 일치하지 않습니다. : ' + error);
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
                <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>LOGIN PAGE</h1>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <input
                        style={{ display: 'block', marginBottom: '20px', padding: '10px 20px', width: '400px', fontSize: '20px' }}
                        type="text"
                        required
                        placeholder="ID를 입력하세요"
                        value={id}
                        onChange={(e) => setID(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleClickLogin()}
                    />
                    <input
                        style={{ display: 'block', padding: '10px 20px', width: '400px', fontSize: '20px', marginBottom: '20px' }}
                        type="password"
                        required
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleClickLogin()}
                    />
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <label>
                            <input
                                type="checkbox"
                                checked={saveId}
                                onChange={() => setSaveId((prev) => !prev)}
                            />
                            ID 저장
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={savePassword}
                                onChange={() => setSavePassword((prev) => !prev)}
                            />
                            비밀번호 저장
                        </label>
                    </div>
                    <button
                        style={{ width: '400px', background: '#FF6B00', color: '#fff', padding: '10px 20px' }}
                        onClick={handleClickLogin}
                    >
                        LOGIN
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
