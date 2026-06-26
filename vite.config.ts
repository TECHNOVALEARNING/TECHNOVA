import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// A small plugin to route /api/* requests during local development
const apiPlugin = () => ({
  name: "api-routing",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url && req.url.startsWith("/api/")) {
        const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const apiPath = urlObj.pathname;
        const modulePath = path.resolve(__dirname, `.${apiPath}.ts`);

        try {
          const module = await server.ssrLoadModule(modulePath);
          if (module.default) {
            const query: Record<string, any> = {};
            urlObj.searchParams.forEach((val, key) => {
              query[key] = val;
            });

            // Standardize request
            const mockReq = Object.assign(req, { query });

            // Standardize response methods
            const mockRes = Object.assign(res, {
              status(code: number) {
                res.statusCode = code;
                return this;
              },
              json(data: any) {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
                return this;
              },
              setHeader(name: string, value: string) {
                res.setHeader(name, value);
                return this;
              },
              end(data?: string) {
                res.end(data);
                return this;
              }
            });

            await module.default(mockReq, mockRes);
            return;
          }
        } catch (err) {
          console.error(`Error executing api handler at ${modulePath}:`, err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Internal server error in Vite API proxy", message: String(err) }));
          return;
        }
      }
      next();
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Copy loaded env variables to process.env for local API runner
  Object.assign(process.env, env);

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), apiPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
