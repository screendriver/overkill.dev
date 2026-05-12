import { defineConfig } from "astro/config";

export default defineConfig({
	srcDir: "source",
	output: "static",
	outDir: "./target",
	trailingSlash: "never",
	build: {
		format: "file"
	},
	server: {
		host: "127.0.0.1",
		port: 4321
	},
	site: "https://overkill.dev"
});
