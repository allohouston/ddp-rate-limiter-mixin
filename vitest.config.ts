import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        setupFiles: ["src/__tests__/setup.ts"],
        coverage: {
            provider: "v8",
            include: ["src/**/*.ts"],
            exclude: ["src/__tests__/**", "src/index.ts"],
            thresholds: {
                statements: 100,
                branches: 100,
                functions: 100,
                lines: 100,
            },
        },
    },
});
