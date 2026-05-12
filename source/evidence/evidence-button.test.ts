import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createEvidenceButtonClickListener } from "./evidence-button.ts";

interface FakeEvidenceButtonElement {
	readonly addedClassNames: string[];
	readonly attributesByName: Map<string, string>;
	readonly classList: {
		add(className: string): void;
	};
	setAttribute(attributeName: string, attributeValue: string): void;
	textContent: string;
}

interface ScheduledCallback {
	readonly callback: () => void;
	readonly delayMilliseconds: number;
}

interface FakeBrowserWindow {
	readonly location: {
		href: string;
	};
	readonly scheduledCallbacks: ScheduledCallback[];
	setTimeout(callback: () => void, delayMilliseconds: number): void;
}

interface FakeClickEvent {
	readonly preventedDefaultCount: number;
	preventDefault(): void;
}

function createFakeEvidenceButtonElement() {
	const addedClassNames: string[] = [];
	const attributesByName = new Map<string, string>();

	const fakeEvidenceButtonElement: FakeEvidenceButtonElement = {
		addedClassNames,
		attributesByName,
		classList: {
			add(className: string) {
				addedClassNames.push(className);
			}
		},
		setAttribute(attributeName: string, attributeValue: string) {
			attributesByName.set(attributeName, attributeValue);
		},
		textContent: "Witness the evidence"
	};

	return fakeEvidenceButtonElement;
}

function createFakeBrowserWindow() {
	const scheduledCallbacks: ScheduledCallback[] = [];
	const location = { href: "/" };

	const fakeBrowserWindow: FakeBrowserWindow = {
		location,
		scheduledCallbacks,
		setTimeout(callback: () => void, delayMilliseconds: number) {
			scheduledCallbacks.push({ callback, delayMilliseconds });
		}
	};

	return fakeBrowserWindow;
}

function createFakeClickEvent() {
	let preventedDefaultCount = 0;

	const fakeClickEvent: FakeClickEvent = {
		get preventedDefaultCount() {
			return preventedDefaultCount;
		},
		preventDefault() {
			preventedDefaultCount += 1;
		}
	};

	return fakeClickEvent;
}

function getScheduledCallback(fakeBrowserWindow: FakeBrowserWindow, callbackIndex: number): ScheduledCallback {
	const scheduledCallback = fakeBrowserWindow.scheduledCallbacks[callbackIndex];

	if (scheduledCallback === undefined) {
		throw new Error(`Expected scheduled callback at index ${callbackIndex}.`);
	}

	return scheduledCallback;
}

describe("createEvidenceButtonClickListener", () => {
	it("marks the evidence upload as running before scheduling failure and redirect effects", () => {
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
			browserWindow.scheduledCallbacks.map(({ delayMilliseconds }) => delayMilliseconds),
			[11, 22]
		);
	});

	it("ignores duplicate clicks after the first upload sequence starts", () => {
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

	it("applies the scheduled failure text and redirect path", () => {
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
});
