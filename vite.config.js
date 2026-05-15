import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	root: "source",
	publicDir: "../public",
	build: {
		outDir: "../target",
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: resolve(import.meta.dirname, "source/index.html"),
				notFound: resolve(import.meta.dirname, "source/404.html")
			}
		}
	}
});
