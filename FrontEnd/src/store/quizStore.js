import { create } from 'zustand'

const useQuizStore = create((set) => ({
  score: 0,
  increaseScore: () => set((state) => ({ score: state.score + 1 })),
  resetScore: () => set({ score: 0 }),
}))

export default useQuizStore

    // pages/
    // layouts/
    // router/
    // store/
    // services/
    // hooks/
    // utils/
    // data/
    // styles/