import React from "react";
import "./FavorModal.css";

interface FavorModalProps {
  isOpen: boolean;
  hand: Record<string, string>; // key: slotId, value: card name
  onCardSelect: (key: string) => void;
}

const FavorModal: React.FC<FavorModalProps> = ({ isOpen, hand, onCardSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="favor-modal-overlay">
      <div className="favor-modal">
        <h2>카드 하나를 선택해 주세요</h2>
        <div className="favor-card-list">
          {Object.entries(hand).map(([key, card]) => (
            <button
              key={key}
              className="favor-card-button"
              onClick={() => onCardSelect(key)}
            >
              {card}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavorModal;
