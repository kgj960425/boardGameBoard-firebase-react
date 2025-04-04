import "./GameSettingPanels.css";

export default function GameSettingPanel() {
  return (
    <div className="game-setting">
      <h3 className="title">🎲 게임 설정</h3>
      <p>게임 종류: 렉시오</p>
      <p>제한 시간: 30초</p>
      <p>최대 인원: 5명</p>
    </div>
  );
}
