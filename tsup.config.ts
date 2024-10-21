import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/cli/bin.ts', 'src/cli/bash-complete.ts', 'src/index.ts'],
  format: ['esm'],
  minify: true,
  splitting: true,
  tsconfig: './tsconfig.json',
})
