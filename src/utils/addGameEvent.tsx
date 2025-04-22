import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// 이벤트 기록 함수
export const addGameEvent = async (
    roomId: string,
    eventType: string,
    eventPayload: Record<string, any>,
    from: string,
    to: string | null = null,
    deadlineSec: number | null = null
) => {
    try {
        const eventRef = collection(db, "Rooms", roomId, "event");

        const eventData = {
            type: eventType,
            from,
            to,
            payload: eventPayload,
            timestamp: serverTimestamp(),
            deadline: deadlineSec ? new Date(Date.now() + 1000 * deadlineSec) : null,
        };

        await addDoc(eventRef, eventData);
        console.log(`${eventType} 이벤트가 성공적으로 저장되었습니다.`);
    } catch (error) {
        console.error("이벤트 저장 중 오류 발생:", error);
    }
};