import React from "react";
import "./InsertBombModal.css";

interface InsertBombModalProps {
  isOpen: boolean;
  deck: string[];
  onSelect: (index: number) => void;
}

const InsertBombModal: React.FC<InsertBombModalProps> = ({ isOpen, deck, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="insert-bomb-modal-overlay">
      <div className="insert-bomb-modal">
        <h2>폭탄을 어디에 넣을까요?</h2>
        <div className="bomb-deck-view">
          {deck.map((card, i) => (
            <React.Fragment key={i}>
              <div className="deck-card">{card}</div>
              <div className="insert-slot" onClick={() => onSelect(i)} />
            </React.Fragment>
          ))}
          <div className="insert-slot" onClick={() => onSelect(deck.length)} />
        </div>
      </div>
    </div>
  );
};

export default InsertBombModal;
