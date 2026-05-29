import { describe, it, expect } from 'vitest'
import { calculateMinAda } from './minAdaCalculator'

describe('minAdaCalculator', () => {
  it('returns 1.0 ADA (1,000,000 Lovelace) floor for empty native assets lists', () => {
    const result = calculateMinAda([])
    expect(result).toBe(1000000)
  })

  it('correctly calculates larger min-ADA values as asset lists grow', () => {
    const singleAsset = [
      { policyId: 'da86815a519c799545591e0d758c8590ef595303c734b2cfc1b827e8', assetNameHex: '5370616365636f696e73' }
    ]
    const minAdaSingle = calculateMinAda(singleAsset)
    expect(minAdaSingle).toBeGreaterThanOrEqual(1000000) // Needs at least floor 1.0 ADA

    const multipleAssets = [
      { policyId: 'da86815a519c799545591e0d758c8590ef595303c734b2cfc1b827e8', assetNameHex: '5370616365636f696e73' },
      { policyId: '7492c1ad3b5c799545591e0d758c8590ef595303c734b2cfc1b827e8', assetNameHex: '5363616d546f6b656e41' },
      { policyId: 'a1b2c3d4e5f6799545591e0d758c8590ef595303c734b2cfc1b827e8', assetNameHex: '46616b6541697264726f70' }
    ]
    const minAdaMulti = calculateMinAda(multipleAssets)
    expect(minAdaMulti).toBeGreaterThan(minAdaSingle) // Needs more than single asset
  })
})
