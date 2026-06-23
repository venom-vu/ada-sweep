import { CardanoWASM } from "@hydra-sdk/cardano-wasm";

export interface DecodedResult {
  type: "Transaction" | "UTXO" | "Address" | "Value";
  data: any;
  rawHex: string;
  txHash?: string;
  size: number;
}

export function fromHex(hex: string): Uint8Array {
  const cleaned = hex.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]*$/.test(cleaned)) {
    throw new Error("Invalid hex characters");
  }
  if (cleaned.length % 2 !== 0) {
    throw new Error("Hex string must have an even length");
  }
  const bytes = new Uint8Array(
    cleaned.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
  );
  return bytes;
}

export function toHex(bytes: Uint8Array): string {
  return Array.prototype.map
    .call(bytes, (x: number) => ("0" + x.toString(16)).slice(-2))
    .join("");
}

export async function decodeCardanoCbor(
  hexString: string,
): Promise<DecodedResult> {
  let bytes: Uint8Array;
  try {
    bytes = fromHex(hexString);
  } catch (err: any) {
    throw new Error(`Định dạng hex không hợp lệ: ${err.message}`);
  }

  if (bytes.length === 0) {
    throw new Error("Chuỗi hex rỗng");
  }

  const size = bytes.length;

  // 1. Try decoding as Transaction
  try {
    const tx = CardanoWASM.Transaction.from_bytes(bytes);
    if (tx) {
      const data = JSON.parse(tx.to_json());
      tx.free();

      // Compute transaction hash using FixedTransaction
      let txHash = "";
      try {
        const fixedTx = CardanoWASM.FixedTransaction.from_bytes(bytes);
        txHash = fixedTx.transaction_hash().to_hex();
        fixedTx.free();
      } catch (hashErr) {
        console.error("Failed to compute tx hash via FixedTransaction:", hashErr);
      }

      // Enrich vkeys with keyHash and bech32 derived fields
      if (data.witness_set && Array.isArray(data.witness_set.vkeys)) {
        data.witness_set.vkeys = data.witness_set.vkeys.map((vk: any) => {
          try {
            const pubKey = CardanoWASM.PublicKey.from_hex(vk.vkey);
            const keyHash = pubKey.hash().to_hex();
            const bech32 = pubKey.to_bech32();
            pubKey.free();
            return {
              ...vk,
              keyHash,
              bech32,
            };
          } catch (keyErr) {
            return vk;
          }
        });
      }

      return {
        type: "Transaction",
        data,
        rawHex: hexString,
        txHash,
        size,
      };
    }
  } catch (e) {
    // Continue
  }

  // 2. Try decoding as TransactionUnspentOutput (UTXO)
  try {
    const utxo = CardanoWASM.TransactionUnspentOutput.from_bytes(bytes);
    if (utxo) {
      const data = JSON.parse(utxo.to_json());
      utxo.free();
      return {
        type: "UTXO",
        data,
        rawHex: hexString,
        size,
      };
    }
  } catch (e) {
    // Continue
  }

  // 3. Try decoding as Address
  try {
    const addr = CardanoWASM.Address.from_bytes(bytes);
    if (addr) {
      let bech32 = "";
      let networkId: number | null = null;
      try {
        bech32 = addr.to_bech32();
        networkId = addr.network_id();
      } catch (err) {}

      addr.free();
      return {
        type: "Address",
        data: {
          bech32,
          networkId,
        },
        rawHex: hexString,
        size,
      };
    }
  } catch (e) {
    // Continue
  }

  // 4. Try decoding as Value
  try {
    const val = CardanoWASM.Value.from_bytes(bytes);
    if (val) {
      const data = JSON.parse(val.to_json());
      val.free();
      return {
        type: "Value",
        data,
        rawHex: hexString,
        size,
      };
    }
  } catch (e) {
    // Continue
  }

  throw new Error("Không thể giải mã CBOR này thành thực thể Cardano hợp lệ");
}
