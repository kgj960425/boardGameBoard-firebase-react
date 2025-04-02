// import { addDoc, collection, serverTimestamp } from "firebase/firestore";
// import { db } from "../pages/firebase";
// import React from "react";
// import "./Popup.css";

// interface PopupProps {
//   isOpen: boolean;
//   onClose: () => void;
//   children: React.ReactNode;
// }

// const RoomCreatePopup = ({ isOpen, onClose, children }: PopupProps) => {
//   if (!isOpen) return null;

//   // 방 생성 함수 예시
//   async function createRoom(selectedGame: any, maxPlayers: any, currentUser: { uid: any; }) {
//     try {
//     const docRef = await addDoc(collection(db, "rooms"), {
//         game: selectedGame,             // 선택한 게임 ("Exploding Kittens" 또는 "Lexio")
//         maxPlayers: maxPlayers,         // 최대 플레이어 수 (2~5)
//         players: [currentUser.uid],     // 방 생성자 본인을 players 배열에 추가
//         createdAt: serverTimestamp()    // 생성 시간 (서버 타임스탬프로 설정)
//     });
//     console.log("방 생성 완료:", docRef.id);
//     } catch (e) {
//     console.error("방 생성 중 오류 발생", e);
//     }
// }

//   return (
//     <div className="popup-overlay">
//       <div className="popup-content">
//         <button className="popup-close" onClick={onClose}>✖</button>
//         {children}
//       </div>
//     </div>
//   );
// };

// export default RoomCreatePopup;