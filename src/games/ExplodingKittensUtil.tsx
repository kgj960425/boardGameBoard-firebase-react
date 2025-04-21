import {doc, setDoc, getDoc, updateDoc, collection, getDocs} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const generateFullDeck = (): string[] => [
  ...Array(4).fill("Attack"),
  ...Array(4).fill("Skip"),
  ...Array(4).fill("Favor"),
  ...Array(4).fill("Shuffle"),
  ...Array(5).fill("See the Future"),
  ...Array(5).fill("Nope"),
  ...Array(4).fill("Taco Cat"),
  ...Array(4).fill("Hairy Potato Cat"),
  ...Array(4).fill("Rainbow Ralphing Cat"),
  ...Array(4).fill("Cattermelon"),
  ...Array(4).fill("Beard Cat"),
  ...Array(6).fill("Defuse"),
  ...Array(4).fill("Exploding Kitten"),
];

const shuffle = <T,>(array: T[]): T[] =>
  array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

const getPlayerByTurn = (
  turn: number,
  turnOrder: string[],
  deadPlayers: string[] = []
) => {
  const alive = turnOrder.filter(uid => !deadPlayers.includes(uid));
  return alive[turn % alive.length];
};

const initializeGame = async (roomId: string) => {
  const historyDocRef = doc(db, "Rooms", roomId, "history", "00000000");
  const playerCollectionRef = collection(db, "Rooms", roomId, "player");

  const playerSnapshots = await getDocs(playerCollectionRef);
  const players = playerSnapshots.docs.map((doc) => doc.id);
  if (players.length === 0) return;

  const turnOrder = shuffle(players);
  const deck = shuffle(generateFullDeck());

  const playerCards: Record<string, Record<string, string>> = {};
  for (const uid of players) {
    const hand: string[] = [];
    while (hand.length < 7) {
      const card = deck.shift();
      if (card && !["Defuse", "Exploding Kitten"].includes(card)) hand.push(card);
      else deck.push(card!);
    }
    const defuseIdx = deck.findIndex(c => c === "Defuse");
    if (defuseIdx !== -1) hand.push(deck.splice(defuseIdx, 1)[0]);
    playerCards[uid] = {};
    hand.forEach((c, i) => (playerCards[uid][`${i + 1}`] = c));
  }

  const remainingDefuses = deck.filter(c => c === "Defuse").slice(0, 2);
  const kittens = deck.filter(c => c === "Exploding Kitten").slice(0, players.length - 1);
  const finalDeck = shuffle([
    ...deck.filter(c => !["Defuse", "Exploding Kitten"].includes(c)),
    ...remainingDefuses,
    ...kittens,
  ]);

  const gameData = {
    turn: 1,
    turnStart: new Date(),
    turnEnd: null,
    currentPlayer: turnOrder[0],
    nextPlayer: turnOrder[1] ?? null,
    playerCards,
    deck: finalDeck,
    discardPile: [],
    discard: [],
    playedCard: null,
    lastPlayedCard: null,
    turnStack: 0,
    remainingActions: 1,
    deadPlayers: [],
    turnOrder,
    modalRequest: {
      type: null,
      targets: [],
      from: null,
      payload: {},
      createdAt: new Date(),
    },
    explosionEvent: {
      player: null,
      hasDefuse: null,
    },
  };

  await setDoc(historyDocRef, gameData);
};

async function submitCard(
  roomId: string,
  selectedCards: string[],
  gameData: any
): Promise<Record<string, any> | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  //핸드 인증
  const myHand: Record<string, string> = { ...gameData.playerCards[uid] };
  const myCards = Object.values(myHand);
  const isValid = selectedCards.every(card => myCards.includes(card));
  if (!isValid) return null;

  // 카드 제출
  const updatedHand: Record<string, string> = {};
  let removed = 0;
  for (const [key, value] of Object.entries(myHand)) {
    if (selectedCards.includes(value) && removed < selectedCards.length) {
      removed++;
    } else {
      updatedHand[key] = value as string;
    }
  }

  const updatedDiscard = [...(gameData.discard ?? []), ...selectedCards];
  const currentTurnId = gameData.turn.toString().padStart(8, "0");
  const currentTurnRef = doc(db, "Rooms", roomId, "history", currentTurnId);

  await updateDoc(currentTurnRef, {
    playerCards: {
      ...gameData.playerCards,
      [uid]: updatedHand,
    },
    discard: updatedDiscard,
  });

  //모달 요청 처리 
  await triggerModalRequestIfNeeded(roomId, gameData, selectedCards);

  return {
    updatedHand,
    updatedDiscard,
  };
}


async function drawCard(
  roomId: string,
  gameData: any,
  onNeedInsertBomb: (deck: string[], updatedHand: Record<string, string>) => void
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const deck = [...gameData.deck];
  const topCard = deck.shift();
  const myHand = { ...gameData.playerCards[uid] };

  if (!topCard) return;

  // 폭탄 뽑은 경우
  if (topCard === "Exploding Kitten") {
    const defuseEntry = Object.entries(myHand).find(([_, v]) => v === "Defuse");

    if (defuseEntry) {
      const [defuseKey] = defuseEntry;
      delete myHand[defuseKey];
      onNeedInsertBomb(deck, myHand);
      return;
    } else {
      const updatedDead = [...gameData.deadPlayers, uid];
      const updatedOrder = gameData.turnOrder.filter((x: string) => x !== uid);

      await endTurn(
        roomId,
        {
          ...gameData,
          deadPlayers: updatedDead,
          turnOrder: updatedOrder,
        },
        gameData.playerCards,
        deck,
        [],
        gameData.discardPile
      );
      return;
    }
  }

  // 일반 카드 뽑은 경우
  const slot = Date.now().toString();
  myHand[slot] = topCard;

  await endTurn(
    roomId,
    gameData,
    {
      ...gameData.playerCards,
      [uid]: myHand,
    },
    deck,
    [],
    gameData.discardPile
  );
}

/// 모달 요청 처리
/// - Favor: 상대에게 카드 요청
async function triggerModalRequestIfNeeded(
  roomId: string,
  gameData: any,
  selectedCards: string[]
) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const effectCard = selectedCards[0];
  if (!effectCard) return;

  const currentTurnId = gameData.turn.toString().padStart(8, "0");
  const currentTurnRef = doc(db, "Rooms", roomId, "history", currentTurnId);
  const allTargets = Object.keys(gameData.playerCards).filter(id => id !== uid);

  switch (effectCard) {
    case "Favor":
      await updateDoc(currentTurnRef, {
        modalRequest: {
          type: "favor",
          from: uid,
          targets: allTargets,
          createdAt: new Date(),
          payload: {},
        },
      });
      break;

    case "See the Future":
      await updateDoc(currentTurnRef, {
        modalRequest: {
          type: "seeFuture",
          from: uid,
          targets: [uid],
          createdAt: new Date(),
          payload: {
            topCards: gameData.deck.slice(0, 3),
          },
        },
      });
      break;

    case "ChooseCard":
      await updateDoc(currentTurnRef, {
        modalRequest: {
          type: "chooseCard",
          from: uid,
          targets: allTargets,
          createdAt: new Date(),
          payload: {},
        },
      });
      break;

    default: {
      const powerless = [
        "Taco Cat",
        "Hairy Potato Cat",
        "Rainbow Ralphing Cat",
        "Cattermelon",
        "Beard Cat",
      ];
      const uniquePowerless = [...new Set(selectedCards.filter(c => powerless.includes(c)))];

      if (selectedCards.length === 5 && uniquePowerless.length === 5) {
        await updateDoc(currentTurnRef, {
          modalRequest: {
            type: "recover-from-discard",
            from: uid,
            targets: [uid],
            createdAt: new Date(),
            payload: {
              discardPile: gameData.discardPile ?? [],
            },
          },
        });
      }
      break;
    }
  }
}


async function insertBombAt(
  roomId: string,
  nowData: any,
  deck: string[],
  updatedHand: Record<string, string>,
  insertIndex: number
) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const newDeck = [...deck];
  newDeck.splice(insertIndex, 0, "Exploding Kitten");

  const currentTurnId = nowData.turn.toString().padStart(8, "0");
  const nextTurn = nowData.turn + 1;
  const nextTurnId = nextTurn.toString().padStart(8, "0");
  const nextPlayer = getPlayerByTurn(nextTurn, nowData.turnOrder, nowData.deadPlayers);

  await setDoc(doc(db, "Rooms", roomId, "history", currentTurnId), {
    ...nowData,
    historyType: true,
  });

  await endTurn(
    roomId,
    nowData,
    {
      ...nowData.playerCards,
      [uid]: updatedHand,
    },
    newDeck,
    [],
    nowData.discardPile,
  );
}


async function handleFavorSelectedCard(
  roomId: string,
  fromUid: string,
  toUid: string,
  cardKey: string,
  turn: any,
) {
  const ref = doc(db, "Rooms", roomId, "history", turn);
  console.log(ref);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as any;

  const fromHand = { ...data.playerCards[fromUid] };
  const toHand = { ...data.playerCards[toUid] };
  const selectedCard = fromHand[cardKey];
  if (!selectedCard) return;

  delete fromHand[cardKey];
  const newSlot = Date.now().toString();
  toHand[newSlot] = selectedCard;

  await updateDoc(ref, {
    playerCards: {
      ...data.playerCards,
      [fromUid]: fromHand,
      [toUid]: toHand,
    },
  });
}

async function handleRecoverCard(
  roomId: string,
  uid: string,
  selectedCard: string,
  gameData: any
) {
  const turnId = gameData.turn.toString().padStart(8, "0");
  const turnRef = doc(db, "Rooms", roomId, "history", turnId);

  const discardPile = [...gameData.discardPile];
  const cardIndex = discardPile.indexOf(selectedCard);
  if (cardIndex !== -1) discardPile.splice(cardIndex, 1);

  const updatedHand = { ...gameData.playerCards[uid] };
  updatedHand[Date.now().toString()] = selectedCard;

  await updateDoc(turnRef, {
    [`playerCards.${uid}`]: updatedHand,
    discardPile,
    modalRequest: {
      type: null,
      from: null,
      targets: [],
      payload: {},
      createdAt: null,
    },
  });
}

const endTurn = async (
  roomId: string,
  gameData: any,
  updatedPlayerCards: Record<string, Record<string, string>>,
  updatedDeck: string[],
  discard: string[],
  discardPile: string[],
) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const nextTurn = gameData.turn + 1;
  const nextTurnId = nextTurn.toString().padStart(8, "0");
  const nextPlayer = getPlayerByTurn(nextTurn, gameData.turnOrder, gameData.deadPlayers);

  await setDoc(doc(db, "Rooms", roomId, "history", nextTurnId), {
    ...gameData,
    playerCards: updatedPlayerCards,
    deck: updatedDeck,
    discard: [],
    discardPile,
    currentPlayer: gameData.nextPlayer,
    nextPlayer,
    turn: nextTurn,
    turnStart: new Date(),
    turnEnd: null,
    remainingActions: 0,
  });
};

const resolveCardEffect = async (
  roomId: string,
  gameData: any,
  selectedCards: string[]
) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const effectCard = selectedCards[0];
  if (!effectCard) return;

  const currentTurnId = gameData.turn.toString().padStart(8, "0");
  const currentTurnRef = doc(db, "Rooms", roomId, "history", currentTurnId);

  if (["Favor", "Shuffle", "See the Future"].includes(effectCard)) {
    await updateDoc(currentTurnRef, {
      modalRequest: {
        type: effectCard.toLowerCase(),
        from: uid,
        targets: Object.keys(gameData.playerCards).filter((id) => id !== uid),
        createdAt: new Date(),
        payload: {},
      },
    });
    return;
  }

  if (["Attack", "Skip"].includes(effectCard)) {
    await updateDoc(currentTurnRef, {
      nopeQueue: {
        effectCard,
        effectFrom: uid,
        selectedCards,
        createdAt: new Date(),
        expireAt: new Date(Date.now() + 3000),
        resolved: false,
        nopes: [],
      },
    });
    return;
  }

  const powerlessCards = [
    "Taco Cat",
    "Hairy Potato Cat",
    "Rainbow Ralphing Cat",
    "Cattermelon",
    "Beard Cat",
  ];

  const allPowerless = selectedCards.every(card => powerlessCards.includes(card));
  const unique = [...new Set(selectedCards)];

  if (selectedCards.length === 2 && unique.length === 1 && allPowerless) {
    await updateDoc(currentTurnRef, {
      modalRequest: {
        type: "steal-random",
        from: uid,
        targets: Object.keys(gameData.playerCards).filter((id) => id !== uid),
        createdAt: new Date(),
        payload: {},
      },
    });
    return;
  }

  if (selectedCards.length === 3 && unique.length === 1 && allPowerless) {
    await updateDoc(currentTurnRef, {
      modalRequest: {
        type: "steal-specific",
        from: uid,
        targets: Object.keys(gameData.playerCards).filter((id) => id !== uid),
        createdAt: new Date(),
        payload: {},
      },
    });
    return;
  }

  const uniquePowerless = [...new Set(selectedCards.filter(c => powerlessCards.includes(c)))];
  if (selectedCards.length === 5 && uniquePowerless.length === 5) {
    await updateDoc(currentTurnRef, {
      modalRequest: {
        type: "recover-from-discard",
        from: uid,
        targets: [],
        createdAt: new Date(),
        payload: {
          discardPile: gameData.discardPile ?? [],
        },
      },
    });
    return;
  }
};


export {
  generateFullDeck,
  shuffle,
  getPlayerByTurn,
  initializeGame,
  submitCard,
  drawCard,
  endTurn,
  insertBombAt,
  handleRecoverCard,
  handleFavorSelectedCard,
};