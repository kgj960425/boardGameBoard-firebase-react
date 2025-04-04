const mockPlayers = [
    { uid: "1", photoURL: "", displayName: "MafiaKing", ready: true },
    { uid: "2", photoURL: "", displayName: "DealerQueen", ready: false },
    { uid: "3", photoURL: "", displayName: "DealerQueen", ready: false },
    { uid: "4", photoURL: "", displayName: "DealerQueen", ready: false },
  ];
  
  export default function PlayerList() {
    return (
      <div className="player-list">
        {mockPlayers.map((p) => (
          <div key={p.uid} className="player-item">
            <div className="player-photo" />
            <div>
              <div>{p.displayName}</div>
              <div style={{ fontSize: "0.8em", color: p.ready ? "lightgreen" : "tomato" }}>
                {p.ready ? "Ready" : "Not Ready"}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  