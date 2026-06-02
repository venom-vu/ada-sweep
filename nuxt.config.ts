import { defineNuxtConfig } from 'nuxt/config'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://adasweep.xyz'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default (defineNuxtConfig as any)({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  app: {
    head: {
      title: 'ADASweep — One-Click Wallet Cleanup & Reclaim Trapped ADA for Cardano',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Optimize your Cardano wallet in one click. Safe, non-custodial UTXO consolidator and spam scanner to reclaim locked baseline ADA.' },
        // Open Graph
        { property: 'og:site_name', content: 'ADASweep' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: siteUrl },
        { property: 'og:title', content: 'ADASweep — One-Click Wallet Cleanup for Cardano' },
        { property: 'og:description', content: 'Safe, non-custodial UTXO consolidator and spam scanner to reclaim locked baseline ADA.' },
        { property: 'og:image', content: `${siteUrl}/og-image.png` },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: siteUrl },
        { name: 'twitter:title', content: 'ADASweep — One-Click Wallet Cleanup for Cardano' },
        { name: 'twitter:description', content: 'Safe, non-custodial UTXO consolidator and spam scanner to reclaim locked baseline ADA.' },
        { name: 'twitter:image', content: `${siteUrl}/og-image.png` }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon/favicon-96x96.png' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/favicon/apple-touch-icon.png' },
        { rel: 'manifest', href: '/favicon/site.webmanifest' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      siteUrl
    }
  },

  // Enable Pinia and Tailwind modules
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],

  // Nuxt 4 App directory structure alignment
  future: {
    compatibilityVersion: 4
  },

  // Vite specific bundler settings for Web3 and WASM support
  vite: {
    build: {
      target: 'esnext'
    },
    plugins: [
      wasm(),
      topLevelAwait()
    ],
    optimizeDeps: {
      exclude: ['@hydra-sdk/cardano-wasm']
    }
  }
})
