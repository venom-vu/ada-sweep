import { useWalletStore } from "~/stores/wallet";

export default defineNuxtRouteMiddleware(async (to) => {
  // Cardano wallet state (sessionStorage/CIP-30 window object) is client-only.
  if (process.server) return;

  // Enforce wallet connection only if the route metadata auth flag is explicitly true.
  if (to.meta.auth !== true) return;

  const walletStore = useWalletStore();

  // If auto-connect check has not completed yet, run it and await completion.
  if (!walletStore.isSessionChecked) {
    walletStore.initNetwork();
    await walletStore.tryAutoConnect();
  }

  // If no wallet is connected, prevent access by throwing a 404 error.
  if (!walletStore.isConnected) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page Not Found",
      fatal: true,
    });
  }
});
