const productionHostname = "overkill.dev";
const pulseScriptSource = "/_runtime/script.js";
const pulseSiteIdentifier = "f832c07656ba";

if (window.location.hostname === productionHostname) {
	const analyticsScriptElement = document.createElement("script");
	analyticsScriptElement.defer = true;
	analyticsScriptElement.src = pulseScriptSource;
	analyticsScriptElement.dataset.siteId = pulseSiteIdentifier;
	document.head.append(analyticsScriptElement);
}
