import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { auth } from "../firebase/firebase";

import {
    useSubscribeToRoomDoc,
    useSubscribeToRoomEvents,
    submitCard,
    handleRecoverCard,
} from "./ExplodingKittensUtil.tsx";
import "./ExplodingKittens.css";

import useRoomMessages, { ChatMessage } from "../hooks/useRoomMessages";
import useSendMessage from "../hooks/useSendMessage";
import { usePlayerInfo } from "../hooks/usePlayerInfo";
import RecoverFromDiscardModal from "../components/RecoverFromDiscardModal";

const ExplodingKittens = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const myUid = auth.currentUser?.uid || "";

    const roomDoc = useSubscribeToRoomDoc(roomId);
    const events = useSubscribeToRoomEvents(roomId);
    const playerInfo = usePlayerInfo(roomId);
    const sendMessage = useSendMessage(roomId ?? null);
    const messages: ChatMessage[] = useRoomMessages(roomId ?? null);

    const [input, setInput] = useState("");
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [isRecoverOpen, setIsRecoverOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const {
        turnOrder = [],
        currentPlayer = "",
        playerCards = {},
        deck = [],
        playedCard = null,
        discardPile = [],
        // 필요하다면 modalRequest, turn, nextPlayer 등도 꺼내세요
    } = roomDoc as any;

    const myHandEntries = Object.entries(playerCards[myUid] || []);

    // 채팅 자동 스크롤
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // (디버깅) roomDoc 과 events 확인
    useEffect(() => {
        console.log("🏠 roomDoc:", roomDoc);
        console.log("📝 events:", events);
    }, [roomDoc, events]);

    const handleCardClick = (key: string) =>
        setSelectedKeys((prev) =>
            prev.includes(key) ? [] : [key]
        );

    const handleCardSubmit = async () => {
        if (!selectedKeys.length || !roomId) return;
        const cards = selectedKeys.map((k) => playerCards[myUid][k]);
        await submitCard(roomId, cards, roomDoc);
        setSelectedKeys([]);
    };

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input);
        setInput("");
    };

    const openRecover = () => setIsRecoverOpen(true);
    const closeRecover = () => setIsRecoverOpen(false);
    const handleRecover = async (card: string) => {
        await handleRecoverCard(roomId, myUid, card, roomDoc);
        closeRecover();
    };

    if (!roomId || !myUid || !roomDoc) return null;
    return (
        <div className="playroom-container">
            {/* ▶ 플레이어 바 */}
            <div className="playroom-player-bar">
                {turnOrder.map((uid) => {
                    const isCurrent = currentPlayer === uid;
                    const count = Object.keys(playerCards[uid] || {}).length;
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
                                className="player-photo"
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
                    {playedCard || "-"}
                </div>
                <div className="playroom-card playroom-deck-card">
                    <span className="playroom-deck-count">{deck.length}</span>
                </div>
                {myUid === currentPlayer && (
                    <button onClick={handleCardSubmit}>
                        {selectedKeys.length ? "카드 제출" : "패스"}
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
                        {card}
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
                                <div className="chat-bubble">{m.content}</div>
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

            {/* ▶ Recover 모달 */}
            <RecoverFromDiscardModal
                isOpen={isRecoverOpen}
                discardPile={discardPile}
                onSelect={handleRecover}
                onClose={closeRecover}
            />
        </div>
    );
};

export default ExplodingKittens;
