import { useState, CSSProperties, useRef } from "react";
import { motion } from "framer-motion";

const CARD_WIDTH = 50;
const CARD_HEIGHT = 75;
const BOARD_WIDTH = 500;
const BOARD_HEIGHT = 400;

const styles: { [key: string]: CSSProperties } = {
  scene: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#2e2e2e",
  },
  board: {
    position: "relative",
    width: `${BOARD_WIDTH}px`,
    height: `${BOARD_HEIGHT}px`,
    backgroundColor: "#3e3e3e",
    borderRadius: "16px",
    perspective: "1000px",
    transform: "rotateX(30deg)",
    transformStyle: "preserve-3d",
    overflow: "hidden",
    marginBottom: "20px",
  },
  card: {
    width: `${CARD_WIDTH}px`,
    height: `${CARD_HEIGHT}px`,
    backgroundColor: "#fff",
    borderRadius: "8px",
    border: "2px solid #000",
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    boxShadow: "2px 2px 10px rgba(0,0,0,0.3)",
    transform: "rotateX(-30deg)",
    touchAction: "none",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#4caf50",
    color: "white",
  },
};

function LandingPage() {
  const boardRef = useRef<HTMLDivElement>(null);

  const [cards, setCards] = useState([
    { id: 1, x: 0, y: 0 },
    { id: 2, x: 0, y: 150 },
  ]);

  const clampPosition = (x: number, y: number) => {
    const clampedX = Math.max(0, Math.min(x, BOARD_WIDTH - CARD_WIDTH));
    const clampedY = Math.max(0, Math.min(y, BOARD_HEIGHT - CARD_HEIGHT));
    return { x: clampedX, y: clampedY };
  };

  const throwCard = () => {
    const randomX = Math.floor(Math.random() * (BOARD_WIDTH - CARD_WIDTH));
    const randomY = Math.floor(Math.random() * (BOARD_HEIGHT - CARD_HEIGHT));

    const card1 = cards[0];
    const collided = Math.abs(card1.x - randomX) < CARD_WIDTH &&
                     Math.abs(card1.y - randomY) < CARD_HEIGHT;

    const newCard2 = collided
      ? {
          ...cards[1],
          x: Math.max(0, Math.min(card1.x - 20, BOARD_WIDTH - CARD_WIDTH)),
          y: cards[1].y,
        }
      : { ...cards[1], x: randomX, y: randomY };

    setCards([card1, newCard2]);
  };

  const handleDrag = (i: number, event: any, info: any) => {
    const boardElement = boardRef.current;
    if (!boardElement || !event?.currentTarget?.getBoundingClientRect) return;
  
    const boardRect = boardElement.getBoundingClientRect();
    const cardRect = event.currentTarget.getBoundingClientRect();
  
    const rawX = cardRect.left - boardRect.left;
    const rawY = cardRect.top - boardRect.top;
    const { x: newX, y: newY } = clampPosition(rawX, rawY);
  
    setCards((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], x: newX, y: newY };
      return updated;
    });
  };
  

  return (
    <div style={styles.scene}>
      <div style={styles.board} ref={boardRef}>
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            style={styles.card}
            animate={{ x: card.x, y: card.y }}
            drag
            dragMomentum={false}
            onDragEnd={(event, info) => handleDrag(i, event, info)}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {card.id === 1 ? "🂡" : "🂱"}
          </motion.div>
        ))}
      </div>
      <button style={styles.button} onClick={throwCard}>Throw Card</button>
    </div>
  );
}

export default LandingPage;
