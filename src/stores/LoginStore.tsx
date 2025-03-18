import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface LoginStore {
  isLoginValid: boolean;
  actions: {
    setIsLoginValid: (isLoginValid: boolean) => void;
  };
}

export const useLoginStore = create<LoginStore>()(
  immer((set) => ({
    isLoginValid: false,
    actions: {
      setIsLoginValid: (isLoginValid: boolean) => {
        set((state) => {
          state.isLoginValid = isLoginValid;
        });
      },
    },
  })),
);

export const useLoginAction = () => useLoginStore((state) => state.actions);
