import { useNavigate } from "react-router-dom";
import "./CreateRoomModal.css";
import Modal from 'react-modal';
Modal.setAppElement('#root'); // 접근성 설정 필수

interface RoomCreateModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const RoomCreateModal = ({ isOpen, onRequestClose }: RoomCreateModalProps) => {
  const navigate = useNavigate();

  const handleCreate = () => {
    const roomId = 'abc123'; // 생성된 방 ID라고 가정
    navigate(`/room/${roomId}`);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <button className="modal-close-button" onClick={onRequestClose}>
        ✕
      </button>
      <h2 className="modal-title">방 만들기</h2>
      <button className="create-button" onClick={handleCreate}>
        생성
      </button>
      
    </Modal>
  );
};

export default RoomCreateModal;