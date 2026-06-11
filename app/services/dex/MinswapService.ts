import type { DexService, DexServiceError, LiquidityResult } from './DexService'

export class MinswapService implements DexService {
  getSupportedNetworks(): string[] {
    return ['mainnet']
  }

  async checkLiquidity(assetId: string): Promise<LiquidityResult | DexServiceError> {
    // 1. Clean asset ID (remove dot for Minswap API format)
    const cleanAssetId = assetId.replace('.', '')

    // 3. Make the API request
    try {
      const response = await fetch(`https://api-mainnet-prod.minswap.org/v1/assets/${cleanAssetId}/metrics`, {
        headers: {
          'Accept': 'application/json',
        },
      })

      if (response.status === 200) {
        const data = await response.json()
        const liquidity = data.liquidity ?? 0
        return {
          assetId,
          hasLiquidity: liquidity > 0,
          tvl: liquidity,
          source: 'minswap',
          checkedAt: Date.now(),
        }
      }

      if (response.status === 404) {
        return {
          assetId,
          hasLiquidity: false,
          tvl: 0,
          source: 'minswap',
          checkedAt: Date.now(),
        }
      }

      if (response.status === 429) {
        return {
          code: 'RATE_LIMITED',
          message: 'Minswap API rate limit exceeded. Please try again later.',
        }
      }

      return {
        code: 'API_DOWN',
        message: `Minswap API responded with status ${response.status}`,
      }
    } catch (error: any) {
      return {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error connecting to Minswap API',
      }
    }
  }
}

