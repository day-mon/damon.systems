/*
single external store for theme. see theme-switch.tsx history notes:
localStorage owned by us, matchMedia + window storage events subscribed,
manual notify because same-tab writes never fire storage.
*/

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

const THEME_KEY = "theme";

const themeListeners = new Set<() => void>();

function readStoredTheme(): Theme {
	if (typeof window === "undefined") return "system";

	// SAFETY: we own the "theme" key and only ever write Theme values
	return (localStorage.getItem(THEME_KEY) as Theme) || "system";
}

function subscribeToTheme(callback: () => void) {
	if (typeof window === "undefined") return () => undefined;

	const mq = window.matchMedia("(prefers-color-scheme: dark)");
	mq.addEventListener("change", callback);
	window.addEventListener("storage", callback);
	themeListeners.add(callback);

	return () => {
		mq.removeEventListener("change", callback);
		window.removeEventListener("storage", callback);
		themeListeners.delete(callback);
	};
}

function getResolvedTheme(): "dark" | "light" {
	const stored = readStoredTheme();

	if (stored === "system") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}

	return stored;
}

export function setTheme(theme: Theme) {
	localStorage.setItem(THEME_KEY, theme);

	document.documentElement.classList.toggle(
		"dark",
		theme === "dark" ||
			(theme === "system" &&
				window.matchMedia("(prefers-color-scheme: dark)").matches),
	);

	for (const listener of themeListeners) listener();
}

export function useResolvedTheme(): "dark" | "light" {
	return useSyncExternalStore(subscribeToTheme, getResolvedTheme, () => "dark");
}
