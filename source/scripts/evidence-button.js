export const evidenceUploadSequence = Object.freeze({
	failedText: "Upload failed: tests missing",
	failedTextDelayMilliseconds: 500,
	redirectDelayMilliseconds: 1400,
	redirectPath: "/404",
	uploadingText: "Uploading evidence..."
});

export function createEvidenceButtonClickListener({
	browserWindow,
	evidenceButtonElement,
	uploadSequence = evidenceUploadSequence
}) {
	let isUploadSequenceRunning = false;

	return function handleEvidenceButtonClick(clickEvent) {
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

export function registerEvidenceButton({ browserDocument, browserWindow }) {
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
