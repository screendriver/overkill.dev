import { defineConfig } from "vite";

const trackingScriptInjectionPlugin = {
	name: "tracking-script-injection",
	apply: "build",
	transformIndexHtml() {
		return [
			{
				tag: "script",
				attrs: {
					defer: true,
					src: "https://pulse.82r.de/api/script.js",
					"data-site-id": "f832c07656ba"
				},
				injectTo: "head"
			}
		];
	}
};

export default defineConfig({
	plugins: [trackingScriptInjectionPlugin]
});
