import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/adapters/index.ts'], // Two entry points: one for core, one for adapters
    format: ['cjs', 'esm'], // Output both CommonJS (legacy) and ESM (modern)
    dts: true,              // Generate .d.ts type definitions
    splitting: false,
    sourcemap: true,
    clean: true,            // Delete old dist files before building
    treeshake: true,        // Remove unused code
    external: ['react', 'react-dom'], // Important: Peer dependencies must not be bundled
});