import { useEffect, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "../pages/firebase";
import "./ChattingRoom.css";

interface ChatMessage {
  uid: string;
  nickname: string;
  type: "message" | "emoji";
  content: string;
  createTime: any;
}

interface ChatBoxProps {
  roomId: string;
  currentUser: { uid: string; nickname: string };
}

const ChattingRoom = ({ roomId, currentUser }: ChatBoxProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [messageCollectionId, setMessageCollectionId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [latestId, setLatestId] = useState(0);

  useEffect(() => {
    const fetchMessageCollectionId = async () => {
      const roomDoc = await getDoc(doc(db, "A.rooms", roomId));
      const data = roomDoc.data();
      if (data?.messages) setMessageCollectionId(data.messages);
    };
    fetchMessageCollectionId();
  }, [roomId]);

  const subscribeToMessages = () => {
    const modified = "m" + roomId.slice(1);
    const messageQuery = query(
      collection(db, modified),
      orderBy("createTime", "desc"),
      limit(100)
    );

    return onSnapshot(messageQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        uid: doc.data().uid,
        nickname: doc.data().nickname || "이름없는놈",
        type: doc.data().type || "message",
        content: doc.data().content,
        createTime: doc.data().createTime?.toDate?.() || new Date(),
      }));

      setMessages(msgs.reverse());

      const latest = snapshot.docs
        .map(doc => doc.id)
        .filter(id => id.startsWith("msg^"))
        .map(id => parseInt(id.replace("msg^", ""), 10))
        .filter(num => !isNaN(num))
        .sort((a, b) => b - a)[0] || 0;

      setLatestId(latest);
    });
  };

  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = subscribeToMessages();
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    const isMine = lastMessage.uid === currentUser.uid;
    if (isMine) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentUser.uid]);

  const sendMessage = async () => {
    if (!input.trim() || !messageCollectionId) return;

    const newIdString = (latestId + 1).toString().padStart(5, "0");
    const newDocId = `msg^${newIdString}`;

    try {
      await setDoc(doc(db, messageCollectionId, newDocId), {
        uid: currentUser.uid,
        nickname: currentUser.nickname,
        type: "message",
        content: input,
        createTime: serverTimestamp(),
      });
      setInput("");
    } catch (error) {
      console.error("메시지 전송 오류:", error);
    }
  };

  return (
    <div className={`chatting-room-wrapper`}>
      <div className="chatting-room-toggle">
        <button onClick={() => setIsOpen(!isOpen)}>⛶</button>
      </div>

      {isOpen && (
        <div className="chatting-room-messages">
          {messages.map((msg, idx) => {
            const isMine = msg.uid === currentUser.uid;
            return (
              <div
                key={idx}
                className={`chatting-room-message ${isMine ? "mine" : "other"}`}
              >
                {!isMine && (
                  <div className="chatting-room-nickname">{msg.nickname}</div>
                )}
                <div className={`chatting-room-bubble ${isMine ? "mine" : "other"}`}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
    )}

      {isOpen && (
        <div className="chatting-room-input">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                if (!isOpen) {
                  setIsOpen(true);
                  setTimeout(() => inputRef.current?.focus(), 100);
                } else {
                  sendMessage();
                }
              }
            }}
            placeholder="메시지를 입력하세요."
          />
          <button onClick={sendMessage}>전송</button>
        </div>
      )}
    </div>
  );
};

export default ChattingRoom;
