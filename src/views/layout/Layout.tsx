import { Outlet } from "react-router-dom";
import Navbar from "../../pages/Navbar";
import "../../pages/Navbar.css";

const Layout = () => {
  return (
    <>
      <Navbar />
      <div className="content">
        <Outlet /> {/* 네비게이션 아래의 페이지 변경 */}
      </div>
    </>
  );
};

export default Layout;
