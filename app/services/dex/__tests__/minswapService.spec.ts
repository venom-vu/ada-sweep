import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MinswapService } from '../MinswapService'

describe('MinswapService', () => {
  let service: MinswapService
  let fetchMock: any

  beforeEach(() => {
    service = new MinswapService()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('supports mainnet network', () => {
    expect(service.getSupportedNetworks()).toEqual(['mainnet'])
  })

  it('queries Minswap API with cleaned asset ID (no dot)', async () => {
    fetchMock.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ liquidity: 5000000 }),
    })

    const result = await service.checkLiquidity(
      '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e'
    )

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api-mainnet-prod.minswap.org/v1/assets/29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e/metrics',
      expect.any(Object)
    )
    if ('code' in result) {
      throw new Error('Expected LiquidityResult, got error')
    }
    expect(result.hasLiquidity).toBe(true)
    expect(result.tvl).toBe(5000000)
    expect(result.source).toBe('minswap')
  })


  it('handles 404 response as no liquidity', async () => {
    fetchMock.mockResolvedValueOnce({
      status: 404,
    })

    const result = await service.checkLiquidity('unknown.asset')

    if ('code' in result) {
      throw new Error('Expected LiquidityResult, got error')
    }
    expect(result.hasLiquidity).toBe(false)
    expect(result.tvl).toBe(0)
    expect(result.source).toBe('minswap')
  })

  it('handles 429 response as RATE_LIMITED error', async () => {
    fetchMock.mockResolvedValueOnce({
      status: 429,
    })

    const result = await service.checkLiquidity('some.asset')

    expect('code' in result).toBe(true)
    if ('code' in result) {
      expect(result.code).toBe('RATE_LIMITED')
      expect(result.message).toContain('rate limit')
    }
  })

  it('handles other non-200 responses as API_DOWN error', async () => {
    fetchMock.mockResolvedValueOnce({
      status: 500,
    })

    const result = await service.checkLiquidity('some.asset')

    expect('code' in result).toBe(true)
    if ('code' in result) {
      expect(result.code).toBe('API_DOWN')
      expect(result.message).toContain('responded with status 500')
    }
  })

  it('handles network / fetch execution errors as NETWORK_ERROR', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Connection timed out'))

    const result = await service.checkLiquidity('some.asset')

    expect('code' in result).toBe(true)
    if ('code' in result) {
      expect(result.code).toBe('NETWORK_ERROR')
      expect(result.message).toBe('Connection timed out')
    }
  })
})
