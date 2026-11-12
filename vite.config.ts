import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Folds the JS and CSS bundles into index.html so the build opens straight from disk (file://).
function inlineBundle(): Plugin {
  return {
    name: 'noxaplus-inline-bundle',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const page = bundle['index.html'];
      if (!page || page.type !== 'asset') return;
      const inlined = new Set<string>();
      const take = (fileName: string) => {
        const output = bundle[fileName];
        if (!output) return null;
        inlined.add(fileName);
        return output.type === 'chunk' ? output.code : String(output.source);
      };

      const html = String(page.source)
        .replace(/<link rel="modulepreload"[^>]*>\s*/g, '')
        .replace(/<script type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/g, (tag, fileName: string) => {
          const code = take(fileName);
          if (code === null) return tag;
          return `<script type="module">${code.replace(/<\/script/gi, '<\\/script')}</script>`;
        })
        .replace(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/g, (tag, fileName: string) => {
          const css = take(fileName);
          if (css === null) return tag;
          return `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`;
        });

      page.source = html;
      for (const fileName of inlined) delete bundle[fileName];
    },
  };
}

export default defineConfig({
  root: 'app',
  base: './',
  publicDir: '../public',
  plugins: [react(), inlineBundle()],
  build: {
    target: 'es2022',
    outDir: '../dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    modulePreload: false,
  },
});
