import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	root: "source",
	publicDir: "../public",
	plugins: [
		{
			name: "Tracking scripts",
			apply: "build",
			transformIndexHtml() {
				return [
					{
						tag: "script",
						attrs: {
							defer: true,
							src: "/_runtime/script.js",
							"data-site-id": "f832c07656ba"
						},
						injectTo: "head"
					}
				];
			}
		}
	],
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
