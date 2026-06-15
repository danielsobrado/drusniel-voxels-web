/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/drusniel-voxels-web/",
  build: {
    target: "es2022"
  },
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/reference/**",
      "**/.{idea,git,cache,output,temp}/**"
    ]
  }
});
