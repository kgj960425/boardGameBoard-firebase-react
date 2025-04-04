import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/firebase";

export interface ChatMessage {
  uid: string;
  nickname: string;
  content: string;
  createTime: Date;
}

// ✅ default export 붙이기
export default function useRoomMessages(messageCollectionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!messageCollectionId) return;

    const q = query(
      collection(db, messageCollectionId),
      orderBy("createTime", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          uid: d.uid,
          nickname: d.nickname || "unknown",
          content: d.content,
          createTime: d.createTime?.toDate?.() || new Date(),
        };
      });

      setMessages(data);
    });

    return () => unsubscribe();
  }, [messageCollectionId]);

  return messages;
}
