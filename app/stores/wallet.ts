import type { UTXO } from "~/utils/transactionBatcher";
import { toast } from "vue-sonner";
import { CardanoWASM } from "@hydra-sdk/cardano-wasm";

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
  const showConnectionModal = ref(false);
  const isSessionChecked = ref(false);

  // Network selection state: 'mainnet' | 'preprod' (Mainnet is disabled)
  const selectedNetwork = ref<"mainnet" | "preprod">("preprod");

  const setNetwork = (network: "mainnet" | "preprod") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("adasweep-network", network);
    }
    disconnectWallet();
    window.location.href = "/";
  };

  const _setNetwork = (network: "mainnet" | "preprod") => {
    selectedNetwork.value = network;
    if (typeof window !== "undefined") {
      localStorage.setItem("adasweep-network", network);
    }
  };

  const initNetwork = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adasweep-network") as
        | "mainnet"
        | "preprod"
        | null;
      _setNetwork(saved || "preprod");
      isSessionChecked.value = true;
    } else {
      _setNetwork("preprod");
      isSessionChecked.value = true;
    }
  };

  const networkMismatch = computed(() => {
    if (
      !isConnected.value ||
      networkId.value === null ||
      !selectedNetwork.value
    ) {
      return false;
    }
    const isWalletMainnet = networkId.value === 1;
    const isAppMainnet = selectedNetwork.value === "mainnet";
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

      const savedNetwork =
        typeof window !== "undefined"
          ? localStorage.getItem("adasweep-network")
          : null;

      // Some wallets expose networkId on the wallet object before enable
      const preEnableNetwork = (walletObject as any).networkId;

      if (preEnableNetwork !== undefined && savedNetwork) {
        const walletNet = preEnableNetwork === 1 ? "mainnet" : "preprod";
        if (walletNet !== savedNetwork) {
          toast(
            `Wallet is on ${walletNet.charAt(0).toUpperCase() + walletNet.slice(1)} but app is set to ${savedNetwork.charAt(0).toUpperCase() + savedNetwork.slice(1)}`,
          );
        }
      }

      // CIP-30 Enable
      const api = await walletObject.enable();
      walletApi.value = api;
      walletName.value = name;

      // Get current network: 0 = Testnet, 1 = Mainnet
      networkId.value = await api.getNetworkId();

      if (networkId.value === 1) {
        _setNetwork("mainnet");
        if (
          savedNetwork &&
          savedNetwork !== "mainnet" &&
          preEnableNetwork === undefined
        ) {
          toast("Your wallet is on Mainnet — switching app to Mainnet");
        }
      } else {
        _setNetwork("preprod");
        if (
          savedNetwork &&
          savedNetwork !== "preprod" &&
          preEnableNetwork === undefined
        ) {
          toast("Your wallet is on Preprod — switching app to Preprod");
        }
      }

      // Fetch Address (Standard unused or change address)
      const changeAddrHex = await api.getChangeAddress();
      walletAddress.value = decodeAddress(changeAddrHex);

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
        utxos.value = [];
        return;
      }

      const parsedUtxos: UTXO[] = [];

      for (const hex of rawHexUtxos) {
        try {
          const parsed = parseCBORUtxo(hex);
          if (parsed) {
            parsedUtxos.push(parsed);
          }
        } catch (e) {
          console.error("Error parsing UTXO CBOR:", e);
        }
      }
      console.log("parsedUtxos", parsedUtxos);
      utxos.value = parsedUtxos;
    } catch (err: any) {
      console.error("Error fetching UTXOs:", err);
      error.value = err.message || "Failed to fetch wallet UTXOs.";
    }
  };

  // Address hex decoder helper (CIP-30 is hex format, returns standard addr1...)
  const decodeAddress = (hexAddr: string): string => {
    try {
      const addr = CardanoWASM.Address.from_bytes(fromHex(hexAddr));
      return addr.to_bech32();
    } catch (e) {
      console.error("Error decoding address:", e);
      return hexAddr;
    }
  };

  // Pure Client-side CBOR UTXO parser fallback
  const parseCBORUtxo = (cborHex: string): UTXO | null => {
    try {
      // Decode CBOR bytes of TransactionUnspentOutput using Emurgo CSL WASM
      const utxo = CardanoWASM.TransactionUnspentOutput.from_bytes(
        fromHex(cborHex),
      );

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
              const quantity = parseInt(assetMap.get(assetName)!.to_str());

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
    toHex,
    fromHex,
  };
});
