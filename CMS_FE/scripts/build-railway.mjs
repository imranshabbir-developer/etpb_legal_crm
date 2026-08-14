import { spawnSync } from "node:child_process";
import path from "node:path";

const viteBin = path.resolve("node_modules/vite/bin/vite.js");
const result = spawnSync(process.execPath, [viteBin, "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NITRO_PRESET: "node-server",
  },
});

if (result.error) console.error(result.error);
process.exit(result.status ?? 1);
