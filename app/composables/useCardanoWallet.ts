import { ref, onMounted } from 'vue'

declare global {
  interface Window {
    cardano?: any;
  }
}

export interface CardanoWalletInfo {
  name: string
  displayName: string
  icon: string
  apiVersion: string
  isInstalled: boolean
}

export function useCardanoWallet() {
  const installedWallets = ref<CardanoWalletInfo[]>([])
  const isBrowser = typeof window !== 'undefined'

  const scanInstalledWallets = () => {
    if (!isBrowser || !window.cardano) {
      installedWallets.value = []
      return
    }

    const wallets: CardanoWalletInfo[] = []
    const standardWallets = [
      { key: 'nami', display: 'Nami', icon: 'nami' },
      { key: 'eternl', display: 'Eternl', icon: 'eternl' },
      { key: 'lace', display: 'Lace', icon: 'lace' },
      { key: 'vespr', display: 'VESPR', icon: 'vespr' },
      { key: 'flint', display: 'Flint', icon: 'flint' },
      { key: 'yoroi', display: 'Yoroi', icon: 'yoroi' }
    ]

    standardWallets.forEach(wallet => {
      // CIP-30 wallets inject themselves under window.cardano[key]
      const walletObj = (window.cardano as any)?.[wallet.key]
      if (walletObj) {
        wallets.push({
          name: wallet.key,
          displayName: wallet.display,
          icon: walletObj.icon || '',
          apiVersion: walletObj.apiVersion || '',
          isInstalled: true
        })
      }
    })

    // Catch-all for other non-standard CIP-30 wallets
    Object.keys(window.cardano).forEach(key => {
      if (
        !standardWallets.some(w => w.key === key) &&
        typeof (window.cardano as any)[key] === 'object' &&
        (window.cardano as any)[key].enable
      ) {
        const walletObj = (window.cardano as any)[key]
        wallets.push({
          name: key,
          displayName: walletObj.name || key,
          icon: walletObj.icon || '',
          apiVersion: walletObj.apiVersion || '',
          isInstalled: true
        })
      }
    })

    installedWallets.value = wallets
  }

  onMounted(() => {
    // Scan twice to handle laggy injected objects
    scanInstalledWallets()
    setTimeout(scanInstalledWallets, 500)
    setTimeout(scanInstalledWallets, 1200)
  })

  const enableWallet = async (walletName: string) => {
    if (!isBrowser) throw new Error('Wallet connection is only available in the browser.')
    if (!window.cardano || !(window.cardano as any)[walletName]) {
      throw new Error(`Wallet "${walletName}" is not installed.`)
    }

    try {
      const walletApi = await (window.cardano as any)[walletName].enable()
      return walletApi
    } catch (err: any) {
      console.error(`Error enabling wallet ${walletName}:`, err)
      throw new Error(err.message || 'User declined wallet access.')
    }
  }

  return {
    installedWallets,
    enableWallet,
    scanInstalledWallets
  }
}
