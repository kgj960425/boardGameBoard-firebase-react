export default function ChatBox() {
    return (
      <div className="chat-box">
        <div className="chat-messages">
          <div><b>MafiaKing:</b> 준비 완료</div>
          <div><b>DealerQueen:</b> 잠시만요</div>
        </div>
        <div className="chat-input">
          <input placeholder="메시지를 입력하세요" />
          <button>전송</button>
        </div>
      </div>
    );
  }
  