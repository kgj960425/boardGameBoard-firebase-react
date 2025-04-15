import React, { useState } from 'react';
import './ChooseCardModal.css';

interface ChooseCardModalProps {
  isOpen: boolean;
  targets: { uid: string; nickname: string }[];
  cardOptions: string[];
  onConfirm: (targetUid: string, cardName: string) => void;
  onClose: () => void;
}

const ChooseCardModal: React.FC<ChooseCardModalProps> = ({
  isOpen,
  targets,
  cardOptions,
  onConfirm,
  onClose,
}) => {
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfirmEnabled = selectedUid && selectedCard;

  return (
    <div className="choose-modal-backdrop">
      <div className="choose-modal-content">
        <h3>카드를 뺏을 상대와 카드 종류를 선택하세요</h3>

        <div className="choose-section">
          <p>🎯 대상 선택</p>
          <div className="choose-targets">
            {targets.map((t) => (
              <button
                key={t.uid}
                className={`choose-btn ${selectedUid === t.uid ? 'selected' : ''}`}
                onClick={() => setSelectedUid(t.uid)}
              >
                {t.nickname}
              </button>
            ))}
          </div>
        </div>

        <div className="choose-section">
          <p>🃏 카드 종류</p>
          <div className="choose-options">
            {cardOptions.map((card) => (
              <button
                key={card}
                className={`choose-btn ${selectedCard === card ? 'selected' : ''}`}
                onClick={() => setSelectedCard(card)}
              >
                {card}
              </button>
            ))}
          </div>
        </div>

        <div className="choose-footer">
          <button onClick={onClose} className="choose-cancel">취소</button>
          <button
            disabled={!isConfirmEnabled}
            className="choose-confirm"
            onClick={() => {
              if (selectedUid && selectedCard) {
                onConfirm(selectedUid, selectedCard);
              }
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseCardModal;
