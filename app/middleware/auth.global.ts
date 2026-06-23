import { useWalletStore } from "~/stores/wallet";

export default defineNuxtRouteMiddleware(async (to) => {
  // Cardano wallet state (sessionStorage/CIP-30 window object) is client-only.
  if (process.server) return;

  const walletStore = useWalletStore();

  // If auto-connect check has not completed yet, run it and await completion.
  if (!walletStore.isSessionChecked) {
    walletStore.initNetwork();
    await walletStore.tryAutoConnect();
  }
});
