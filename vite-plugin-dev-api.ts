import type { Plugin } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Vite plugin that adds dev-only API endpoints for app code modification
 * 
 * This plugin enables the UI to modify app code and configuration files:
 * - /api/write-env: Write environment variables to .env file
 * - /api/write-config: Write app configuration to app.config.json
 * - /api/finish-setup: Finish setup and clean up unused code
 * 
 * Security: These endpoints only work in development mode (Vite dev server)
 */
export function devApiPlugin(): Plugin {
  return {
    name: "dev-api",
    configureServer(server) {
      // Finish setup endpoint - modifies app source code
      server.middlewares.use("/api/finish-setup", async (req, res, next) => {
        // Only allow POST requests
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            const { enabledFeatures = [] } = JSON.parse(body) as { enabledFeatures: string[] };

            // Import and run the finish-setup script
            const finishSetupPath = path.resolve(process.cwd(), "scripts/finish-setup.js");
            if (!fs.existsSync(finishSetupPath)) {
              throw new Error("finish-setup.js not found");
            }

            // Use dynamic import with file:// URL
            const fileUrl = `file://${finishSetupPath.replace(/\\/g, "/")}`;
            const finishSetupModule = await import(fileUrl);
            
            if (typeof finishSetupModule.finishSetup !== "function") {
              throw new Error("finishSetup function not found in module");
            }

            const result = finishSetupModule.finishSetup(enabledFeatures);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: true,
                message: "Setup finished successfully",
                removed: result.removed,
              })
            );
          } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: "Failed to finish setup",
                message: error instanceof Error ? error.message : String(error),
              })
            );
          }
        });
      });

      // Write env endpoint - modifies .env file
      server.middlewares.use("/api/write-env", (req, res, next) => {
        // Only allow POST requests
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const envVars = JSON.parse(body) as Record<string, string>;

            // Validate that we're only writing VITE_ prefixed vars
            const viteVars: Record<string, string> = {};
            for (const [key, value] of Object.entries(envVars)) {
              if (key.startsWith("VITE_")) {
                viteVars[key] = value;
              }
            }

            // Read existing .env file if it exists
            const envPath = path.resolve(process.cwd(), ".env");
            let existingContent = "";

            if (fs.existsSync(envPath)) {
              existingContent = fs.readFileSync(envPath, "utf-8");
            }

            // Parse existing env vars (simple parsing - handles KEY=value format)
            const existingVars: Record<string, string> = {};
            const lines = existingContent.split("\n");
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed && !trimmed.startsWith("#")) {
                const match = trimmed.match(/^([^=]+)=(.*)$/);
                if (match) {
                  const key = match[1].trim();
                  const value = match[2].trim();
                  if (key.startsWith("VITE_")) {
                    existingVars[key] = value;
                  }
                }
              }
            }

            // Merge new vars with existing (new vars take precedence)
            const mergedVars = { ...existingVars, ...viteVars };

            // Build new .env content
            const newLines: string[] = [];
            const writtenKeys = new Set<string>();

            // Write existing non-VITE vars and comments first
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith("#")) {
                newLines.push(line);
              } else {
                const match = trimmed.match(/^([^=]+)=/);
                if (match) {
                  const key = match[1].trim();
                  if (!key.startsWith("VITE_")) {
                    newLines.push(line);
                  }
                }
              }
            }

            // Add a separator if we have existing content
            if (newLines.length > 0 && newLines[newLines.length - 1].trim() !== "") {
              newLines.push("");
            }

            // Write VITE_ vars
            for (const [key, value] of Object.entries(mergedVars)) {
              newLines.push(`${key}=${value}`);
              writtenKeys.add(key);
            }

            // Write to file
            fs.writeFileSync(envPath, newLines.join("\n") + "\n", "utf-8");

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: true,
                message: "Environment variables written successfully",
                written: Array.from(writtenKeys),
              })
            );
          } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: "Failed to write environment variables",
                message: error instanceof Error ? error.message : String(error),
              })
            );
          }
        });
      });

      // Write config endpoint - writes app.config.json
      server.middlewares.use("/api/write-config", (req, res, next) => {
        // Only allow POST requests
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const config = JSON.parse(body);

            // Validate config structure
            if (!config.version || !config.setup || !config.configurations) {
              throw new Error("Invalid configuration structure");
            }

            // Write to app.config.json
            const configPath = path.resolve(process.cwd(), "app.config.json");
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: true,
                message: "Configuration written successfully",
              })
            );
          } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: "Failed to write configuration",
                message: error instanceof Error ? error.message : String(error),
              })
            );
          }
        });
      });
    },
  };
}
