// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  return {
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') }
      ]
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
    },
    plugins: [
      react({
        fastRefresh: true,
      }),
      ViteImageOptimizer({
        png: {
          quality: 70,
          progressive: true,
          optimizationLevel: 7
        },
        jpeg: {
          quality: 70,
          progressive: true,
          mozjpeg: true
        },
        jpg: {
          quality: 70,
          progressive: true,
          mozjpeg: true
        },
        webp: {
          lossless: true,
          quality: 80,
          alphaQuality: 90
        }
      }),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: '.',
        filename: 'sw.ts',
        registerType: 'autoupdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Pixe Admin',
          short_name: 'Pixe',
          description: 'Powerful admin dashboard interface',
          theme_color: '#121212',
          background_color: '#121212',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          orientation: 'portrait',
          categories: ['business', 'productivity'],
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png',
              purpose: 'apple touch icon',
            }
          ],
          screenshots: [
            {
              src: '/screenshot-1.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Dashboard Overview'
            }
          ],
          shortcuts: [
            {
              name: 'Dashboard',
              url: '/',
              icons: [{ src: '/icon-96.png', sizes: '96x96' }]
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module'
        }
      })
    ],
    build: {
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd,
          pure_funcs: isProd ? ['console.log', 'console.info', 'console.debug', 'console.trace'] : []
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom'],
            'ui': ['lucide-react', 'framer-motion'],
            'utils': ['clsx', 'tailwind-merge'],
            'router': ['react-router-dom'],
            'state': ['zustand'],
            'charts': ['recharts']
          }
        }
      },
      sourcemap: !isProd,
      reportCompressedSize: !isProd,
      chunkSizeWarningLimit: 1000,
      assetsDir: 'assets',
      emptyOutDir: true,
      cssCodeSplit: true,
      modulePreload: {
        polyfill: true
      },
      cssMinify: true
    },
    server: {
      port: 5173,
      open: true,
      hmr: {
        overlay: true
      },
      host: true,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      },
      watch: {
        usePolling: true,
        interval: 100
      }
    },
    preview: {
      port: 4173,
      open: true,
      strictPort: true
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'lucide-react',
        'clsx',
        'tailwind-merge',
        'zustand',
        'recharts'
      ],
      exclude: ['@vitejs/plugin-react-swc']
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    }
  }
})