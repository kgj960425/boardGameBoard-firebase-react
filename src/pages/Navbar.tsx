import { useEffect, useState } from "react";
import "./Navbar.css";
import { useNavigate, NavLink } from "react-router-dom";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase/firebase.tsx";
import { useLoginAction } from "../stores/LoginStore";

const Navbar = () => {
    const [userName, setUserName] = useState<string>("로딩 중...");
    const { setIsLoginValid } = useLoginAction();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            if (user) {
                const name = user.displayName || "null";
                setUserName(name);
            } else {
                setUserName("로그인 필요");
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setIsLoginValid(false);
            navigate("/Login");
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    return (
        <nav className="navbar">
            <div><NavLink to="/RoomList">Home</NavLink></div>
            <div><NavLink to="/UserProfileEditor">내 정보 수정</NavLink></div>
            <div style={{ color: "white" }}>{userName} 님</div>
            <button onClick={handleSignOut}>로그아웃</button>
        </nav>
    );
};

export default Navbar;
