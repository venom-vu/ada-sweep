/**
 * Cardano min-ADA Lovelace Calculator (Babbage/Conway Ledger Compliance)
 * 
 * In Cardano, outputs containing native assets must lock a minimum amount of ADA
 * to prevent UTXO ledger bloat. The official formula is size-based.
 * 
 * Below is the highly accurate Babbage Era linear approximation:
 * Lovelace = (Base UTXO Size + Asset Overhead) * Coins Per Byte
 */
export function calculateMinAda(assets: Array<{ policyId: string; assetNameHex: string }>): number {
  if (assets.length === 0) {
    // Standard ADA-only UTXO min-ADA: ~1,000,000 Lovelace (1.0 ADA)
    return 1000000
  }

  const coinsPerByte = 4310 // Babbage era constant (4310 Lovelace per byte)
  
  // Base UTXO size without assets is 160 bytes (includes address, value, etc.)
  const baseUtxoSize = 160

  // Asset metadata size overhead
  // 1. Each unique policy ID is 28 bytes
  const uniquePolicies = new Set(assets.map(a => a.policyId))
  const policySize = uniquePolicies.size * 28

  // 2. Each unique asset name is represented by length/2 bytes
  let nameSize = 0
  assets.forEach(asset => {
    const nameBytes = Math.ceil(asset.assetNameHex.length / 2)
    nameSize += nameBytes + 12 // 12 bytes overhead for asset map packaging
  })

  const totalSize = baseUtxoSize + policySize + nameSize
  
  // Apply a standard 10% safety margin to prevent transaction building failure
  const calculatedLovelace = Math.ceil(totalSize * coinsPerByte * 1.1)

  // Cardano absolute floor is ~1.0 ADA
  return Math.max(1000000, calculatedLovelace)
}

/**
 * Returns formatted ADA string of min-ADA required
 */
export function formatMinAdaAda(assets: Array<{ policyId: string; assetNameHex: string }>): string {
  const lovelace = calculateMinAda(assets)
  return (lovelace / 1000000).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
