import { defineConfig } from 'vitepress'
import path from 'node:path'

const outDir = path.resolve(__dirname, '../../../docs')
console.log('outDir:', outDir)

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'vue3-grid-drag-resize',
  description: 'Docs about vue3-grid-drag-resize',
  outDir,
  base: '/vue3-grid-drag-resize/',
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/xachary/vue3-grid-drag-resize' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/vue3-grid-drag-resize' }
    ],
    logo: '/favicon-48x48.jpeg'
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh',
      themeConfig: {
        nav: [
          { text: '首页', link: '/index' },
          { text: '快速上手', link: '/guide/index' },
          { text: 'API', link: '/api/index' },
          { text: '示例', link: 'https://xachary.github.io/vue3-grid-drag-resize/demo' }
        ],
        sidebar: {
          '/guide/': [
            {
              text: '快速上手',
              items: [
                { text: '概览', link: '/guide/index' },
                { text: '安装', link: '/guide/install' }
              ]
            }
          ],
          '/api/': [
            {
              text: 'API',
              items: [{ text: 'GridDragResize', link: '/api/index' }]
            }
          ]
        },
        outlineTitle: '导航'
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/index' },
          { text: 'Guide', link: '/en/guide/index' },
          { text: 'API', link: '/en/api/index' },
          { text: 'Demo', link: 'https://xachary.github.io/vue3-grid-drag-resize/demo' }
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Quick Start',
              items: [
                { text: 'Introduction', link: '/guide/index' },
                { text: 'Install', link: '/guide/install' }
              ]
            }
          ],
          '/en/api/': [
            {
              text: 'API',
              items: [{ text: 'GridDragResize', link: '/api/index' }]
            }
          ]
        },
        outlineTitle: 'Navigate'
      }
    }
  }
})
