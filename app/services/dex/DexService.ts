export type DexServiceErrorCode =
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED'
  | 'API_DOWN'
  | 'PARSE_ERROR'
  | 'UNSUPPORTED_NETWORK'

export interface DexServiceError {
  code: DexServiceErrorCode
  message: string
  retryAfter?: number
}

export interface LiquidityResult {
  assetId: string
  hasLiquidity: boolean
  tvl: number
  source: 'minswap' | 'heuristic'
  checkedAt: number
}

export interface DexService {
  checkLiquidity(assetId: string): Promise<LiquidityResult | DexServiceError>
  getSupportedNetworks(): string[]
}
