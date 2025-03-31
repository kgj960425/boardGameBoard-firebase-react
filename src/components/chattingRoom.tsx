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
  
    // query로 감싸고 limit 및 orderBy 적용
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
  
      setMessages(msgs.reverse()); // 최신순으로 가져오니까 화면 출력용으로는 역순 처리
  
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
    <div style={{
      position: "absolute",
      bottom: 20,
      right: 20,
      width: isOpen ? 300 : 35,
      height: isOpen ? 350 : 35,
      backgroundColor: "rgba(255, 255, 255, 0.85)", // 반투명
      zIndex: 9999, // 위에 떠있게
      border: "1px solid #ccc",
      borderRadius: 8,
      display: "flex",
      flexDirection: "column",
      fontSize: 14,
      overflow: "hidden",
      transition: "all 0.3s ease-in-out"
    }}>
      {/* 토글 버튼 */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        padding: "4px 6px",
        backgroundColor: "#f9f9f9",
        borderBottom: "1px solid #ddd"
      }}>
        <button onClick={() => setIsOpen(!isOpen)} style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          fontSize: 16
        }}>
          {isOpen ? "⛶" : "⛶"}
        </button>
      </div>

      {/* 채팅 내용 */}
      {isOpen && (
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 10px" }}>
          {messages.map((msg, idx) => {
            const isMine = msg.uid === currentUser.uid;
            const isMessageType = msg.type === "message";

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: isMine ? "flex-end" : "flex-start",
                  marginBottom: 6,
                  flexDirection: "column",
                  alignItems: isMine ? "flex-end" : "flex-start",
                }}
              >
                {!isMine && isMessageType && (
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>
                    {msg.nickname}
                  </div>
                )}
                <div
                  style={{
                    backgroundColor: isMine ? "#fff3b0" : "#f0f0f0",
                    padding: "8px 12px",
                    borderRadius: 16,
                    maxWidth: "75%",
                    wordBreak: "break-word"
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      )}

      {/* 입력창 */}
      {isOpen && (
        <div style={{ display: "flex", borderTop: "1px solid #eee" }}>
          <input
            ref={inputRef}
            style={{ flex: 1, border: "none", padding: 8 }}
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
          <button onClick={sendMessage} style={{ padding: "8px 12px" }}>전송</button>
        </div>
      )}
    </div>
  );
};

export default ChattingRoom;
