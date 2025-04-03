import React, { useEffect, useRef } from 'react';
import './Test.css';

type Player = {
    uid: string;
    nickname: string;
    isMe: boolean;
};

const players: Player[] = [
    { uid: 'me', nickname: '나', isMe: true },
    { uid: 'p1', nickname: '플레이어1', isMe: false },
    { uid: 'p2', nickname: '플레이어2', isMe: false },
    { uid: 'p3', nickname: '플레이어3', isMe: false },
    { uid: 'p4', nickname: '플레이어4', isMe: false },
];

const Test: React.FC = () => {
    const tableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const table = tableRef.current;
        if (!table) return;

        const rect = table.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const radiusX = rect.width / 2 + 10;
        const radiusY = rect.height / 2 + 10;

        const meIndex = players.findIndex((p) => p.isMe);
        const rotated = [...players.slice(meIndex), ...players.slice(0, meIndex)];

        rotated.forEach((player, i) => {
            const el = document.getElementById(`player-${player.uid}`);
            if (!el) return;

            if (i === 0) {
                // me는 아래쪽 중앙에 고정
                el.style.left = '50%';
                el.style.bottom = '-70px';
                el.style.transform = 'translateX(-50%)';
                el.style.position = 'absolute';
            } else {
                // 나머지는 반원 위에 정렬
                const angleStart = -Math.PI; // 왼쪽부터 시작
                const angleRange = Math.PI;  // 반원 (180도)

                const angle = angleStart + ((i - 1) / (rotated.length - 2 || 1)) * angleRange;

                const x = centerX + radiusX * Math.cos(angle);
                const y = centerY + radiusY * Math.sin(angle);

                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
                el.style.transform = 'translate(-50%, -50%)';
                el.style.position = 'absolute';
            }
        });
    }, []);

    return (
        <div className="table-container" ref={tableRef}>
            {/* 중앙 카드 영역 */}
            <div className="card-slot-area">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div className="card-slot" key={i}></div>
                ))}
            </div>

            {/* 플레이어 슬롯 */}
            {players.map((player) => (
                <div
                    key={player.uid}
                    id={`player-${player.uid}`}
                    className={`player-slot ${player.isMe ? 'me' : ''}`}
                    style={
                        player.isMe
                            ? {
                                bottom: '-70px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                position: 'absolute',
                            }
                            : {}
                    }
                >
                    {player.nickname}
                </div>
            ))}
        </div>
    );
};

export default Test;
