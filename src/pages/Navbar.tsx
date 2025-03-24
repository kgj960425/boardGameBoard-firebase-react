import { useEffect, useState } from "react";
import "./Navbar.css";
import { useNavigate, NavLink } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { app, db } from '../pages/firebase';
import { useLoginAction } from "../stores/LoginStore";

const Navbar = () => {
  const [userName, setUserName] = useState("");
  const { setIsLoginValid } = useLoginAction();
  const navigate = useNavigate();
  const adminUid = 'yOe9xt4h45dmJ7ELn4MGwmq05fh1';
  // 현재 접속 사용자 정보
  const auth = getAuth();
  const user = auth.currentUser;

  const onSignOut = async () => {
    try {
      
      const auth = getAuth(app);
      console.log("auth" + auth);
      if(auth){
        await signOut(auth);
        setIsLoginValid(false);
      }
      
      navigate('/Login');
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {    
    if (user) {
        console.log(user.uid);  // 사용자 UID
    } else {
        console.log('User is not logged in.');
    }

    // 사용자가 로그인한 후 이름을 네비게이션 바에 표시하는 함수 예시
    async function displayUserName() {

        if (!user) {
            console.error('User is not logged in.');
            return;
        }

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        const userData = docSnap.data();
        setUserName(userData?.displayName);
        // 네비게이션 바의 특정 요소(예: id="user-name")에 이름을 표시합니다.
        if (docSnap) {
            // 사용자 이름이 없는 경우 기본값 사용
            setUserName(userData?.displayName || "사용자");
        } else {
            setUserName('User is not logged in.');
        }
    }
    displayUserName();
  }, []);

  return (
    <nav>
      <div>
        <NavLink to="/">
          Home
        </NavLink>
      </div>
      <div>
        <NavLink to="/Store">
          Store
        </NavLink>
      </div>
      <div>
        <NavLink to="/Upload">
          Upload
        </NavLink>
      </div>
      <div>
        <NavLink to="/TraningPage">
          TraningPage
        </NavLink>
      </div>
      <div>
        <NavLink to="/RoomTable">
          RoomTable
        </NavLink>
      </div>
      {user && adminUid === user.uid && (
        <div>
          <NavLink to="/AdminPage">
            AdminPage
          </NavLink>
        </div>
      )}
      <div style={{ color: 'white'}}>{userName} 님</div>
      <button onClick={onSignOut}>로그아웃</button>
    </nav>
  );
};

export default Navbar;