import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

export default function useSendMessage(messageCollectionId: string | null) {
  const sendMessage = async (content: string) => {
    if (!messageCollectionId || !auth.currentUser?.uid || !content.trim()) return;

    try {
      await addDoc(collection(db, messageCollectionId), {
        uid: auth.currentUser.uid,
        nickname: auth.currentUser.displayName || "익명",
        content,
        createTime: serverTimestamp(),
      });
    } catch (error) {
      console.error("채팅 전송 실패:", error);
    }
  };

  return sendMessage;
}
