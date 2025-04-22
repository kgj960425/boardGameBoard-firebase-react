import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

// 이벤트 관리 Hook
export const useGameEvents = (roomId: string) => {
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        if (!roomId) return;

        const eventsRef = collection(db, "Rooms", roomId, "event");
        const q = query(eventsRef, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newEvents = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEvents(newEvents);
        });

        return () => unsubscribe();
    }, [roomId]);

    return events;
};