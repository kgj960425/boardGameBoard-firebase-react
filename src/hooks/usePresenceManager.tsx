import { useEffect, useRef } from "react";
import {
  getDatabase,
  ref,
  onValue,
  onDisconnect,
  set,
  serverTimestamp,
} from "firebase/database";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const usePresenceManager = () => {
  const db = getDatabase();
  const connectedRef = useRef(ref(db, ".info/connected")); // ✅ 함수 없이 바로 ref
  const userStatusRef = useRef<ReturnType<typeof ref> | null>(null);
  const statusUnsubRef = useRef<() => void>(() => {});

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const uid = user.uid;
      userStatusRef.current = ref(db, `/status/${uid}`);

      const connectedUnsub = onValue(connectedRef.current, async (snap) => {
        const isConnected = snap.val();

        if (!isConnected || !userStatusRef.current) return;

        await onDisconnect(userStatusRef.current).set({
          state: "offline",
          lastChanged: serverTimestamp(),
        });

        await set(userStatusRef.current, {
          state: "online",
          lastChanged: serverTimestamp(),
        });

        statusUnsubRef.current = onValue(userStatusRef.current, (snap) => {
          const data = snap.val();
          if (data?.state === "offline") {
            signOut(auth);
          }
        });
      });

      return () => {
        connectedUnsub();
        statusUnsubRef.current?.();
        if (userStatusRef.current) {
          set(userStatusRef.current, {
            state: "offline",
            lastChanged: serverTimestamp(),
          });
        }
      };
    });

    return () => unsubscribe();
  }, []);

};

export default usePresenceManager;
