import React from "react";
import "./RecoverFromDiscardModal.css";

interface RecoverFromDiscardModalProps {
  isOpen: boolean;
  discardPile: string[];
  onSelect: (card: string) => void;
  onClose: () => void;
}

const RecoverFromDiscardModal: React.FC<RecoverFromDiscardModalProps> = ({
  isOpen,
  discardPile,
  onSelect,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="recover-modal-overlay">
      <div className="recover-modal">
        <h2>되살릴 카드를 선택하세요</h2>
        <div className="recover-card-list">
          {discardPile.map((card, i) => (
            <button
              key={i}
              className="recover-card"
              onClick={() => onSelect(card)}
            >
              {card}
            </button>
          ))}
        </div>
        <button className="recover-cancel" onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  );
};

export default RecoverFromDiscardModal;
