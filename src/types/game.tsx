import { Timestamp } from "firebase/firestore";

export interface PendingEffect {
  createdAt: Timestamp;
  type: string;             // "favor" | "attack" | "skip" | "shuffle" | "seeFuture" | etc.
  from: string;             // 요청/사용자 UID
  to?: string;              // 대상 UID (attack, favor 등 필요시)
  card: string;             // 카드 이름
  topCards?: string[];      // seeFuture 용
}

export interface ModalRequest {
  type: string;             // "favor" | "steal-random" | "recover-from-discard" | etc.
  from: string;             // 요청자 UID
  targets: string[];        // 응답 대상자 UID 리스트
  payload: any;             // 추가 데이터 (e.g. { topCards: [...] } 등)
  createdAt: Timestamp;
}

export interface ExplosionEvent {
  player: string;           // 폭발 대상자 UID
  hasDefuse: boolean;       // 디퓨즈 보유 여부
}

export interface GameData {
  turn: number;
  currentPlayer: string;
  nextPlayer: string | null;
  waitingNope?: boolean;
  nopeDeadline?: Timestamp;
  pendingEffect?: PendingEffect | null;
  turnStart: Timestamp;
  turnEnd?: Timestamp | null;
  playerCards: Record<string, Record<string, string>>;
  deck: string[];
  discard: string[];
  discardPile: string[];
  playedCard: string | null;
  lastPlayedCard: string | null;
  turnOrder: string[];
  deadPlayers: string[];
  turnStack: number;
  remainingActions: number;
  modalRequest?: ModalRequest | null;
  explosionEvent?: ExplosionEvent | null;
}
