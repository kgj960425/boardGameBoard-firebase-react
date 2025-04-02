import {Outlet, useParams} from 'react-router-dom';
import ChattingRoom from "../components/chattingRoom";

export default function PlayRoomLayout() {
    const { roomId } = useParams<{ roomId: string }>();
    return (
    <div className="PlayRoom-layout">
      <Outlet />
      {roomId && <ChattingRoom roomId={roomId}/>}
    </div>
    );
}