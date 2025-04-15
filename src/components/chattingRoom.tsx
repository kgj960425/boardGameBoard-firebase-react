import { useEffect, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  addDoc,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import "./ChattingRoom.css";
import { Rnd } from "react-rnd";

interface ChatMessage {
  uid: string;
  nickname: string;
  type: "message" | "emoji";
  content: string;
  createTime: any;
}

interface ChatBoxProps {
  roomId: string;
}

const ChattingRoom = ({ roomId }: ChatBoxProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    if (!roomId) return;

    const q = query(
        collection(db, "Rooms", roomId, "chatting"),
        orderBy("createTime", "desc"),
        limit(50)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const newMessages: ChatMessage[] = snapshot.docs.map((doc) => doc.data() as ChatMessage);
      setMessages(newMessages.reverse());
    });

    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!roomId || !input.trim()) return;
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "Rooms", roomId, "chatting"), {
      uid: user.uid,
      nickname: user.displayName || "익명",
      type: "message",
      content: input.trim(),
      createTime: serverTimestamp(),
    });
    setInput("");
  };

  const chattingContent = (
      <div className={`chatting-room-wrapper ${isOpen ? "open" : "closed"}`}>
        <div className="chatting-room-toggle">
          <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? "-" : "+"}</button>
        </div>
        {isOpen && (
            <>
              <div className="chatting-room-messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chatting-room-message ${msg.uid === auth.currentUser?.uid ? "mine" : "other"}`}
                    >
                      <div className="chatting-room-nickname">{msg.nickname}</div>
                      <div className={`chatting-room-bubble ${msg.uid === auth.currentUser?.uid ? "mine" : "other"}`}>
                        {msg.content}
                      </div>
                    </div>
                ))}
                <div ref={scrollRef}></div>
              </div>
              <div className="chatting-room-input">
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="메시지를 입력하세요"
                />
                <button onClick={sendMessage}>전송</button>
              </div>
            </>
        )}
      </div>
  );

  if (isMobile) {
    return (
        <div
            style={{
              position: "fixed",
              bottom: "10px",
              right: "5%",
              width: "90%",
              height: "60%",
              zIndex: 9999,
            }}
        >
          {chattingContent}
        </div>
    );
  }

  return (
      <Rnd
          default={{
            x: window.innerWidth * 0.55,
            y: window.innerHeight * 0.5,
            width: window.innerWidth * 0.4,
            height: window.innerHeight * 0.4,
          }}
          bounds="window"
          enableResizing={!isMobile}
          dragHandleClassName="chatting-room-toggle"
          className={`chatting-room-wrapper ${isOpen ? "open" : "closed"}`}
      >
        {chattingContent}
      </Rnd>
  );
};

export default ChattingRoom;
