/**
 * Cardano min-ADA Lovelace Calculator (Babbage/Conway Ledger Compliance)
 *
 * Lovelace = (Base UTXO Size + Asset Overhead) * coinsPerUtxoSize
 *
 * coinsPerUtxoSize mặc định 4310 (Conway era trên Preprod),
 * nên truyền giá trị thật từ protocolParams.ts nếu có.
 */
export function calculateMinAda(
  assets: Array<{ policyId: string; assetNameHex: string }>,
  coinsPerUtxoSize?: number,
): number {
  const cpus = coinsPerUtxoSize ?? 4310;

  if (assets.length === 0) {
    const adaOnlyOutputSize = 197;
    return Math.max(1000000, Math.ceil(adaOnlyOutputSize * cpus));
  }

  const baseUtxoSize = 160;
  const addressSize = 57; // Standard base address size in bytes
  const uniquePolicies = new Set(assets.map((a) => a.policyId));
  const policySize = uniquePolicies.size * 28;

  let nameSize = 0;
  assets.forEach((asset) => {
    const nameBytes = Math.ceil(asset.assetNameHex.length / 2);
    nameSize += nameBytes + 12;
  });

  const totalSize = baseUtxoSize + addressSize + policySize + nameSize + 10;
  const calculatedLovelace = Math.ceil(totalSize * cpus);

  return Math.max(1000000, calculatedLovelace);
}

/**
 * Returns formatted ADA string of min-ADA required
 */
export function formatMinAdaAda(
  assets: Array<{ policyId: string; assetNameHex: string }>,
): string {
  const lovelace = calculateMinAda(assets);
  return (lovelace / 1000000).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
