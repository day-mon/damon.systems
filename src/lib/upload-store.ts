/*
module-level store for in-flight trip photo uploads — survives route changes,
rendered as a pill from the root layout while work streams up.
*/

import { useSyncExternalStore } from "react";

export interface UploadJob {
	slug: string;
	name: string;
	done: number;
	total: number;
	failed?: string;
}

let job: UploadJob | null = null;
const listeners = new Set<() => void>();

const emit = () => {
	for (const l of listeners) l();
};

export const uploadStore = {
	start(j: UploadJob) {
		job = j;
		emit();
	},
	progress(done: number) {
		if (job) job = { ...job, done };
		emit();
	},
	finish() {
		job = null;
		emit();
	},
	fail(message: string) {
		if (job) job = { ...job, failed: message };
		emit();
	},
	subscribe(l: () => void) {
		listeners.add(l);

		return () => listeners.delete(l);
	},
	get(): UploadJob | null {
		return job;
	},
};

export function useUploadJob(): UploadJob | null {
	return useSyncExternalStore(uploadStore.subscribe, uploadStore.get, () => null);
}
