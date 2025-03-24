import React, { useEffect, useState } from 'react';
import { arrayUnion, doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../pages/firebase'; // Firebase 초기화 설정 파일

interface LexioProps {
  roomId: string;
}

interface GameState {
    currentTurn: number;
    currentPlayer: string;
    // Add other properties of gameState as needed
}

function Lexio({ roomId }: LexioProps) {

  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    // 특정 방의 도큐먼트를 구독합니다.
    const roomDocRef = doc(db, "A.rooms", roomId);
    const unsubscribe = onSnapshot(roomDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Lexio 게임만 처리하도록 조건 검사
        if (data.game === "Lexio") {
          setGameState(data.gameState);
        }
      }
    }, (error) => {
      console.error("실시간 업데이트 오류:", error);
    });

    return () => unsubscribe(); // 컴포넌트 언마운트 시 리스너 해제
  }, [roomId]);

  // 예시 액션: 현재 턴을 증가시키는 함수
  const handlePlayerAction = async () => {
    if (!gameState) return;
    try {
      const roomDocRef = doc(db, "rooms", roomId);
      // 간단히 현재 턴 수를 증가시키는 예시
      const newTurn = (gameState.currentTurn || 0) + 1;
      await updateDoc(roomDocRef, {
        "gameState.currentTurn": newTurn,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("게임 상태 업데이트 오류:", error);
    }
  };

  if (!gameState) {
    return <div>Lexio 게임 상태를 불러오는 중...</div>;
  }

  return (
    <div>
      <h2>Lexio 게임 진행</h2>
      <p>현재 턴: {gameState.currentTurn}</p>
      <p>현재 플레이어: {gameState.currentPlayer}</p>
      {/* 추가적인 게임 상태 정보를 렌더링할 수 있습니다. */}
      <button onClick={handlePlayerAction}>턴 완료</button>
    </div>
  );
}

export default Lexio;
// export


// 무작위 알파벳 생성 함수 (예: 5글자)
function generateRandomLetters(count = 5) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let letters = [];
  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * alphabet.length);
    letters.push(alphabet[index]);
  }
  return letters;
}

function LexioGame({ roomId, currentUser }: { roomId: string; currentUser: { uid: string } }) {
  const [gameState, setGameState] = useState<{
    scores: Record<string, number>;
    letters: string[];
    submittedAnswers: { playerId: string; answer: string }[];
    gamePhase: string;
    round: number;
  } | null>(null);
  const [playerAnswer, setPlayerAnswer] = useState("");

  // Firestore에서 실시간으로 해당 방의 Lexio 게임 상태를 구독
  useEffect(() => {
    const roomDocRef = doc(db, "rooms", roomId);
    const unsubscribe = onSnapshot(
      roomDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // 해당 방이 Lexio 게임임을 확인
          if (data.game === "Lexio") {
            setGameState(data.gameState);
          }
        }
      },
      (error) => {
        console.error("실시간 업데이트 오류:", error);
      }
    );
    return () => unsubscribe();
  }, [roomId]);

  // 플레이어의 답안을 제출하는 함수
  const submitAnswer = async () => {
    if (!playerAnswer.trim()) return;
    try {
      const roomDocRef = doc(db, "rooms", roomId);
      await updateDoc(roomDocRef, {
        "gameState.submittedAnswers": arrayUnion({
          playerId: currentUser.uid,
          answer: playerAnswer.trim(),
          submittedAt: serverTimestamp()
        })
      });
      setPlayerAnswer("");
    } catch (error) {
      console.error("답안 제출 오류:", error);
    }
  };

  // 제출된 답안을 채점하는 함수  
  // (여기서는 단순히 답안이 사용 가능한 글자들로만 구성되어 있다면 단어 길이만큼 점수를 부여하는 예시입니다)
  const scoreAnswers = async () => {
    try {
      const roomDocRef = doc(db, "rooms", roomId);
      if (!gameState) return;
      let newScores = { ...gameState.scores };
      const availableLetters = gameState.letters;

      // 답안의 유효성을 검사하는 함수
      const isValidAnswer = (answer: string) => {
        // availableLetters 배열의 복사본에서 하나씩 제거하며 검사
        let lettersCopy = [...availableLetters];
        for (const char of answer.toUpperCase()) {
          const index = lettersCopy.indexOf(char);
          if (index === -1) {
            return false;
          }
          lettersCopy.splice(index, 1);
        }
        return true;
      };

      // 제출된 답안 목록에 대해 채점
      gameState.submittedAnswers.forEach((submission) => {
        const answer = submission.answer;
        const valid = isValidAnswer(answer);
        let score = 0;
        if (valid) {
          // 단어 길이를 점수로 부여 (필요에 따라 점수 계산 로직 수정 가능)
          score = answer.length;
        }
        newScores[submission.playerId] = (newScores[submission.playerId] || 0) + score;
      });

      // 채점 후 gamePhase를 "scoring"으로 업데이트
      await updateDoc(roomDocRef, {
        "gameState.scores": newScores,
        "gameState.gamePhase": "scoring",
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("점수 계산 오류:", error);
    }
  };

  // 새 라운드를 시작하는 함수 (호스트 전용)
  const startNewRound = async () => {
    try {
      const roomDocRef = doc(db, "rooms", roomId);
      const newLetters = generateRandomLetters(5);
      await updateDoc(roomDocRef, {
        "gameState": {
          ...gameState,
          round: (gameState?.round || 0) + 1,
          letters: newLetters,
          submittedAnswers: [],
          gamePhase: "playing"
        },
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("새 라운드 시작 오류:", error);
    }
  };

  if (!gameState) {
    return <div>Lexio 게임 상태를 불러오는 중...</div>;
  }

  return (
    <div>
      <h2>Lexio 게임 - 라운드 {gameState.round}</h2>
      <div>
        <p>현재 단계: {gameState.gamePhase}</p>
        <p>사용 가능한 글자: {gameState.letters && gameState.letters.join(", ")}</p>
      </div>

      {gameState.gamePhase === "playing" && (
        <div>
          <input
            type="text"
            value={playerAnswer}
            onChange={(e) => setPlayerAnswer(e.target.value)}
            placeholder="답안을 입력하세요"
          />
          <button onClick={submitAnswer}>답안 제출</button>
        </div>
      )}

      {gameState.gamePhase === "scoring" && (
        <div>
          <h3>점수 현황</h3>
          {gameState.scores &&
            Object.entries(gameState.scores).map(([playerId, score]) => (
              <p key={playerId}>
                {playerId}: {score}점
              </p>
            ))}
        </div>
      )}

      {/* 호스트(예: currentUser.uid가 "host"인 경우)가 라운드 종료 및 새 라운드 시작 제어 */}
      {currentUser.uid === "host" && gameState.gamePhase === "playing" && (
        <button onClick={scoreAnswers}>라운드 종료 및 점수 계산</button>
      )}
      {currentUser.uid === "host" && gameState.gamePhase === "scoring" && (
        <button onClick={startNewRound}>새 라운드 시작</button>
      )}

      <div>
        <h3>제출된 답안</h3>
        <ul>
          {gameState.submittedAnswers &&
            gameState.submittedAnswers.map((submission, index) => (
              <li key={index}>
                {submission.playerId}: {submission.answer}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
