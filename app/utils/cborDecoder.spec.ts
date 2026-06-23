import { describe, it, expect } from "vitest";
import { decodeCardanoCbor } from "./cborDecoder";
describe("CBOR Deserializer Utility", () => {
  it("should successfully decode a valid Transaction CBOR", async () => {
    const txHex = "84a300d90102800180021a000186a0a0f5f6";
    const result = await decodeCardanoCbor(txHex);

    expect(result.type).toBe("Transaction");
    expect(result.data).toBeDefined();
    expect(result.rawHex).toBe(txHex);
  });

  it("should successfully decode a valid UTXO CBOR", async () => {
    const utxoHex =
      "8282582011111111111111111111111111111111111111111111111111111111111111110082581d60000000000000000000000000000000000000000000000000000000001a000f4240";
    const result = await decodeCardanoCbor(utxoHex);

    expect(result.type).toBe("UTXO");
    expect(result.data).toBeDefined();
    expect(result.data.input).toBeDefined();
    expect(result.data.output).toBeDefined();
    expect(result.rawHex).toBe(utxoHex);
  });

  it("should successfully decode a valid Address CBOR", async () => {
    const addrHex =
      "6000000000000000000000000000000000000000000000000000000000";
    const result = await decodeCardanoCbor(addrHex);

    expect(result.type).toBe("Address");
    expect(result.data.bech32).toBe(
      "addr_test1vqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqd9tg5t",
    );
    expect(result.data.networkId).toBe(0);
    expect(result.rawHex).toBe(addrHex);
  });

  it("should successfully decode a valid Value CBOR", async () => {
    const valueHex = "1a075bcd15";
    const result = await decodeCardanoCbor(valueHex);

    expect(result.type).toBe("Value");
    expect(result.data.coin).toBe("123456789");
    expect(result.rawHex).toBe(valueHex);
  });

  it("should throw error on invalid hex string", async () => {
    await expect(decodeCardanoCbor("not-a-hex-string")).rejects.toThrow();
  });

  it("should throw error when none of the entities parse successfully", async () => {
    // "hello" text string in CBOR: 6568656c6c6f. Valid CBOR but not a Transaction, UTXO, Address, or Value
    await expect(decodeCardanoCbor("6568656c6c6f")).rejects.toThrow(
      "Không thể giải mã CBOR này thành thực thể Cardano hợp lệ",
    );
  });
});
