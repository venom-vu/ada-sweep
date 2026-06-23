import { useWalletStore } from "./wallet";
import { createDexService } from "~/services/dex";

export type ClassificationStatus =
  | "idle"
  | "loading"
  | "dexlive"
  | "fallback"
  | "error";

export interface AssetClassification {
  assetId: string;
  policyId: string;
  assetNameHex: string;
  displayName: string;
  amount: number;
  category: "trusted" | "suspicious";
  reason: string;
  imageUrl?: string;
  phishingUrlShielded: boolean;
  originalUrl?: string;
  status: ClassificationStatus;
  dexSource?: string;
}

const PHISHING_PATTERNS = [
  "phish",
  "hack",
  "steal",
  "claim",
  "reward",
  "free-",
  "airdro",
  "bonus",
  "giveaway",
];

function hexToUtf8(hex: string): string {
  try {
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
    }
    return str;
  } catch {
    return hex;
  }
}

function checkPhishingUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return PHISHING_PATTERNS.some((p) => lower.includes(p));
}

function checkDomainPattern(name: string): boolean {
  const lower = name.toLowerCase();
  const domainRegex = /\b[a-z0-9-]+(\.[a-z]{2,6})+\b/;
  return domainRegex.test(lower);
}

export const useCleanerStore = defineStore("cleaner", () => {
  const walletStore = useWalletStore();

  const whitelistKey = computed(
    () => `adasweep-whitelist-overrides-${walletStore.selectedNetwork}`,
  );
  const blacklistKey = computed(
    () => `adasweep-blacklist-overrides-${walletStore.selectedNetwork}`,
  );
  const localWhitelistOverrides = ref<string[]>([]);
  const localBlacklistOverrides = ref<string[]>([]);

  function readList(key: string, target: Ref<string[]>) {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(key);
        target.value = raw ? JSON.parse(raw) : [];
      } catch {
        target.value = [];
      }
    }
  }

  function writeList(key: string, target: Ref<string[]>) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(target.value));
      } catch (e) {
        console.warn("Failed to write", key, e);
      }
    }
  }

  // Clean corrupted data from previous bug (watch passed unwrapped array)
  try {
    const w = localStorage.getItem(whitelistKey.value);
    if (w === "undefined" || w === "null")
      localStorage.removeItem(whitelistKey.value);
    const b = localStorage.getItem(blacklistKey.value);
    if (b === "undefined" || b === "null")
      localStorage.removeItem(blacklistKey.value);
  } catch {}
  readList(whitelistKey.value, localWhitelistOverrides);
  readList(blacklistKey.value, localBlacklistOverrides);

  watch(
    localWhitelistOverrides,
    () => writeList(whitelistKey.value, localWhitelistOverrides),
    { deep: true },
  );
  watch(
    localBlacklistOverrides,
    () => writeList(blacklistKey.value, localBlacklistOverrides),
    { deep: true },
  );

  const isLoadingLiquidity = ref(false);
  const liquidityCache = ref<Record<string, number>>({});
  const classificationStatusMap = ref<Record<string, ClassificationStatus>>({});
  const dexSourceMap = ref<Record<string, string>>({});

  const systemWhitelist = [
    "da86815a519c799545591e0d758c8590ef595303c734b2cfc1b827e8.5370616365436f696e73",
  ];

  const systemBlacklist: string[] = [];

  const scamKeywords = [
    "scam",
    "fake",
    "junk",
    "spam",
    "claim",
    "reward",
    "free",
    "airdrop",
    "giveaway",
    "bonus",
    "gift",
    "voucher",
  ];

  const classifiedAssets = computed<AssetClassification[]>(() => {
    const assetsMap: Record<
      string,
      { amount: number; policyId: string; nameHex: string }
    > = {};
    walletStore.utxos.forEach((utxo) => {
      Object.entries(utxo.assets).forEach(([assetId, amount]) => {
        if (!assetsMap[assetId]) {
          const parts = assetId.split(".");
          assetsMap[assetId] = {
            amount: 0,
            policyId: parts[0] || "",
            nameHex: parts[1] || "",
          };
        }
        const obj = assetsMap[assetId];
        if (obj) obj.amount += amount;
      });
    });

    return Object.entries(assetsMap).map(([assetId, info]) => {
      const displayName = hexToUtf8(info.nameHex) || "Unnamed Token";
      const status = classificationStatusMap.value[assetId] || "idle";
      const dexSource = dexSourceMap.value[assetId];

      if (localWhitelistOverrides.value.includes(assetId)) {
        return {
          assetId,
          policyId: info.policyId,
          assetNameHex: info.nameHex,
          displayName,
          amount: info.amount,
          category: "trusted",
          reason: "User Whitelisted",
          phishingUrlShielded: false,
          status,
          dexSource,
        };
      }

      if (systemBlacklist.includes(assetId)) {
        return {
          assetId,
          policyId: info.policyId,
          assetNameHex: info.nameHex,
          displayName,
          amount: info.amount,
          category: "suspicious",
          reason: "Blacklisted",
          imageUrl: "https://unsafe-scam-metadata-url.com/phish.jpg",
          originalUrl: "https://unsafe-scam-metadata-url.com/phish.jpg",
          phishingUrlShielded: true,
          status,
          dexSource,
        };
      }

      if (systemWhitelist.includes(assetId)) {
        return {
          assetId,
          policyId: info.policyId,
          assetNameHex: info.nameHex,
          displayName,
          amount: info.amount,
          category: "trusted",
          reason: "System Whitelisted",
          phishingUrlShielded: false,
          status,
          dexSource,
        };
      }

      const cachedLiquidity = liquidityCache.value[assetId];
      const nameLower = displayName.toLowerCase();

      if (
        scamKeywords.some((k) => nameLower.includes(k)) ||
        checkDomainPattern(nameLower)
      ) {
        const isPhishingDomain = checkDomainPattern(nameLower);
        return {
          assetId,
          policyId: info.policyId,
          assetNameHex: info.nameHex,
          displayName,
          amount: info.amount,
          category: "suspicious",
          reason: isPhishingDomain ? "Phishing Domain" : "Scam Name",
          imageUrl: "https://unsafe-scam-metadata-url.com/nft-phishing.jpg",
          originalUrl: "https://unsafe-scam-metadata-url.com/nft-phishing.jpg",
          phishingUrlShielded: true,
          status,
          dexSource,
        };
      }

      if (localBlacklistOverrides.value.includes(assetId)) {
        return {
          assetId,
          policyId: info.policyId,
          assetNameHex: info.nameHex,
          displayName,
          amount: info.amount,
          category: "suspicious",
          reason: "User Flagged",
          phishingUrlShielded: false,
          status,
          dexSource,
        };
      }

      if (
        cachedLiquidity !== undefined &&
        cachedLiquidity === 0 &&
        dexSourceMap.value[assetId] === "minswap"
      ) {
        return {
          assetId,
          policyId: info.policyId,
          assetNameHex: info.nameHex,
          displayName,
          amount: info.amount,
          category: "suspicious",
          reason: "No DEX Liquidity",
          imageUrl: "https://suspicious-token-link.com/scam.png",
          originalUrl: "https://suspicious-token-link.com/scam.png",
          phishingUrlShielded: checkPhishingUrl(
            "https://suspicious-token-link.com/scam.png",
          ),
          status,
          dexSource,
        };
      }

      return {
        assetId,
        policyId: info.policyId,
        assetNameHex: info.nameHex,
        displayName,
        amount: info.amount,
        category: "trusted",
        reason: "Standard Asset",
        phishingUrlShielded: false,
        status,
        dexSource,
      };
    });
  });

  const trustedAssets = computed(() =>
    classifiedAssets.value.filter((a) => a.category === "trusted"),
  );
  const suspiciousAssets = computed(() =>
    classifiedAssets.value.filter((a) => a.category === "suspicious"),
  );

  const markAsTrusted = (assetId: string) => {
    if (!localWhitelistOverrides.value.includes(assetId)) {
      localWhitelistOverrides.value.push(assetId);
    }
    localBlacklistOverrides.value = localBlacklistOverrides.value.filter(
      (id) => id !== assetId,
    );
  };

  const markAsSuspicious = (assetId: string) => {
    localWhitelistOverrides.value = localWhitelistOverrides.value.filter(
      (id) => id !== assetId,
    );
    if (!localBlacklistOverrides.value.includes(assetId)) {
      localBlacklistOverrides.value.push(assetId);
    }
  };

  const lockedAda = computed(() => {
    let sumLovelace = 0;
    walletStore.utxos.forEach((utxo) => {
      if (Object.keys(utxo.assets).length > 0) {
        sumLovelace += utxo.lovelace;
      }
    });
    return sumLovelace / 1000000;
  });

  const usableAda = computed(() => {
    const totalAda = parseFloat(walletStore.balanceAda);
    return Math.max(0, totalAda - lockedAda.value);
  });

  const walletHealthScore = computed(() => {
    if (!walletStore.isConnected || walletStore.utxos.length === 0) return 100;
    let score = 100;
    const utxoCount = walletStore.totalUtxoCount;
    if (utxoCount > 8) score -= (utxoCount - 8) * 1.5;
    const totalAda = parseFloat(walletStore.balanceAda);
    if (totalAda > 0) {
      score -= (lockedAda.value / totalAda) * 40;
    }
    score -= suspiciousAssets.value.length * 6;
    return Math.min(100, Math.max(0, Math.floor(score)));
  });

  let currentAbortController: AbortController | null = null;
  const FETCH_TIMEOUT = 15_000;

  const fetchDexLiquidity = async () => {
    if (walletStore.utxos.length === 0) return;
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }

    const currentNetwork = walletStore.selectedNetwork;
    if (currentNetwork === "preprod") return;
    const service = await createDexService(currentNetwork);

    const allAssetIds = new Set<string>();
    walletStore.utxos.forEach((utxo) => {
      Object.keys(utxo.assets).forEach((id) => allAssetIds.add(id));
    });

    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    isLoadingLiquidity.value = true;

    allAssetIds.forEach((id) => {
      classificationStatusMap.value[id] = "loading";
    });

    const timeoutId = setTimeout(() => {
      if (signal.aborted) return;
      allAssetIds.forEach((id) => {
        if (classificationStatusMap.value[id] === "loading") {
          classificationStatusMap.value[id] = "error";
        }
      });
      isLoadingLiquidity.value = false;
    }, FETCH_TIMEOUT);

    try {
      const newCache: Record<string, number> = {};
      const newDexSources: Record<string, string> = {};

      await Promise.all(
        Array.from(allAssetIds).map(async (assetId) => {
          if (signal.aborted) return;
          try {
            const result = await service.checkLiquidity(assetId);
            if (signal.aborted) return;
            if ("code" in result) {
              classificationStatusMap.value[assetId] = "error";
            } else {
              newCache[assetId] = result.tvl;
              newDexSources[assetId] = result.source;
              classificationStatusMap.value[assetId] = "dexlive";
            }
          } catch {
            if (signal.aborted) return;
            classificationStatusMap.value[assetId] = "error";
          }
        }),
      );

      if (!signal.aborted) {
        liquidityCache.value = newCache;
        dexSourceMap.value = newDexSources;
      }
    } catch (e) {
      if (!signal.aborted) {
        console.warn("Error loading DEX liquidity:", e);
        allAssetIds.forEach((id) => {
          if (classificationStatusMap.value[id] === "loading") {
            classificationStatusMap.value[id] = "error";
          }
        });
      }
    } finally {
      clearTimeout(timeoutId);
      if (!signal.aborted) {
        isLoadingLiquidity.value = false;
      }
      if (currentAbortController?.signal === signal) {
        currentAbortController = null;
      }
    }
  };

  watch(
    () => walletStore.utxos,
    () => {
      fetchDexLiquidity();
    },
    { immediate: true, deep: true },
  );

  const burnerStatus = ref<
    "idle" | "signing" | "submitted" | "success" | "error"
  >("idle");
  const transactionHash = ref<string | null>(null);
  const executionError = ref<string | null>(null);
  const selectedJunkIds = ref<string[]>([]);
  const selectedJunkIdsSet = computed(() => new Set(selectedJunkIds.value));

  const isExecuting = computed(
    () =>
      burnerStatus.value !== "idle" &&
      burnerStatus.value !== "success" &&
      burnerStatus.value !== "error",
  );

  const resetBurnerFlow = () => {
    burnerStatus.value = "idle";
    transactionHash.value = null;
    executionError.value = null;
    selectedJunkIds.value = [];
  };

  // Action: Reset/clear everything when leaving page
  const clearStoreState = () => {
    selectedJunkIds.value = [];
    resetBurnerFlow();
  };

  return {
    localWhitelistOverrides,
    isLoadingLiquidity,
    classificationStatusMap,
    liquidityCache,
    classifiedAssets,
    trustedAssets,
    suspiciousAssets,
    lockedAda,
    usableAda,
    walletHealthScore,
    markAsTrusted,
    markAsSuspicious,
    fetchDexLiquidity,
    burnerStatus,
    transactionHash,
    executionError,
    isExecuting,
    resetBurnerFlow,
    selectedJunkIds,
    selectedJunkIdsSet,
    clearStoreState,
  };
});
