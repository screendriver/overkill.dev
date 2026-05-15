import assert from "node:assert/strict";
import test from "node:test";
import { createEvidenceButtonClickListener } from "../source/scripts/evidence-button.js";

function createFakeEvidenceButtonElement() {
	const addedClassNames = [];
	const attributesByName = new Map();

	return {
		addedClassNames,
		attributesByName,
		classList: {
			add(className) {
				addedClassNames.push(className);
			}
		},
		setAttribute(attributeName, attributeValue) {
			attributesByName.set(attributeName, attributeValue);
		},
		textContent: "Witness the evidence"
	};
}

function createFakeBrowserWindow() {
	const scheduledCallbacks = [];
	const location = { href: "/" };

	return {
		location,
		scheduledCallbacks,
		setTimeout(callback, delayMilliseconds) {
			scheduledCallbacks.push({ callback, delayMilliseconds });
		}
	};
}

function createFakeClickEvent() {
	let preventedDefaultCount = 0;

	return {
		get preventedDefaultCount() {
			return preventedDefaultCount;
		},
		preventDefault() {
			preventedDefaultCount += 1;
		}
	};
}

function getScheduledCallback(fakeBrowserWindow, callbackIndex) {
	const scheduledCallback = fakeBrowserWindow.scheduledCallbacks[callbackIndex];

	if (scheduledCallback === undefined) {
		throw new Error(`Expected scheduled callback at index ${callbackIndex}.`);
	}

	return scheduledCallback;
}

test("marks the evidence upload as running before scheduling failure and redirect effects", () => {
	const browserWindow = createFakeBrowserWindow();
	const evidenceButtonElement = createFakeEvidenceButtonElement();
	const clickEvent = createFakeClickEvent();
	const uploadSequence = {
		failedText: "Failure",
		failedTextDelayMilliseconds: 11,
		redirectDelayMilliseconds: 22,
		redirectPath: "/missing",
		uploadingText: "Uploading"
	};

	const handleEvidenceButtonClick = createEvidenceButtonClickListener({
		browserWindow,
		evidenceButtonElement,
		uploadSequence
	});

	handleEvidenceButtonClick(clickEvent);

	assert.equal(clickEvent.preventedDefaultCount, 1);
	assert.deepEqual(evidenceButtonElement.addedClassNames, ["is-uploading"]);
	assert.equal(evidenceButtonElement.attributesByName.get("aria-disabled"), "true");
	assert.equal(evidenceButtonElement.textContent, "Uploading");
	assert.deepEqual(
		browserWindow.scheduledCallbacks.map((scheduledCallback) => {
			return scheduledCallback.delayMilliseconds;
		}),
		[11, 22]
	);
});

test("ignores duplicate clicks after the first upload sequence starts", () => {
	const browserWindow = createFakeBrowserWindow();
	const evidenceButtonElement = createFakeEvidenceButtonElement();
	const firstClickEvent = createFakeClickEvent();
	const secondClickEvent = createFakeClickEvent();

	const handleEvidenceButtonClick = createEvidenceButtonClickListener({
		browserWindow,
		evidenceButtonElement
	});

	handleEvidenceButtonClick(firstClickEvent);
	handleEvidenceButtonClick(secondClickEvent);

	assert.equal(firstClickEvent.preventedDefaultCount, 1);
	assert.equal(secondClickEvent.preventedDefaultCount, 1);
	assert.equal(browserWindow.scheduledCallbacks.length, 2);
	assert.deepEqual(evidenceButtonElement.addedClassNames, ["is-uploading"]);
});

test("applies the scheduled failure text and redirect path", () => {
	const browserWindow = createFakeBrowserWindow();
	const evidenceButtonElement = createFakeEvidenceButtonElement();
	const clickEvent = createFakeClickEvent();

	const handleEvidenceButtonClick = createEvidenceButtonClickListener({
		browserWindow,
		evidenceButtonElement
	});

	handleEvidenceButtonClick(clickEvent);
	getScheduledCallback(browserWindow, 0).callback();
	getScheduledCallback(browserWindow, 1).callback();

	assert.equal(evidenceButtonElement.textContent, "Upload failed: tests missing");
	assert.equal(browserWindow.location.href, "/404");
});
