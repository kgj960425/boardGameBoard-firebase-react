import {Timestamp} from "firebase/firestore";

export interface historyModel {
    turn: number;
    currentPlayer: string;
    nextPlayer: string;
    turnStart: Timestamp | null;
    turnEnd: Timestamp | null;
    playerCards: Record<string, Record<string, string>>;
    deck: string[];
    discardPile: string[];
    discard: string[];
    playedCard: string | null;
    lastPlayedCard: string | null;
    turnOrder: string[];
    deadPlayers: string[];
    turnStack: number;
    remainingActions: number;
    modalRequest: {
        type: string,
        targets: string[],
        from: string,
        payload: object,
        createdAt: Timestamp
    };
    explosionEvent: {
        player: string,
        hasDefuse: false,
    };
}


type CardType =
    | "Favor"
    | "Shuffle"
    | "SeeFuture"
    | "Attack"
    | "Skip"
    | "Nope"
    | "Defuse"
    | "Taco Cat"
    | "Hairy Potato Cat"
    | "Rainbow Ralphing Cat"
    | "Cattermelon"
    | "Beard Cat";

export interface GameEventModel {
    eventId: string;            // 문서 ID (예: '00000005')
    actionType: CardType;      // ex: 'submit-card'
    actorUid: string;           // 이벤트 발생자 UID
    to?: string;                // 대상 UID (없으면 undefined)
    payload: string[];          // 카드명 배열 등
    createDttm: Timestamp;      // 이벤트 생성 시각
    deadline?: Timestamp;       // Nope 유예 등, 필요할 때만
}

export type RoomState = "waiting" | "playing" | "finished";

export interface RoomDoc {
    createUser: string;
    createdDttm: Timestamp;
    game: string;
    host: string;
    max: number;
    min: number;
    password: string;
    passwordYn: boolean;
    state: RoomState;
    title: string;
    updateDttm: Timestamp | null;
    updateUser: string | null;
}