// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { db } from "./firebase";

// const RoomDetail = () => {

//     // 메시지 전송 함수 예시
//     async function sendMessage(roomId: string, currentUser: { uid: any; }, messageText: string) {
//         if (messageText.trim() === "") return;  // 빈 메시지는 무시
//         try {
//           await addDoc(collection(db, "rooms", roomId, "messages"), {
//             text: messageText.trim(),
//             sender: currentUser.uid,
//             timestamp: serverTimestamp()
//           });
//         } catch (error) {
//           console.error("메시지 전송 오류:", error);
//         }
//       }

      

//     return(
//         {
            
//         }

//     )

// }

// export default RoomDetail;