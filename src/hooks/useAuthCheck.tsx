import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useLoginAction } from '../stores/LoginStore';
import { useNavigate } from 'react-router-dom';

const auth = getAuth();

const useAuthCheck = () => {
    const { setIsLoginValid } = useLoginAction();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoginValid(true);
            } else {
                setIsLoginValid(false);
                navigate('/login');
            }
        });

        return () => unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
    }, [setIsLoginValid, navigate]);
};

export default useAuthCheck;
