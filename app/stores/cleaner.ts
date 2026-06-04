import { useWalletStore } from './wallet'
import { useLocalStorage } from '~/composables/useLocalStorage'

export interface AssetClassification {
  assetId: string // policyId.assetNameHex
  policyId: string
  assetNameHex: string
  displayName: string
  amount: number
  category: 'trusted' | 'suspicious'
  reason: string
  imageUrl?: string
  phishingUrlShielded: boolean
  originalUrl?: string
}

export const useCleanerStore = defineStore('cleaner', () => {
  const walletStore = useWalletStore()
  
  // Whitelist overrides saved in LocalStorage
  const localWhitelistOverrides = useLocalStorage<string[]>('adasweep-whitelist-overrides', [])

  const isLoadingLiquidity = ref(false)
  const liquidityCache = ref<Record<string, number>>({}) // cached USD liquidity per assetId

  // System hardcoded whitelist/blacklist
  const systemWhitelist = [
    'da86815a519c799545591e0d758c8590ef595303c734b2cfc1b827e8.5370616365436f696e73' // SpaceCoins
  ]

  const systemBlacklist = [
    '112233445566799545591e0d758c8590ef595303c734b2cfc1b827e8.4a756e6b4d656d65' // JunkMeme
  ]

  // Hex to text decoder helper for asset names
  const hexToUtf8 = (hex: string): string => {
    try {
      let str = ''
      for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
      }
      return str
    } catch {
      return hex
    }
  }

  // Parse raw UTXOs into classified asset models
  const classifiedAssets = computed<AssetClassification[]>(() => {
    const assetsMap: Record<string, { amount: number; policyId: string; nameHex: string }> = {}

    // Aggregate assets across all UTXOs
    walletStore.utxos.forEach(utxo => {
      Object.entries(utxo.assets).forEach(([assetId, amount]) => {
        if (!assetsMap[assetId]) {
          const parts = assetId.split('.')
          assetsMap[assetId] = {
            amount: 0,
            policyId: parts[0] || '',
            nameHex: parts[1] || ''
          }
        }
        const assetObj = assetsMap[assetId]
        if (assetObj) {
          assetObj.amount += amount
        }
      })
    })

    return Object.entries(assetsMap).map(([assetId, info]) => {
      const displayName = hexToUtf8(info.nameHex) || 'Unnamed Token'
      
      // Heuristic 1: Local Whitelist Override
      if (localWhitelistOverrides.value.includes(assetId)) {
        return {
          assetId,
          policyId: info.policyId,
          assetNameHex: info.nameHex,
          displayName,
          amount: info.amount,
          category: 'trusted',
          reason: 'User Whitelisted',
          phishingUrlShielded: false
        }
      }

      // Heuristic 2: System Blacklist Check
      if (systemBlacklist.includes(assetId)) {
        return {
          assetId,
          policyId: info.policyId,
          assetNameHex: info.nameHex,
          displayName,
          amount: info.amount,
          category: 'suspicious',
          reason: 'Blacklisted',
          imageUrl: 'https://unsafe-scam-metadata-url.com/phish.jpg',
          originalUrl: 'https://unsafe-scam-metadata-url.com/phish.jpg',
          phishingUrlShielded: true
        }
      }

      // Heuristic 3: System Whitelist Check
      if (systemWhitelist.includes(assetId)) {
        return {
          assetId,
          policyId: info.policyId,
          assetNameHex: info.nameHex,
          displayName,
          amount: info.amount,
          category: 'trusted',
          reason: 'System Whitelisted',
          phishingUrlShielded: false
        }
      }

      // Heuristic 4: DEX Liquidity Check
      const cachedLiquidity = liquidityCache.value[assetId]
      
      // If asset name hex contains "Scam" or "Fake" or "Junk" hex representations
      if (info.nameHex.includes('5363616d') || info.nameHex.includes('46616b65') || info.nameHex.includes('4a756e6b')) {
        return {
          assetId,
          policyId: info.policyId,
          assetNameHex: info.nameHex,
          displayName,
          amount: info.amount,
          category: 'suspicious',
          reason: 'Scam Name Pattern',
          imageUrl: 'https://unsafe-scam-metadata-url.com/nft-phishing.jpg',
          originalUrl: 'https://unsafe-scam-metadata-url.com/nft-phishing.jpg',
          phishingUrlShielded: true
        }
      }

      // Standard Fallback: Check liquidity
      if (cachedLiquidity !== undefined && cachedLiquidity === 0) {
        return {
          assetId,
          policyId: info.policyId,
          assetNameHex: info.nameHex,
          displayName,
          amount: info.amount,
          category: 'suspicious',
          reason: 'No DEX Liquidity',
          imageUrl: 'https://suspicious-token-link.com/scam.png',
          originalUrl: 'https://suspicious-token-link.com/scam.png',
          phishingUrlShielded: true
        }
      }

      return {
        assetId,
        policyId: info.policyId,
        assetNameHex: info.nameHex,
        displayName,
        amount: info.amount,
        category: 'trusted',
          reason: 'Standard Asset',
        phishingUrlShielded: false
      }
    })
  })

  const trustedAssets = computed(() => {
    return classifiedAssets.value.filter(a => a.category === 'trusted')
  })

  const suspiciousAssets = computed(() => {
    return classifiedAssets.value.filter(a => a.category === 'suspicious')
  })

  // Action: Add override whitelist
  const markAsTrusted = (assetId: string) => {
    if (!localWhitelistOverrides.value.includes(assetId)) {
      localWhitelistOverrides.value.push(assetId)
    }
  }

  // Action: Remove override whitelist
  const markAsSuspicious = (assetId: string) => {
    localWhitelistOverrides.value = localWhitelistOverrides.value.filter(id => id !== assetId)
  }

  // Calculate Locked ADA based on UTXO structure
  // In Cardano, each native asset output requires at least ~1.4 - 2.0 ADA depending on asset count
  const lockedAda = computed(() => {
    let sumLovelace = 0
    walletStore.utxos.forEach(utxo => {
      // If a UTXO contains native assets, its base ADA is locked (min-ADA requirement)
      if (Object.keys(utxo.assets).length > 0) {
        sumLovelace += utxo.lovelace
      }
    })
    return (sumLovelace / 1000000)
  })

  const usableAda = computed(() => {
    const totalAda = parseFloat(walletStore.balanceAda)
    return Math.max(0, totalAda - lockedAda.value)
  })

  // Wallet eUTXO Health Score Calculation
  const walletHealthScore = computed(() => {
    if (!walletStore.isConnected || walletStore.utxos.length === 0) return 100

    let score = 100

    // Deduct 1: UTXO Fragmentation penalty
    // Optimal count is under 8 UTXOs for standard consumer wallets.
    const utxoCount = walletStore.totalUtxoCount
    if (utxoCount > 8) {
      score -= (utxoCount - 8) * 1.5
    }

    // Deduct 2: Trapped Liquidity Ratio penalty
    const totalAda = parseFloat(walletStore.balanceAda)
    if (totalAda > 0) {
      const lockedRatio = lockedAda.value / totalAda
      score -= lockedRatio * 40
    }

    // Deduct 3: Suspicious spam asset count penalty
    const spamCount = suspiciousAssets.value.length
    score -= spamCount * 6

    // Clamp score between 0 and 100
    return Math.min(100, Math.max(0, Math.floor(score)))
  })

  // Action: Load dynamic pool checks from DEX API
  const fetchDexLiquidity = async () => {
    if (walletStore.utxos.length === 0) return
    isLoadingLiquidity.value = true

    try {
      // In a real application, we would call:
      // fetch('https://api.minswap.org/v1/pools/...') or similar DEX API
      // Since we want this browser-heavy app to handle timeouts safely:
      await new Promise(resolve => setTimeout(resolve, 800)) // simulated non-blocking fetch

      // Populate mock cache values
      const newCache: Record<string, number> = {}
      classifiedAssets.value.forEach(asset => {
        // Mocking: spacecoins has pool, scam assets do not.
        if (asset.displayName.toLowerCase().includes('space')) {
          newCache[asset.assetId] = 125000 // $125k pool liquidity
        } else if (asset.displayName.toLowerCase().includes('scam') || asset.displayName.toLowerCase().includes('junk')) {
          newCache[asset.assetId] = 0 // $0 pool liquidity
        } else {
          newCache[asset.assetId] = 450 // minor liquidity
        }
      })
      liquidityCache.value = newCache
    } catch (e) {
      console.warn('Error loading DEX liquidity from Minswap API:', e)
    } finally {
      isLoadingLiquidity.value = false
    }
  }

  // Watch for changes in wallet UTXO list to trigger background liquidity fetch
  watch(() => walletStore.utxos, () => {
    fetchDexLiquidity()
  }, { immediate: true, deep: true })

  return {
    localWhitelistOverrides,
    isLoadingLiquidity,
    classifiedAssets,
    trustedAssets,
    suspiciousAssets,
    lockedAda,
    usableAda,
    walletHealthScore,
    markAsTrusted,
    markAsSuspicious,
    fetchDexLiquidity
  }
})
