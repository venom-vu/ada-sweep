<template>
  <!-- DESKTOP LEFT SIDEBAR -->
  <aside
    class="hidden fixed inset-y-0 left-0 z-30 flex-col justify-between p-6 w-64 border-r backdrop-blur-md md:flex bg-fintech-dark/40 border-white/5"
  >
    <div class="space-y-8">
      <NuxtLink to="/dashboard">
        <img src="/logo-text.png" class="h-20" alt="ADASweep Logo" />
      </NuxtLink>

      <!-- Navigation Links -->
      <nav class="flex flex-col gap-1">
        <span
          class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-3 mb-2 block"
          >Menu</span
        >

        <NuxtLink
          to="/dashboard"
          class="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/[0.03]"
          active-class="!text-violet-400 !bg-violet-500/[0.04]"
        >
          <span
            class="absolute left-0 w-0.5 h-0 rounded-full bg-violet-500 opacity-0 group-hover:opacity-50 transition-all duration-200 group-hover:h-5"
            aria-hidden="true"
          ></span>
          <svg
            class="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
            />
          </svg>
          <span>Dashboard</span>
        </NuxtLink>

        <NuxtLink
          to="/optimizer"
          class="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/[0.03]"
          active-class="!text-violet-400 !bg-violet-500/[0.04]"
        >
          <span
            class="absolute left-0 w-0.5 h-0 rounded-full bg-violet-500 opacity-0 group-hover:opacity-50 transition-all duration-200 group-hover:h-5"
            aria-hidden="true"
          ></span>
          <svg
            class="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <span>Optimize UTXOs</span>
        </NuxtLink>

        <NuxtLink
          to="/cleaner"
          class="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/[0.03]"
          active-class="!text-violet-400 !bg-violet-500/[0.04]"
        >
          <span
            class="absolute left-0 w-0.5 h-0 rounded-full bg-violet-500 opacity-0 group-hover:opacity-50 transition-all duration-200 group-hover:h-5"
            aria-hidden="true"
          ></span>
          <svg
            class="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span>Junk Cleaner</span>
        </NuxtLink>

        <span
          class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-3 mt-6 mb-2 block"
          >Dev Tools</span
        >

        <NuxtLink
          to="/sign"
          class="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/[0.03]"
          active-class="!text-violet-400 !bg-violet-500/[0.04]"
        >
          <span
            class="absolute left-0 w-0.5 h-0 rounded-full bg-violet-500 opacity-0 group-hover:opacity-50 transition-all duration-200 group-hover:h-5"
            aria-hidden="true"
          ></span>
          <svg
            class="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          <span>Sign Data</span>
        </NuxtLink>

        <NuxtLink
          to="/cbor"
          class="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/[0.03]"
          active-class="!text-violet-400 !bg-violet-500/[0.04]"
        >
          <span
            class="absolute left-0 w-0.5 h-0 rounded-full bg-violet-500 opacity-0 group-hover:opacity-50 transition-all duration-200 group-hover:h-5"
            aria-hidden="true"
          ></span>
          <svg
            class="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <span>CBOR Deserializer</span>
        </NuxtLink>

        <NuxtLink
          to="/keygen"
          class="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/[0.03]"
          active-class="!text-violet-400 !bg-violet-500/[0.04]"
        >
          <span
            class="absolute left-0 w-0.5 h-0 rounded-full bg-violet-500 opacity-0 group-hover:opacity-50 transition-all duration-200 group-hover:h-5"
            aria-hidden="true"
          ></span>
          <svg
            class="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
          <span>Key Generator</span>
        </NuxtLink>
      </nav>
    </div>

    <!-- Bottom Connection Panel -->
    <div class="space-y-4">
      <div class="h-px bg-white/5"></div>
      <div class="flex items-center justify-center gap-5 pt-1">
        <a
          href="https://github.com/venom-vu/ada-sweep"
          target="_blank"
          class="text-slate-500 hover:text-violet-400 transition-all duration-200 hover:scale-110"
          aria-label="GitHub Repository"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>

        <a
          href="https://x.com/venom_vux"
          target="_blank"
          class="text-slate-500 hover:text-violet-400 transition-all duration-200 hover:scale-110"
          aria-label="Twitter X Profile"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            />
          </svg>
        </a>

        <a
          href="https://www.linkedin.com/in/huyvu-dev/"
          target="_blank"
          class="text-slate-500 hover:text-violet-400 transition-all duration-200 hover:scale-110"
          aria-label="LinkedIn"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9H7.12v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7H9.33V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"
            />
          </svg>
        </a>
      </div>
    </div>
  </aside>
</template>
