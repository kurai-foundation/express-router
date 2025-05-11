import * as path from "node:path"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import dts from "vite-plugin-dts"

// Vite configuration
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({
      entryRoot: "src",
      outDir: "dist",
      exclude: [ "__specs__/**" ]
    })
  ],
  build: {
    lib: {
      // Entry point of your library
      entry: {
        "express-router": path.resolve(__dirname, "src/index.ts"),
        "exceptions": path.resolve(__dirname, "src/exceptions.ts"),
      },
      // Name of the library (for UMD/IIFE builds)
      name: "express-router",
      // Output file name without extension
      // Target formats: CommonJS (`cjs`) and optionally others
      formats: [ "es", "cjs" ]
    },
    rollupOptions: {
      // Ensure external dependencies are not bundled into the library
      external: [ "joi", "express", "" ],
      output: {
        // Configuration for CommonJS-specific output
        exports: "named"
      }
    }
  }
})