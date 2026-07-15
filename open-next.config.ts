import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config — no R2 incremental cache required for deploy.
// Add r2IncrementalCache later if you enable R2 on the account.
export default defineCloudflareConfig({});
