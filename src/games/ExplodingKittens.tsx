import React, { useEffect, useRef, useState } from 'react';
import { db } from '../firebase/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import './ExplodingKittens.css';
import ExplodingKittensUtil from "../games/ExplodingKittensUtil";
const {
  initializeGame, // 방 ID 전달
  generateFullDeck,
  shuffle,
  // insertCard, // Removed as it does not exist in ExplodingKittensUtil
  // peekTopCards // Removed as it does not exist in ExplodingKittensUtil
} = ExplodingKittensUtil();

const fullDeck = generateFullDeck();
const shuffledDeck = shuffle(fullDeck);
// const top3 = peekTopCards(shuffledDeck); // Removed as peekTopCards is not defined
// const newDeck = insertCard(shuffledDeck, "Exploding Kitten", 2); // Removed as insertCard is not defined

const players = [
  { uid: 'me', nickname: '나', isMe: true },
  { uid: 'p1', nickname: '플레이어1', isMe: false },
  { uid: 'p2', nickname: '플레이어2', isMe: false },
  { uid: 'p3', nickname: '플레이어3', isMe: false },
  { uid: 'p4', nickname: '플레이어4', isMe: false },
];

const ExplodingKittens: React.FC = () => {
  const tableRef = useRef<HTMLDivElement>(null);
  // const [deck, setDeck] = useState<string[]>([]);
  const [hand, setHand] = useState<string[]>([]);
  // const [currentTurn, setCurrentTurn] = useState(0);

  const gameId = 'sample-game'; // 테스트용 ID

  useEffect(() => {
    // 플레이어 위치 설정
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
        el.style.left = '50%';
        el.style.bottom = '-70px';
        el.style.transform = 'translateX(-50%)';
        el.style.position = 'absolute';
      } else {
        const angle = -Math.PI + ((i - 1) / (rotated.length - 2 || 1)) * Math.PI;
        const x = centerX + radiusX * Math.cos(angle);
        const y = centerY + radiusY * Math.sin(angle);
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.transform = 'translate(-50%, -50%)';
        el.style.position = 'absolute';
      }
    });

    initializeGame("20"); // 방 ID 전달
  }, []);

  useEffect(() => {
    // 게임 초기화 (테스트용 덱 생성)
    const initDeck = async () => {
      const fullDeck = [
        'ExplodingKitten', 'Defuse', 'Attack', 'Skip', 'Shuffle',
        'SeeTheFuture', 'Nope', 'Tacocat', 'HairyPotatoCat'
      ];
      const shuffled = [...fullDeck].sort(() => Math.random() - 0.5);
      await setDoc(doc(db, 'A.games', gameId), {
        deck: shuffled,
        currentTurn: 0,
        hands: {
          me: shuffled.slice(0, 4),
          p1: shuffled.slice(4, 6),
        }
      });
      setHand(shuffled.slice(0, 4));
    };
    initDeck();
  }, []);

  const drawCard = async () => {
    const gameRef = doc(db, 'A.games', gameId);
    const gameSnap = await getDoc(gameRef);
    if (!gameSnap.exists()) return;
    const gameData = gameSnap.data();
    const newDeck = [...gameData.deck];
    const card = newDeck.pop();
    await updateDoc(gameRef, {
      deck: newDeck,
      hands: {
        ...gameData.hands,
        me: [...gameData.hands.me, card],
      }
    });
    setHand([...gameData.hands.me, card]);
  };

  return (
    <div className="table-container" ref={tableRef}>
      <div className="card-slot-area">
        <button onClick={drawCard} style={{ width: '100px', height: '90px' }}>드로우</button>
      </div>

      {players.map((player) => (
        <div
          key={player.uid}
          id={`player-${player.uid}`}
          className={`player-slot ${player.isMe ? 'me' : ''}`}
        >
          {player.nickname}
        </div>
      ))}

      <div style={{ position: 'absolute', left: 20, top: 20, color: 'black',backgroundColor: 'white', padding: '10px', borderRadius: '5px' }}>
        <h4>내 손패:</h4>
        <ul>
          {hand.map((card, idx) => <li key={idx}>{card}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default ExplodingKittens;
