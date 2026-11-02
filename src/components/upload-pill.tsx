/*
upload progress pill — shows anywhere in the app while trip photos stream up.
fixed bottom-right; disappears on completion, sticky red if a file failed.
*/

import { useEffect } from "react";

import { uploadStore, useUploadJob } from "#/lib/upload-store";

export function UploadPill() {
	const job = useUploadJob();

	useEffect(() => {
		const g = (e: BeforeUnloadEvent) => {
			if (uploadStore.get()) e.preventDefault();
		};

		window.addEventListener("beforeunload", g);
		window.addEventListener("pagehide", g);

		return () => {
			window.removeEventListener("beforeunload", g);
			window.removeEventListener("pagehide", g);
		};
	}, []);

	if (job?.failed) {
		return (
			<div className="fixed right-4 bottom-14 z-50 flex items-center gap-2 rounded-full border border-destructive bg-background px-3 py-1.5 text-destructive text-xs">
				upload failed ({job.done}/{job.total}) — {job.failed}
				<button type="button" onClick={() => uploadStore.finish()} className="opacity-60 hover:opacity-100">
					dismiss
				</button>
			</div>
		);
	}

	if (!job) return null;

	return (
		<div className="fixed right-4 bottom-14 z-50 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-muted-foreground text-xs">
			<span className="inline-block size-2 animate-pulse rounded-full bg-foreground" />
			uploading {job.name} — {job.done}/{job.total}
		</div>
	);
}
