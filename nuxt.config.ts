import { defineNuxtConfig } from 'nuxt/config'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://adasweep.xyz'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default (defineNuxtConfig as any)({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: false,

  // Prerender all pages so Googlebot gets real HTML (not an empty SPA shell)
  nitro: {
    prerender: {
      routes: ['/', '/cbor', '/sign', '/keygen', '/optimizer', '/cleaner', '/dashboard']
    }
  },

  app: {
    head: {
      title: 'ADASweep — Cardano Wallet Optimizer: Reclaim ADA, Remove Spam & Developer Tools',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'ADASweep is a free, non-custodial Cardano wallet toolkit. Consolidate eUTXOs, reclaim locked ADA from spam tokens, decode CBOR transactions, sign data, and derive keys — all client-side in your browser.' },
        { name: 'keywords', content: 'Cardano UTXO consolidator, reclaim locked ADA, Cardano wallet cleanup, spam token remover, eUTXO optimizer, CBOR decoder Cardano, Cardano key generator, BIP-39 mnemonic Cardano, Cardano data signer, non-custodial Web3 tools, ADASweep' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'author', content: 'ADASweep' },
        { name: 'theme-color', content: '#7c3aed' },
        // Open Graph
        { property: 'og:site_name', content: 'ADASweep' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: siteUrl },
        { property: 'og:title', content: 'ADASweep — Cardano Wallet Optimizer & Developer Toolkit' },
        { property: 'og:description', content: 'Free, non-custodial Cardano toolkit: consolidate eUTXOs, reclaim locked ADA from spam/phishing tokens, decode CBOR, sign data, and derive keys — all in your browser.' },
        { property: 'og:image', content: `${siteUrl}/og-image.webp` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'ADASweep — Cardano Wallet Optimizer & Developer Toolkit' },
        { property: 'og:locale', content: 'en_US' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@adasweep' },
        { name: 'twitter:title', content: 'ADASweep — Cardano Wallet Optimizer & Developer Toolkit' },
        { name: 'twitter:description', content: 'Free, non-custodial Cardano toolkit: consolidate eUTXOs, reclaim locked ADA from spam tokens, decode CBOR, sign data, and derive keys — all in your browser.' },
        { name: 'twitter:image', content: `${siteUrl}/og-image.webp` },
        { name: 'twitter:image:alt', content: 'ADASweep — Cardano Wallet Optimizer & Developer Toolkit' }
      ],
      link: [
        { rel: 'canonical', href: siteUrl },
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
      siteUrl,
      blockfrostApiKeyPreprod: '',
      blockfrostApiKeyMainnet: ''
    }
  },

  // Enable Pinia and Tailwind modules
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', 'vue-sonner/nuxt'],

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
      exclude: ['@hydra-sdk/cardano-wasm'],
      include: ['buffer']
    },
    resolve: {
      alias: {
        buffer: 'buffer'
      }
    }
  }
})
