export interface EvidenceUploadSequence {
	readonly failedText: string;
	readonly failedTextDelayMilliseconds: number;
	readonly redirectDelayMilliseconds: number;
	readonly redirectPath: string;
	readonly uploadingText: string;
}

interface EvidenceButtonElement {
	readonly classList: {
		add(className: string): void;
	};
	setAttribute(attributeName: string, attributeValue: string): void;
	textContent: string | null;
}

interface EvidenceButtonTimerWindow {
	readonly location: {
		href: string;
	};
	setTimeout(callback: () => void, delayMilliseconds: number): unknown;
}

interface EvidenceButtonClickListenerOptions {
	readonly browserWindow: EvidenceButtonTimerWindow;
	readonly evidenceButtonElement: EvidenceButtonElement;
	readonly uploadSequence?: EvidenceUploadSequence;
}

interface EvidenceButtonRegistrationWindow extends EvidenceButtonTimerWindow {
	readonly HTMLButtonElement: typeof HTMLButtonElement;
}

interface EvidenceButtonRegistrationOptions {
	readonly browserDocument: Pick<Document, "querySelector">;
	readonly browserWindow: EvidenceButtonRegistrationWindow;
}

export const evidenceUploadSequence: EvidenceUploadSequence = Object.freeze({
	failedText: "Upload failed: tests missing",
	failedTextDelayMilliseconds: 500,
	redirectDelayMilliseconds: 1400,
	redirectPath: "/404",
	uploadingText: "Uploading evidence..."
});

export function createEvidenceButtonClickListener(
	evidenceButtonClickListenerOptions: EvidenceButtonClickListenerOptions
) {
	const {
		browserWindow,
		evidenceButtonElement,
		uploadSequence = evidenceUploadSequence
	} = evidenceButtonClickListenerOptions;

	let isUploadSequenceRunning = false;

	return function handleEvidenceButtonClick(clickEvent: Pick<Event, "preventDefault">) {
		clickEvent.preventDefault();

		if (isUploadSequenceRunning) {
			return;
		}

		isUploadSequenceRunning = true;
		evidenceButtonElement.classList.add("is-uploading");
		evidenceButtonElement.setAttribute("aria-disabled", "true");
		evidenceButtonElement.textContent = uploadSequence.uploadingText;

		browserWindow.setTimeout(() => {
			evidenceButtonElement.textContent = uploadSequence.failedText;
		}, uploadSequence.failedTextDelayMilliseconds);

		browserWindow.setTimeout(() => {
			browserWindow.location.href = uploadSequence.redirectPath;
		}, uploadSequence.redirectDelayMilliseconds);
	};
}

export function registerEvidenceButton(evidenceButtonRegistrationOptions: EvidenceButtonRegistrationOptions) {
	const { browserDocument, browserWindow } = evidenceButtonRegistrationOptions;
	const evidenceButtonElement = browserDocument.querySelector("#evidence-button");

	if (!(evidenceButtonElement instanceof browserWindow.HTMLButtonElement)) {
		return;
	}

	const handleEvidenceButtonClick = createEvidenceButtonClickListener({
		browserWindow,
		evidenceButtonElement
	});

	evidenceButtonElement.addEventListener("click", handleEvidenceButtonClick);
}
