import { castProtocol } from "@hydra-sdk/core";
import type { Protocol } from "@hydra-sdk/core";

const cache = new Map<string, { params: Protocol; fetchedAt: number }>();
const CACHE_TTL = 5 * 24 * 60 * 60 * 1000;
const NETWORK_KEY = (n: string) => `params_${n}`;

const BLOCKFROST_URLS: Record<string, string> = {
  preprod: "https://cardano-preprod.blockfrost.io/api/v0",
  mainnet: "https://cardano-mainnet.blockfrost.io/api/v0",
};

const BLOCKFROST_TO_PROTOCOL: Record<string, keyof Protocol> = {
  epoch: "epoch",
  min_fee_a: "minFeeA",
  min_fee_b: "minFeeB",
  max_block_size: "maxBlockSize",
  max_tx_size: "maxTxSize",
  max_block_header_size: "maxBlockHeaderSize",
  key_deposit: "keyDeposit",
  pool_deposit: "poolDeposit",
  decentralisation_param: "decentralisation",
  min_pool_cost: "minPoolCost",
  price_mem: "priceMem",
  price_step: "priceStep",
  max_tx_ex_mem: "maxTxExMem",
  max_tx_ex_steps: "maxTxExSteps",
  max_block_ex_mem: "maxBlockExMem",
  max_block_ex_steps: "maxBlockExSteps",
  max_val_size: "maxValSize",
  collateral_percent: "collateralPercent",
  max_collateral_inputs: "maxCollateralInputs",
  min_fee_ref_script_cost_per_byte: "minFeeRefScriptCostPerByte",
};

export async function fetchProtocolParams(
  network: "preprod" | "mainnet",
  projectId?: string,
): Promise<Protocol> {
  const key = NETWORK_KEY(network);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.params;
  }

  if (!projectId && typeof window !== "undefined") {
    projectId = (window as any).__BLOCKFROST_PROJECT_ID__;
  }

  const baseUrl = BLOCKFROST_URLS[network];

  try {
    const res = await fetch(`${baseUrl}/epochs/latest/parameters`, {
      headers: projectId ? { project_id: projectId } : {},
    });
    if (!res.ok) {
      throw new Error(`Blockfrost error: ${res.status} ${res.statusText}`);
    }
    const raw: Record<string, unknown> = await res.json();
    const mapped: Partial<Record<keyof Protocol, unknown>> = {};
    for (const [src, dest] of Object.entries(BLOCKFROST_TO_PROTOCOL)) {
      if (raw[src] !== undefined) {
        mapped[dest] = raw[src];
      }
    }
    const params = castProtocol(mapped);
    cache.set(key, { params, fetchedAt: Date.now() });
    return params;
  } catch (e) {
    if (cached) return cached.params;
    throw e;
  }
}
