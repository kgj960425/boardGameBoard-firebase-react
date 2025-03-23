import { useEffect, useState } from 'react';
import { setCookie, getCookie, removeCookie } from '../utils/CookieUtils.tsx';
import { useNavigate } from 'react-router-dom';
import { useLoginAction } from '../stores/LoginStore';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

const Login = () => {
    const [id, setID] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [saveId, setSaveId] = useState<boolean>(false);
    const [savePassword, setSavePassword] = useState<boolean>(false);
    const [autoLogin, setAutoLogin] = useState<boolean>(false);
    const { setIsLoginValid } = useLoginAction();
    const navigate = useNavigate();

    // ⭐ 쿠키에서 데이터 가져오기 ⭐
    useEffect(() => {
        const storedId = getCookie("id");
        const storedPassword = getCookie("password");
        const storedAutoLogin = getCookie("autoLogin") === true;
        const storedSaveId = !!storedId;
        const storedSavePassword = !!storedPassword;
        console.log(storedId)
        console.log(storedPassword)
        console.log(storedAutoLogin)
        console.log(storedSaveId)
        console.log(storedSavePassword)


        setID(storedId || '');
        setPassword(storedPassword || '');
        setAutoLogin(storedAutoLogin);
        setSaveId(storedSaveId);
        setSavePassword(storedSavePassword);

    }, []);

    // ⭐ 로그인 버튼 클릭 시 동작 ⭐
    const handleClickLogin = async () => {

        if (!id || !password) {
            alert("아이디: ",id," 와 비밀번호",password,"를 입력해주세요.");
            return;
        }

        try {
            console.log('auth:',auth,'|id:',id, '|PASSWORD:', password,'|')
            const userCredential = await signInWithEmailAndPassword(auth, id, password);
            const user = userCredential.user;
            setIsLoginValid(true);
            setCookie('accessToken', await user.getIdToken(), 30);
            setCookie('isLogin', 'true', 30);
            navigate('/');

            // 쿠키 저장 처리
            if (autoLogin) {
                setCookie("autoLogin", "true", 30);
                setCookie("id", ID, 30);
                setCookie("password", password, 30);
            } else {
                removeCookie("autoLogin");
                if (saveId) {
                    setCookie("id", ID, 30);
                } else {
                    removeCookie("id");
                }
                if (savePassword) {
                    setCookie("password", password, 30);
                } else {
                    removeCookie("password");
                }
            }

        } catch (error) {
            alert('아이디 혹은 비밀번호가 일치하지 않습니다.');
            setIsLoginValid(false);
            setCookie('isLogin', 'false', 30);
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
                        <label>
                            <input
                                type="checkbox"
                                checked={autoLogin}
                                onChange={() => setAutoLogin((prev) => !prev)}
                            />
                            자동 로그인
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
