import { defineConfig } from "vite";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const customNotFoundPageMiddlewarePlugin = {
	name: "custom-not-found-page-middleware",
	apply: "serve",
	configureServer(developmentServer) {
		developmentServer.middlewares.use(async (request, response, next) => {
			if (request.url === undefined || request.url === null || request.url === "" || request.method !== "GET") {
				return next();
			}

			const requestPath = request.url.split("?")[0];

			if (requestPath === "" || requestPath === "/" || requestPath.includes(".")) {
				return next();
			}

			try {
				const notFoundPageSource = await readFile("404.html", "utf-8");
				let originalRequestUrl = request.url;

				if (request.originalUrl !== undefined && request.originalUrl !== null) {
					originalRequestUrl = request.originalUrl;
				}

				const transformedNotFoundPage = await developmentServer.transformIndexHtml(
					requestPath,
					notFoundPageSource,
					originalRequestUrl
				);

				response.statusCode = 404;
				response.setHeader("Content-Type", "text/html; charset=utf-8");
				response.end(transformedNotFoundPage);
			} catch (error) {
				return next(error);
			}
		});
	}
};

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
	appType: "mpa",
	plugins: [customNotFoundPageMiddlewarePlugin, trackingScriptInjectionPlugin],
	build: {
		outDir: "target",
		rollupOptions: {
			input: {
				homePage: resolve(process.cwd(), "index.html"),
				notFoundPage: resolve(process.cwd(), "404.html")
			}
		}
	},
	server: {
		host: "127.0.0.1",
		port: 4321
	}
});
