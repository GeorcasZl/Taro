import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "packages/studio/e2e",
  webServer: {
    command: "npm run dev --workspace @taro/studio -- --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true
  },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:5173"
  }
});
