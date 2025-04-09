import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { useLoginAction } from '../stores/LoginStore';

const useAuthCheck = () => {
  const { setIsLoginValid } = useLoginAction();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false); // ✅ 로그인 상태 확인 완료 여부

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoginValid(true);
      } else {
        setIsLoginValid(false);
        if (checked) {
          navigate('/login');
        }
      }
      setChecked(true);
    });

    return () => unsubscribe();
  }, [checked, navigate, setIsLoginValid]);
};

export default useAuthCheck;
