import type { UTXO } from "~/utils/transactionBatcher";

declare global {
  interface Window {
    cardano?: any;
  }
}

export const useWalletStore = defineStore("wallet", () => {
  const isConnected = ref(false);
  const isConnecting = ref(false);
  const walletName = ref("");
  const walletAddress = ref("");
  const networkId = ref<number | null>(null);
  const error = ref<string | null>(null);
  const isDemoMode = ref(false);
  const showConnectionModal = ref(false);
  const isSessionChecked = ref(false);

  // Network selection state: 'mainnet' | 'preprod' (Mainnet is disabled)
  const selectedNetwork = ref<'mainnet' | 'preprod'>('preprod');

  const setNetwork = (network: 'mainnet' | 'preprod') => {
    if (network === 'mainnet') {
      console.warn("Cardano Mainnet is currently disabled.");
      return;
    }
    selectedNetwork.value = network;
    if (typeof window !== "undefined") {
      localStorage.setItem("adasweep-network", network);
    }
  };

  const initNetwork = () => {
    selectedNetwork.value = 'preprod';
    if (typeof window !== "undefined") {
      localStorage.setItem("adasweep-network", "preprod");
      
      const savedSession = sessionStorage.getItem("adasweep-session-wallet");
      if (!savedSession) {
        isSessionChecked.value = true;
      }
    } else {
      isSessionChecked.value = true;
    }
  };

  const networkMismatch = computed(() => {
    if (!isConnected.value || networkId.value === null || !selectedNetwork.value) {
      return false;
    }
    const isWalletMainnet = networkId.value === 1;
    const isAppMainnet = selectedNetwork.value === 'mainnet';
    return isWalletMainnet !== isAppMainnet;
  });

  // RAW UTXO List
  const utxos = ref<UTXO[]>([]);

  // CIP-30 active API handle
  const walletApi = ref<any>(null);

  // Computed State
  const balanceLovelace = computed(() => {
    return utxos.value.reduce((sum, utxo) => sum + utxo.lovelace, 0);
  });

  const balanceAda = computed(() => {
    return (balanceLovelace.value / 1000000).toFixed(2);
  });

  const totalUtxoCount = computed(() => utxos.value.length);

  // Mock UTXOs for Demo Mode
  const getMockUtxos = (): UTXO[] => {
    const isMainnet = selectedNetwork.value === 'mainnet';
    const address = isMainnet
      ? "addr1qy78y9zv9g5k27xpfl9wsmph938l2s7l7rshq8f0mkh2wvyvquglqqqqgqys59g27e"
      : "addr_test1qr78y9zv9g5k27xpfl9wsmph938l2s7l7rshq8f0mkh2wvyvquglqqqqgqyrglry";

    return [
      {
        txHash:
          "a5c0b11e2f7b49463e80829bc1e88863f683a54b9f291079d863f733f38012ef",
        index: 0,
        address,
        lovelace: 250000000, // 250 ADA
        assets: {},
      },
      {
        txHash:
          "b7c0b11e2f7b49463e80829bc1e88863f683a54b9f291079d863f733f38013ef",
        index: 1,
        address,
        lovelace: 100000000, // 100 ADA
        assets: {},
      },
      {
        txHash:
          "e1d1e44f8a3d59463e80829bc1e88863f683a54b9f291079d863f733f38014ab",
        index: 0,
        address,
        lovelace: 50500000, // 50.5 ADA
        assets: {},
      },
      {
        txHash:
          "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        index: 0,
        address,
        lovelace: 1800000, // 1.8 ADA
        assets: {
          "da86815a519c799545591e0d758c8590ef595303c734b2cfc1b827e8.5370616365436f696e73": 5000, // Whitelisted SpaceCoins
        },
      },
      {
        txHash:
          "c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8",
        index: 3,
        address,
        lovelace: 1500000, // 1.5 ADA
        assets: {
          "7492c1ad3b5c799545591e0d758c8590ef595303c734b2cfc1b827e8.5363616d546f6b656e41": 1000000, // ScamTokenA
        },
      },
      {
        txHash:
          "f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2",
        index: 2,
        address,
        lovelace: 1300000, // 1.3 ADA
        assets: {
          "a1b2c3d4e5f6799545591e0d758c8590ef595303c734b2cfc1b827e8.46616b6541697264726f70": 1, // FakeAirdropNFT
        },
      },
      {
        txHash:
          "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
        index: 1,
        address,
        lovelace: 900000, // 0.9 ADA (Dust)
        assets: {},
      },
      {
        txHash:
          "1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b",
        index: 0,
        address,
        lovelace: 1200000, // 1.2 ADA (Dust)
        assets: {},
      },
      {
        txHash:
          "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
        index: 4,
        address,
        lovelace: 1700000, // 1.7 ADA
        assets: {
          "da86815a519c799545591e0d758c8590ef595303c734b2cfc1b827e8.5370616365436f696e73": 2000, // SpaceCoins
        },
      },
      {
        txHash:
          "5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d",
        index: 0,
        address,
        lovelace: 1600000, // 1.6 ADA
        assets: {
          "112233445566799545591e0d758c8590ef595303c734b2cfc1b827e8.4a756e6b4d656d65": 42000000, // JunkMeme
        },
      },
    ];
  };

  // Browser-safe WASM loader (prevents server-side loading crashes)
  let loadedWasm: any = null;
  const loadWasm = async () => {
    if (loadedWasm) return loadedWasm;
    if (typeof window !== "undefined") {
      const m = await import("@hydra-sdk/cardano-wasm");
      loadedWasm = m.CardanoWASM;
      return loadedWasm;
    }
    throw new Error("WASM can only be loaded in a browser context.");
  };

  // Hex helpers
  const toHex = (bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const fromHex = (hex: string): Uint8Array => {
    return new Uint8Array(
      hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
    );
  };

  // Connect Wallet Action
  const connectWallet = async (name: string) => {
    isConnecting.value = true;
    error.value = null;
    isDemoMode.value = false;

    try {
      // Check browser environments
      if (typeof window === "undefined" || !window.cardano) {
        throw new Error(
          "No Cardano extension wallets injected in this browser.",
        );
      }

      const walletObject = (window.cardano as any)[name];
      if (!walletObject) {
        throw new Error(`Wallet extension ${name} is not installed.`);
      }

      // CIP-30 Enable
      const api = await walletObject.enable();
      walletApi.value = api;
      walletName.value = name;

      // Dynamically load browser cardano serialization WASM bindings
      const wasm = await loadWasm();

      // Get current network: 0 = Testnet, 1 = Mainnet
      networkId.value = await api.getNetworkId();

      if (networkId.value === 1) {
        throw new Error("Cardano Mainnet is currently disabled. Please switch your wallet to Preprod testnet.");
      }

      setNetwork('preprod');

      // Fetch Address (Standard unused or change address)
      const changeAddrHex = await api.getChangeAddress();
      walletAddress.value = decodeAddress(changeAddrHex, wasm);

      isConnected.value = true;

      // Save to sessionStorage for page-refresh auto-connection
      if (typeof window !== "undefined") {
        sessionStorage.setItem("adasweep-session-wallet", name);
      }

      // Fetch Real UTXOs
      await fetchUtxos();
    } catch (err: any) {
      console.error(err);
      error.value = err.message || "Failed to connect wallet.";
      isConnected.value = false;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("adasweep-session-wallet");
      }
    } finally {
      isConnecting.value = false;
    }
  };

  // Disconnect Wallet Action
  const disconnectWallet = () => {
    isConnected.value = false;
    walletName.value = "";
    walletAddress.value = "";
    networkId.value = null;
    utxos.value = [];
    walletApi.value = null;
    error.value = null;
    isDemoMode.value = false;

    // Clear session storage
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("adasweep-session-wallet");
    }
  };

  // Session-based auto-reconnect action
  const tryAutoConnect = async () => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("adasweep-session-wallet");
      if (saved) {
        if (!isConnected.value && !isConnecting.value) {
          try {
            await connectWallet(saved);
          } catch (e) {
            console.error("Auto connect failed:", e);
          } finally {
            isSessionChecked.value = true;
          }
        } else {
          isSessionChecked.value = true;
        }
      } else {
        isSessionChecked.value = true;
      }
    } else {
      isSessionChecked.value = true;
    }
  };

  // Fetch UTXOs from wallet API
  const fetchUtxos = async () => {
    if (!walletApi.value) return;

    try {
      error.value = null;
      // Get UTXOs (returns array of CBOR hex strings)
      const rawHexUtxos: string[] | null = await walletApi.value.getUtxos();
      if (!rawHexUtxos || rawHexUtxos.length === 0) {
        // Fallback seed for testing if real wallet is empty
        utxos.value = getMockUtxos();
        return;
      }

      const parsedUtxos: UTXO[] = [];
      const wasm = await loadWasm();

      for (const hex of rawHexUtxos) {
        try {
          const parsed = parseCBORUtxo(hex, wasm);
          if (parsed) {
            parsedUtxos.push(parsed);
          }
        } catch (e) {
          console.error("Error parsing UTXO CBOR:", e);
        }
      }

      utxos.value = parsedUtxos;
    } catch (err: any) {
      console.error("Error fetching UTXOs:", err);
      error.value = err.message || "Failed to fetch wallet UTXOs.";
    }
  };

  // Address hex decoder helper (CIP-30 is hex format, returns standard addr1...)
  const decodeAddress = (hexAddr: string, wasm: any): string => {
    try {
      const addr = wasm.Address.from_bytes(fromHex(hexAddr));
      return addr.to_bech32();
    } catch (e) {
      console.error("Error decoding address:", e);
      return hexAddr;
    }
  };

  // Pure Client-side CBOR UTXO parser fallback
  const parseCBORUtxo = (cborHex: string, wasm: any): UTXO | null => {
    try {
      // Decode CBOR bytes of TransactionUnspentOutput using Emurgo CSL WASM
      const utxo = wasm.TransactionUnspentOutput.from_bytes(fromHex(cborHex));

      const input = utxo.input();
      const txHash = toHex(input.transaction_id().to_bytes());
      const index = input.index();

      const output = utxo.output();
      const address = output.address().to_bech32();

      const amount = output.amount();
      const lovelace = parseInt(amount.coin().to_str());

      const assets: Record<string, number> = {};
      const multiasset = amount.multiasset();

      if (multiasset) {
        const policyIds = multiasset.keys();
        for (let i = 0; i < policyIds.len(); i++) {
          const policyId = policyIds.get(i);
          const policyIdHex = toHex(policyId.to_bytes());

          const assetMap = multiasset.get(policyId);
          if (assetMap) {
            const assetNames = assetMap.keys();
            for (let j = 0; j < assetNames.len(); j++) {
              const assetName = assetNames.get(j);
              const assetNameHex = toHex(assetName.name());
              const quantity = parseInt(assetMap.get(assetName).to_str());

              const assetId = `${policyIdHex}.${assetNameHex}`;
              assets[assetId] = quantity;
            }
          }
        }
      }

      return {
        txHash,
        index,
        address,
        lovelace,
        assets,
      };
    } catch (e) {
      console.error("Error decoding UTXO in WASM:", e);
      return null;
    }
  };

  return {
    isConnected,
    isConnecting,
    walletName,
    walletAddress,
    networkId,
    error,
    isDemoMode,
    showConnectionModal,
    isSessionChecked,
    selectedNetwork,
    setNetwork,
    initNetwork,
    networkMismatch,
    utxos,
    walletApi,
    balanceLovelace,
    balanceAda,
    totalUtxoCount,
    connectWallet,
    disconnectWallet,
    tryAutoConnect,
    fetchUtxos,
    loadWasm,
    toHex,
    fromHex,
  };
});
