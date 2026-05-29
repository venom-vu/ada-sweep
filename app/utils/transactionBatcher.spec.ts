import { describe, it, expect } from 'vitest'
import { chunkUtxos, estimateTransactionSize } from './transactionBatcher'
import type { UTXO } from './transactionBatcher'

describe('transactionBatcher', () => {
  const makeMockUtxos = (count: number): UTXO[] => {
    return Array.from({ length: count }, (_, i) => ({
      txHash: `tx_${i}`,
      index: 0,
      address: 'addr_test123',
      lovelace: 2000000,
      assets: {}
    }))
  }

  it('returns empty array when given no inputs', () => {
    const batches = chunkUtxos([])
    expect(batches).toEqual([])
  })

  it('keeps lists in a single chunk if count is below max limit', () => {
    const inputs = makeMockUtxos(25)
    const batches = chunkUtxos(inputs, 40)
    expect(batches).toHaveLength(1)
    expect(batches[0]).toHaveLength(25)
  })

  it('splits oversized input arrays into exact size chunks', () => {
    const inputs = makeMockUtxos(95)
    const batches = chunkUtxos(inputs, 40)
    
    expect(batches).toHaveLength(3) // 40 + 40 + 15
    expect(batches[0]).toHaveLength(40)
    expect(batches[1]).toHaveLength(40)
    expect(batches[2]).toHaveLength(15)
  })

  it('estimates transaction sizes based on input counts correctly', () => {
    const sizeEmpty = estimateTransactionSize(0, 0, 0)
    expect(sizeEmpty).toBe(150) // Base tx envelope size

    const sizeLarge = estimateTransactionSize(40, 1, 10)
    expect(sizeLarge).toBeGreaterThan(sizeEmpty)
  })
})
