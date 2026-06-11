import type { DexService, DexServiceErrorCode } from "./DexService";

export type {
  DexService,
  DexServiceErrorCode,
  DexServiceError,
  LiquidityResult,
} from "./DexService";
import { MinswapService } from "./MinswapService";

let minswapServiceInstance: DexService | null = null;

async function getMinswapService(): Promise<DexService> {
  if (!minswapServiceInstance) {
    minswapServiceInstance = new MinswapService();
  }
  return minswapServiceInstance;
}

export async function createDexService(network: string): Promise<DexService> {
  if (network === "mainnet") {
    return getMinswapService();
  }
  throw {
    code: "UNSUPPORTED_NETWORK" as DexServiceErrorCode,
    message: `Network "${network}" is not supported`,
  };
}
