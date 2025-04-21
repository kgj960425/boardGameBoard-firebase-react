import React, { useState } from "react";
import "./FavorModal.css";

interface FavorModalProps {
  isOpen: boolean;
  hand: Record<string, string>;
  onCardSelect: (key: string) => void;
  onClose: () => void;
}

const FavorModal: React.FC<FavorModalProps> = ({ isOpen, hand, onCardSelect, onClose }) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedKey) {
      onCardSelect(selectedKey); // 선택된 카드 슬롯ID 전송
      setSelectedKey(null);
      onClose(); // 모달 닫기
    }
  };

  return (
    <div className="favor-modal-overlay">
      <div className="favor-modal">
        <h2>카드 하나를 선택해 주세요</h2>
        <div className="favor-card-list">
          {Object.entries(hand).map(([key, card]) => (
            <button
              key={key}
              className={`favor-card-button ${selectedKey === key ? "selected" : ""}`}
              onClick={() => setSelectedKey(key)}
            >
              {card}
            </button>
          ))}
        </div>
        <button onClick={handleConfirm} disabled={!selectedKey}>
          선택
        </button>
      </div>
    </div>
  );
};

export default FavorModal;
