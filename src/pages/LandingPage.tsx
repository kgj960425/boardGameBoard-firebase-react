

// 이미지 자동 import용 helper (Vite 환경 기준)
const importAllImages = () => {
    const context = import.meta.glob('../assets/images/*.{jpg,png}', { eager: true });
  
    const cardImages: { [key: string]: string } = {};
    for (const path in context) {
      const fileName = path.split('/').pop()?.replace(/\.(jpg|png)$/, '');
      if (fileName) {
        cardImages[fileName] = (context[path] as { default: string }).default;
      }
    }
    return cardImages;
  };
  
  // 카드 생성용
  const generateDeck = (images: { [key: string]: string }) => {
    const deck = Object.entries(images).map(([name, url]) => {
      const match = name.match(/(Red|Blue|Green|Yellow)(\d+)/);
      if (!match) return null;
      const [, color, number] = match;
      return {
        id: name,
        color,
        number: Number(number),
        image: url
      };
    });
    return deck.filter(Boolean);
  };
  
  // Main React Component
  import { useState } from 'react';
  
  export default function LectioGame() {
    const [players, setPlayers] = useState(0);
    // const [setDeck] = useState<any[]>([]);
    const [playerHands, setPlayerHands] = useState<any[][]>([]);
    const [started, setStarted] = useState(false);
  
    const images = importAllImages();
  
    const startGame = (playerCount: number) => {
      const fullDeck = generateDeck(images);
      const shuffled = fullDeck.sort(() => Math.random() - 0.5);
      const hands: any[][] = Array.from({ length: playerCount }, () => []);
      let cardIndex = 0;
      while (cardIndex < shuffled.length) {
        for (let i = 0; i < playerCount && cardIndex < shuffled.length; i++) {
          hands[i].push(shuffled[cardIndex++]);
        }
      }
      setPlayerHands(hands);
      //setDeck(shuffled);
      setPlayers(playerCount);
      setStarted(true);
    };
  
    if (!started) {
      return (
        <div className="p-4 text-center">
          <h1 className="text-2xl mb-4">Lectio Multi Game</h1>
          <p className="mb-2">참가 인원을 선택하세요 (2~5명):</p>
          {[2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => startGame(n)} className="m-2 p-2 bg-blue-500 text-white rounded">
              {n}명 시작
            </button>
          ))}
        </div>
      );
    }
  
    return (
      <div className="p-4">
        <h2 className="text-xl mb-4">게임 시작! 총 {players}명</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playerHands.map((hand, idx) => (
            <div key={idx} className="border p-2 rounded shadow">
              <h3 className="font-bold mb-2">플레이어 {idx + 1}</h3>
              <div className="flex flex-wrap gap-1">
                {hand.map((card, i) => (
                  <img
                    key={i}
                    src={card.image}
                    alt={`${card.color} ${card.number}`}
                    className="w-12 h-18 object-cover"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  