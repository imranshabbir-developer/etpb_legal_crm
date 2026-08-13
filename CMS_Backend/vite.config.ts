import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

const cjsInteropDeps = [
  "react",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-dom",
  "react-dom/client",
  "react-dom/server",
  "scheduler",
  "use-sync-external-store",
  "use-sync-external-store/shim",
  "use-sync-external-store/shim/with-selector",
  "@tanstack/react-store",
  "@tanstack/react-router > @tanstack/react-store",
] as const;

export default defineConfig(({ command, mode }) => {
  const envDefine: Record<string, string> = {};
  const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
  for (const [key, value] of Object.entries(loadedEnv)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  const isDevBuild = command === "build" && mode === "development";
  const root = process.cwd();
  const reactRoot = path.resolve(root, "node_modules/react");
  const reactDomRoot = path.resolve(root, "node_modules/react-dom");

  return {
    define: envDefine,
    ...(isDevBuild ? { esbuild: { keepNames: true } } : {}),
    css: { transformer: "lightningcss" },
    resolve: {
      tsconfigPaths: true,
      alias: {
        "@": path.resolve(root, "src"),
        react: reactRoot,
        "react/jsx-runtime": path.join(reactRoot, "jsx-runtime.js"),
        "react/jsx-dev-runtime": path.join(reactRoot, "jsx-dev-runtime.js"),
        "react-dom": reactDomRoot,
        "react-dom/client": path.join(reactDomRoot, "client.js"),
        "react-dom/server": path.join(reactDomRoot, "server.nodejs.js"),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [...cjsInteropDeps],
      ignoreOutdatedRequests: true,
    },
    ssr: {
      optimizeDeps: {
        include: [...cjsInteropDeps],
      },
    },
    environments: {
      ...(isDevBuild
        ? {
            client: {
              define: { "process.env.NODE_ENV": JSON.stringify("development") },
            },
          }
        : {}),
      ssr: {
        optimizeDeps: {
          include: [...cjsInteropDeps],
        },
        resolve: {
          dedupe: ["react", "react-dom"],
        },
      },
    },
    server: {
      host: "::",
      port: 3000,
      watch: {
        ignored: ["**/public/logo2.png", "**/node_modules/**"],
        usePolling: true,
        interval: 1000,
      },
    },
    plugins: [
      tailwindcss(),
      tanstackStart({
        server: { entry: "server" },
        importProtection: {
          behavior: "error",
          client: {
            files: ["**/server/**"],
            specifiers: ["server-only"],
          },
        },
      }),
      ...(command === "build"
        ? [
            nitro({
              defaultPreset: "cloudflare-module",
            }),
          ]
        : []),
      react(),
    ],
  };
});
