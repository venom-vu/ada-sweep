const BLOCKFROST_URLS: Record<string, string> = {
  preprod: "https://cardano-preprod.blockfrost.io/api/v0",
  mainnet: "https://cardano.blockfrost.io/api/v0",
}

export async function waitForTxConfirm(
  txHash: string,
  apiKey: string,
  network: "preprod" | "mainnet" = "preprod",
  options?: { interval?: number; timeout?: number },
): Promise<void> {
  if (!apiKey) throw new Error("Blockfrost API key is not configured. Set NUXT_PUBLIC_BLOCKFROST_API_KEY_PREPROD or NUXT_PUBLIC_BLOCKFROST_API_KEY_MAINNET in .env")

  const baseUrl = BLOCKFROST_URLS[network]
  const interval = options?.interval ?? 5000
  const timeout = options?.timeout ?? 120000
  const start = Date.now()

  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`${baseUrl}/txs/${txHash}`, {
        headers: { project_id: apiKey },
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.block_height) return
      }
    } catch {
    }

    await new Promise((r) => setTimeout(r, interval))
  }
  throw new Error(`Transaction ${txHash.slice(0, 16)}... not confirmed within ${timeout / 1000}s`)
}
