import { useEffect, useState } from "react";
import "./Navbar.css";
import { NavLink } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from '../pages/firebase';

const Navbar = () => {
  const [userName, setUserName] = useState("");
  useEffect(() => {    
    // 현재 접속 사용자 정보
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
        console.log(user.uid);  // 사용자 UID
    } else {
        console.log('User is not logged in.');
    }

    // 사용자가 로그인한 후 이름을 네비게이션 바에 표시하는 함수 예시
    async function displayUserName() {
        const auth = getAuth();
        const user = auth.currentUser;
        
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
      <div>
        <NavLink to="/mypage">
          MyPage
        </NavLink>
      </div>
      <div style={{ color: 'white'}}>{userName} 님</div>
    </nav>
  );
};

export default Navbar;