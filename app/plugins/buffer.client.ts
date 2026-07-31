import { Buffer } from "buffer";
export default defineNuxtPlugin(() => {
  if (typeof globalThis.Buffer === "undefined") {
    globalThis.Buffer = Buffer;
  }
  if (
    typeof window !== "undefined" &&
    typeof (window as any).Buffer === "undefined"
  ) {
    (window as any).Buffer = Buffer;
  }
});
