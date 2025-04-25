import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { auth } from "../firebase/firebase";

import {
    useSubscribeToRoomDoc,
    useSubscribeToRoomEvents,
    useSubscribeToRoomHistory,
    submitCard,
} from "./ExplodingKittensUtil.tsx";
import "./ExplodingKittens.css";

import useRoomMessages, { ChatMessage } from "../hooks/useRoomMessages";
import useSendMessage from "../hooks/useSendMessage";
import { usePlayerInfo } from "../hooks/usePlayerInfo";

const ExplodingKittens = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const myUid = auth.currentUser?.uid || "";

    const roomDoc = useSubscribeToRoomDoc(roomId ?? "");
    const events = useSubscribeToRoomEvents(roomId ?? "");
    const now = useSubscribeToRoomHistory(roomId ?? "");
    const playerInfo = usePlayerInfo(roomId ?? "");
    const sendMessage = useSendMessage(roomId ?? null);
    const messages: ChatMessage[] = useRoomMessages(roomId ?? null);

    const [input, setInput] = useState("");
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const myHandEntries = Object.entries(now?.playerCards[myUid] || []);
    let eventsResponseDisabled = false;

    // 채팅 자동 스크롤
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 이벤트 응답
    useEffect(() => {
        console.log("events : ", events);
    }, [events])

    const handleCardClick = (key: string) =>
        setSelectedKeys(prev =>
            // 이미 들어있으면 제거, 없으면 뒤에 추가
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );

    const handleCardSubmit = async () => {
        if (!roomId || !now) return;
        let cards: string[] = [];
        console.log("제출하려는 카드 : ", selectedKeys);
        if (selectedKeys.length > 0) {
            cards = selectedKeys
                .map((k) => now?.playerCards[myUid][k])
                .filter((card): card is string => card !== undefined);
        }
        await submitCard(roomId, cards, now);
        setSelectedKeys([]);
    };

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input);
        setInput("");
    };

    if (!roomId || !myUid || !roomDoc) return null;
    return (
        <div className="playroom-container">
            {/* ▶ 플레이어 바 */}
            <div className="playroom-player-bar">
                {now?.turnOrder?.map((uid : string) => {
                    const isCurrent = now.currentPlayer === uid;
                    const count = Object.keys(now.playerCards[uid] || {}).length;
                    return (
                        <div
                            key={uid}
                            className={`playroom-player-profile ${
                                isCurrent ? "current-turn" : ""
                            }`}
                        >
                            <img
                                src={playerInfo[uid]?.photoURL || "/default-profile.png"}
                                alt="avatar"
                                className={`player-photo ${
                                    isCurrent ? "current-turn" : ""
                                }`}
                            />
                            <div className="playroom-player-info">
                                {playerInfo[uid]?.nickname || uid}
                            </div>
                            <div className="playroom-player-info">{count}장</div>
                        </div>
                    );
                })}
            </div>

            {/* ▶ 중앙: 사용 카드 · 덱 · 제출 버튼 */}
            <div className="playroom-center-zone">
                <div className="playroom-card playroom-used-card">
                    {now?.playedCard || "-"}
                </div>
                <div className="playroom-card playroom-deck-card">
                    <span className="playroom-deck-count">{now?.deck.length}</span>
                </div>
                {myUid === now?.currentPlayer ? (
                    <button onClick={handleCardSubmit}>
                        {selectedKeys.length ? "카드 제출" : "패스"}
                    </button>
                ) : (
                    <button>
                        Nope!
                    </button>
                )}
            </div>

            {/* ▶ 내 패 */}
            <div className="playroom-my-cards">
                {myHandEntries.map(([key, card]) => (
                    <div
                        key={key}
                        className={`playroom-card ${
                            selectedKeys.includes(key) ? "selected" : ""
                        }`}
                        onClick={() => handleCardClick(key)}
                    >
                        {String(card)}
                    </div>
                ))}
            </div>

            {/* ▶ 채팅 */}
            <div className="playroom-chat-container">
                <div className="playroom-chat-messages">
                    {messages.map((m, i) => {
                        const isMine = m.uid === myUid;
                        return (
                            <div
                                key={i}
                                className={`chat-message ${isMine ? "mine" : "other"}`}
                            >
                                {!isMine && (
                                    <div className="chat-nickname">{m.nickname}</div>
                                )}
                                <div className={`chat-bubble ${isMine ? "mine" : "other"}`}>{m.content}</div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
                <div className="playroom-chat-input">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="메시지를 입력하세요"
                    />
                    <button onClick={handleSend}>전송</button>
                </div>
            </div>
        </div>
    );
};

export default ExplodingKittens;
