const productionHostname = "overkill.dev";
const pulseScriptSource = "https://pulse.82r.de/api/script.js";
const pulseSiteIdentifier = "f832c07656ba";

if (window.location.hostname === productionHostname) {
	const analyticsScriptElement = document.createElement("script");
	analyticsScriptElement.defer = true;
	analyticsScriptElement.src = pulseScriptSource;
	analyticsScriptElement.dataset.siteId = pulseSiteIdentifier;
	document.head.append(analyticsScriptElement);
}
