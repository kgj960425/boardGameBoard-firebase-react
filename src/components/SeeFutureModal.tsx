import React, { useEffect } from 'react';
import './SeeFutureModal.css';

interface SeeFutureModalProps {
  isOpen: boolean;
  cards: string[];
  duration?: number; // 초 단위, 기본값 10초
  onClose: () => void;
}

const SeeFutureModal: React.FC<SeeFutureModalProps> = ({
  isOpen,
  cards,
  duration = 10,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3 className="modal-title">🔮 덱 상단 3장 보기 🔮</h3>
        <div className="cards-container">
          {cards.map((card, index) => (
            <div key={index} className="card-preview">
              {card}
            </div>
          ))}
        </div>
        <button className="modal-close-btn" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default SeeFutureModal;
