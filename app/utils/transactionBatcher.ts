export interface UTXO {
  txHash: string
  index: number
  address: string
  lovelace: number
  assets: {
    [assetId: string]: number
  }
}

/**
 * UTXO Transaction Batcher Engine
 * 
 * Cardano limits transaction size strictly to ~16KB (16384 bytes).
 * When consolidating a massive list of inputs (e.g. 100+ UTXOs), we must
 * group them into separate transactions to guarantee they compile and pass node size limits.
 * 
 * A typical Cardano input consumes around 35-50 bytes of transaction space.
 * To ensure absolute safety under the 16KB limit (allowing space for witness signatures),
 * we clamp the maximum number of inputs per transaction to 40.
 */
export function chunkUtxos(inputs: UTXO[], maxInputsPerBatch = 40): UTXO[][] {
  if (inputs.length === 0) return []
  
  const batches: UTXO[][] = []
  
  for (let i = 0; i < inputs.length; i += maxInputsPerBatch) {
    batches.push(inputs.slice(i, i + maxInputsPerBatch))
  }
  
  return batches
}

/**
 * Estimates transaction byte size based on inputs and outputs
 */
export function estimateTransactionSize(inputsCount: number, outputsCount: number, assetsCount: number): number {
  // Rough size formula in bytes:
  // Base tx envelope: ~150 bytes
  // Each input: ~45 bytes
  // Each output: ~70 bytes
  // Each unique asset: ~32 bytes
  const baseSize = 150
  const inputSize = inputsCount * 45
  const outputSize = outputsCount * 70
  const assetSize = assetsCount * 32
  
  return baseSize + inputSize + outputSize + assetSize
}
