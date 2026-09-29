import { createContext, useContext, useState, useEffect } from 'react'

export const COMMODITIES = {
  onion: {
    id: 'onion',
    name: 'Onion',
    emoji: '🧅',
    label: '🧅 Onion',
    hindiName: 'प्याज',
    marathiName: 'कांदा',
    aliases: ['onion', 'pyaaz', 'kanda']
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    emoji: '🍅',
    label: '🍅 Tomato',
    hindiName: 'टमाटर',
    marathiName: 'टोमॅटो',
    aliases: ['tomato', 'tamatar']
  },
  potato: {
    id: 'potato',
    name: 'Potato',
    emoji: '🥔',
    label: '🥔 Potato',
    hindiName: 'आलू',
    marathiName: 'बटाटा',
    aliases: ['potato', 'aaloo', 'batata']
  },
  banana: {
    id: 'banana',
    name: 'Banana',
    emoji: '🍌',
    label: '🍌 Banana',
    hindiName: 'केला',
    marathiName: 'केळी',
    aliases: ['banana', 'kela', 'keli']
  },
  mango: {
    id: 'mango',
    name: 'Mango',
    emoji: '🥭',
    label: '🥭 Mango',
    hindiName: 'आम',
    marathiName: 'आंबा',
    aliases: ['mango', 'aam', 'amba']
  },
  okra: {
    id: 'okra',
    name: 'Okra',
    emoji: '🌱',
    label: '🌱 Okra / Bhindi',
    hindiName: 'भिंडी',
    marathiName: 'भेंडी',
    aliases: ['okra', 'bhindi', 'bhendi']
  },
  chickpea: {
    id: 'chickpea',
    name: 'Chickpea',
    emoji: '🫘',
    label: '🫘 Chickpea / Chana',
    hindiName: 'चना',
    marathiName: 'हरभरा',
    aliases: ['chickpea', 'chana', 'gram', 'harbhara']
  },
  sugarcane: {
    id: 'sugarcane',
    name: 'Sugarcane',
    emoji: '🌾',
    label: '🌾 Sugarcane',
    hindiName: 'गन्ना',
    marathiName: 'ऊस',
    aliases: ['sugarcane', 'ganna', 'us']
  }
}

export const COMMODITY_KEYS = Object.keys(COMMODITIES)

const CommodityContext = createContext(null)

export function CommodityProvider({ children }) {
  const [selectedCommodity, setSelectedCommodityState] = useState(() => {
    try {
      const saved = localStorage.getItem('krishipulse_commodity')
      if (saved && COMMODITIES[saved.toLowerCase()]) {
        return saved.toLowerCase()
      }
    } catch (_) {}
    return 'onion'
  })

  const setSelectedCommodity = (key) => {
    if (!key) return
    const normalizedKey = key.toLowerCase()
    // Match key or alias
    let matchedKey = null
    for (const [k, obj] of Object.entries(COMMODITIES)) {
      if (k === normalizedKey || obj.name.toLowerCase() === normalizedKey || obj.aliases.includes(normalizedKey)) {
        matchedKey = k
        break
      }
    }

    const finalKey = matchedKey || 'onion'
    setSelectedCommodityState(finalKey)
    try {
      localStorage.setItem('krishipulse_commodity', finalKey)
    } catch (_) {}
  }

  const currentCommodityInfo = COMMODITIES[selectedCommodity] || COMMODITIES.onion

  return (
    <CommodityContext.Provider
      value={{
        selectedCommodity,
        setSelectedCommodity,
        commodityInfo: currentCommodityInfo,
        commodities: COMMODITIES,
        commodityKeys: COMMODITY_KEYS,
      }}
    >
      {children}
    </CommodityContext.Provider>
  )
}

export function useCommodity() {
  const context = useContext(CommodityContext)
  if (!context) {
    throw new Error('useCommodity must be used within a CommodityProvider')
  }
  return context
}
