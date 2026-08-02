import path from 'path'
import type { PluginOption } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import packageInfo from './package.json'

function setupPlugins(env: ImportMetaEnv): PluginOption[] {
  return [
    vue(),
    env.VITE_GLOB_APP_PWA === 'true' && VitePWA({
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: '简聊',
        short_name: '简聊',
        theme_color: '#F9FAFB',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ]
}

export default defineConfig((env) => {
  const viteEnv = loadEnv(env.mode, process.cwd()) as unknown as ImportMetaEnv

  return {
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(packageInfo.version),
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
    },
    plugins: setupPlugins(viteEnv),
    server: {
      watch: {
        ignored: [
          '**/.git/**',
          '**/.github/**',
          '**/.idea/**',
          '**/.playwright-cli/**',
          '**/.vscode/**',
          '**/build/**',
          '**/coverage/**',
          '**/data/**',
          '**/dist/**',
          '**/docker-compose/**',
          '**/docs/**',
          '**/node_modules/**',
          '**/output/**',
          '**/plugins/**',
          '**/service/**',
          '**/uploads/**',
        ],
      },
      host: '0.0.0.0',
      port: Number(viteEnv.VITE_APP_PORT || 10002),
      open: false,
      proxy: {
        '/api': {
          target: viteEnv.VITE_APP_API_BASE_URL,
          changeOrigin: true, // 允许跨域
          rewrite: path => path.replace('/api/', '/'),
        },
        // 让 /uploads 在开发环境下也能通过前端开发端口访问
        '/uploads': {
          target: viteEnv.VITE_APP_API_BASE_URL,
          changeOrigin: true,
        },
      },
    },
    build: {
      reportCompressedSize: false,
      sourcemap: false,
      commonjsOptions: {
        ignoreTryCatch: false,
      },
    },
  }
})
