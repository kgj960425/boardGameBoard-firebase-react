import { useGameEvents } from "../utils/useGameEvents";
import { useEffect } from "react";

const GameEventHandler = ({ roomId }: { roomId: string }) => {
    const events = useGameEvents(roomId);

    useEffect(() => {
        if (!events.length) return;

        const latestEvent = events[events.length - 1];

        switch (latestEvent.type) {
            case "submit-card":
                console.log("카드 제출 이벤트 처리:", latestEvent.payload);
                break;
            case "favor":
                console.log("Favor 카드 요청 처리:", latestEvent.from, "→", latestEvent.to);
                break;
            case "nope":
                console.log("Nope 카드 사용 처리:", latestEvent.from, "→", latestEvent.to || "Everyone");
                break;
            case "recover-from-discard":
                console.log("카드 복구 처리:", latestEvent.payload.card);
                break;
            default:
                console.log("알 수 없는 이벤트 타입:", latestEvent.type);
        }
    }, [events]);

    return null;
};

export default GameEventHandler;