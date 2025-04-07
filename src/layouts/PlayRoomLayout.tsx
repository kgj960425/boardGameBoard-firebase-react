import {Outlet} from 'react-router-dom';
import './PlayRoomLayout.css';

export default function PlayRoomLayout() {
    return (
    <div className="PlayRoom-layout">
      <Outlet />
    </div>
    );
}