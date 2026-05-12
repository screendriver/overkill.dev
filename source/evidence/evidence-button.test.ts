import { describe, expect, it } from "vitest";
import { createEvidenceButtonClickListener } from "./evidence-button.ts";

type FakeEvidenceButtonElement = {
	readonly addedClassNames: string[];
	readonly attributesByName: Map<string, string>;
	readonly classList: {
		add: (className: string) => void;
	};
	textContent: string;
	setAttribute: (attributeName: string, attributeValue: string) => void;
};

type ScheduledCallback = {
	readonly callback: () => void;
	readonly delayMilliseconds: number;
};

type FakeBrowserWindow = {
	readonly location: {
		href: string;
	};
	readonly scheduledCallbacks: ScheduledCallback[];
	setTimeout: (callback: () => void, delayMilliseconds: number) => void;
};

type FakeClickEvent = {
	readonly preventedDefaultCount: number;
	preventDefault: () => void;
};

function createFakeEvidenceButtonElement(): FakeEvidenceButtonElement {
	const addedClassNames: string[] = [];
	const attributesByName = new Map<string, string>();

	const fakeEvidenceButtonElement: FakeEvidenceButtonElement = {
		addedClassNames,
		attributesByName,
		classList: {
			add(className: string): void {
				addedClassNames.push(className);
			}
		},
		setAttribute(attributeName: string, attributeValue: string): void {
			attributesByName.set(attributeName, attributeValue);
		},
		textContent: "Witness the evidence"
	};

	return fakeEvidenceButtonElement;
}

function createFakeBrowserWindow(): FakeBrowserWindow {
	const scheduledCallbacks: ScheduledCallback[] = [];
	const location = { href: "/" };

	const fakeBrowserWindow: FakeBrowserWindow = {
		location,
		scheduledCallbacks,
		setTimeout(callback: () => void, delayMilliseconds: number): void {
			scheduledCallbacks.push({ callback, delayMilliseconds });
		}
	};

	return fakeBrowserWindow;
}

function createFakeClickEvent(): FakeClickEvent {
	let preventedDefaultCount = 0;

	const fakeClickEvent: FakeClickEvent = {
		get preventedDefaultCount(): number {
			return preventedDefaultCount;
		},
		preventDefault(): void {
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

describe(createEvidenceButtonClickListener, (): void => {
	it("marks the evidence upload as running before scheduling failure and redirect effects", (): void => {
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

		expect(clickEvent.preventedDefaultCount).toBe(1);
		expect(evidenceButtonElement.addedClassNames).toStrictEqual(["is-uploading"]);
		expect(evidenceButtonElement.attributesByName.get("aria-disabled")).toBe("true");
		expect(evidenceButtonElement.textContent).toBe("Uploading");
		expect(
			browserWindow.scheduledCallbacks.map((scheduledCallback): number => {
				return scheduledCallback.delayMilliseconds;
			})
		).toStrictEqual([11, 22]);
	});

	it("ignores duplicate clicks after the first upload sequence starts", (): void => {
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

		expect(firstClickEvent.preventedDefaultCount).toBe(1);
		expect(secondClickEvent.preventedDefaultCount).toBe(1);
		expect(browserWindow.scheduledCallbacks).toHaveLength(2);
		expect(evidenceButtonElement.addedClassNames).toStrictEqual(["is-uploading"]);
	});

	it("applies the scheduled failure text and redirect path", (): void => {
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

		expect(evidenceButtonElement.textContent).toBe("Upload failed: tests missing");
		expect(browserWindow.location.href).toBe("/404");
	});
});
