import { create } from 'zustand'

const DEFAULT_PARAMS = {
  crop: 'onion',
  seasons: 8,
  rainfall_deviation: 0,
  msp_change: 0,
  demand_shift: 0,
  farmer_mix: { risk_averse: 30, trend_chasing: 50, msp_informed: 20 },
}

export const useSimulationStore = create((set, get) => ({
  params: { ...DEFAULT_PARAMS },
  result: null,
  isLoading: false,
  error: null,

  setParam: (key, value) => set((state) => ({ params: { ...state.params, [key]: value } })),

  setFarmerMix: (mix) => set((state) => ({ params: { ...state.params, farmer_mix: mix } })),

  setResult: (result) => set({ result, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  reset: () => set({ params: { ...DEFAULT_PARAMS }, result: null, error: null }),

  loadDemoScenario: () => set({
    params: {
      crop: 'onion',
      seasons: 8,
      rainfall_deviation: -10,
      msp_change: 15,
      demand_shift: 5,
      farmer_mix: { risk_averse: 30, trend_chasing: 50, msp_informed: 20 },
    },
  }),
}))
