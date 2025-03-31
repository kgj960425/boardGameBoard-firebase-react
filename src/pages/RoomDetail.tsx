import React, {useEffect, useState} from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase.tsx";

interface Room {
    title: string;
    state: string;
    players: [];
    passwordYn: string;
    password: string;
    messages: string;
    maxPlayers: number;
    game: string;
    id: string;
}

const RoomDetail = ( roomId ) => {
    const [ room, setRoom ] = useState<Room>();
    
    const getRoomTitle = async (roomId: string) => {
        const docRef = doc(db, 'A.rooms', roomId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.log("No such document!");
        } else {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                title: ,
                state: data.state,
                players: data.players,
                passwordYn: data.passwordYn,
                password: data.password,
                messages: data.messages,
                maxPlayers: data.maxPlayers,
                game: data.game,
            };
            setRoom(data);
        }
    };

    useEffect(() => {
        getRoomTitle( roomId );
    }, []);
    
    return(
        <>
            <div>대기방 화면 , { room.title? } </div>
        </>
    )
}

export default RoomDetail;