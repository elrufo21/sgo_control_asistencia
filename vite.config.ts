import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.ASISTENCIA_API_URL || "http://127.0.0.1:5100",
        configure(proxy) {
          proxy.on("error", (_error, _request, response) => {
            if ("writeHead" in response && !response.headersSent) {
              response.writeHead(503, {
                "Content-Type": "application/json; charset=utf-8",
              });
              response.end(
                JSON.stringify({
                  mensaje:
                    "No se puede conectar al backend. Inícialo con dotnet run desde la carpeta backend.",
                }),
              );
            }
          });
        },
      },
    },
  },
});
