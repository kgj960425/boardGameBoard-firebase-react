import "./Navbar.css";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <div>
        <NavLink to="/">
          Home
        </NavLink>
      </div>
      <div>
        <NavLink to="/TraningPage">
          TraningPage
        </NavLink>
      </div>
      <div>
        <NavLink to="/search">
          Search
        </NavLink>
      </div>
      <div>
        <NavLink to="/mypage">
          MyPage
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;