import { useState } from "react";
import "./RoomCreateForm.css";
import Modal from "./Modal";
import ExplodingKittensRoomCreate from '../components/roomCreatelist/ExplodingKittensRoomCreate';
import LexioRoomCreate from '../components/roomCreatelist/LexioRoomCreate';

interface Props {
  currentUser: { uid: string };
  onClose: () => void;
}

const RoomCreateForm = ({ currentUser, onClose }: Props) => {
  const [selectedGame, setSelectedGame] = useState<string>("");

  return (
    <Modal onClose={onClose}>
      <div className="room-create-form">
        {/* 표준 구조로 변경된 라벨+드롭다운 */}
        <div className="game-select-row">
          <label htmlFor="game-select">게임 선택</label>
          <select
            id="game-select"
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="" disabled>게임 선택</option>
            {/* <option value="Lexio">Lexio</option> */}
            <option value="Exploding Kittens">Exploding Kittens</option>
          </select>
        </div>

        {selectedGame === "Lexio" && (
          <LexioRoomCreate />
        )}

        {selectedGame === "Exploding Kittens" && (
          <ExplodingKittensRoomCreate />
        )}
      </div>
    </Modal>
  );
};

export default RoomCreateForm;
