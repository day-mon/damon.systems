import { Laptop, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type Theme = "light" | "dark" | "system";

const THEME_KEY = "theme";

// one external store: the stored theme drives the system-preference read.
// writes notify listeners manually because same-tab localStorage sets
// don't fire the storage event.
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

function setTheme(theme: Theme) {
	localStorage.setItem(THEME_KEY, theme);

	document.documentElement.classList.toggle(
		"dark",
		theme === "dark" ||
			(theme === "system" &&
				window.matchMedia("(prefers-color-scheme: dark)").matches),
	);

	for (const listener of themeListeners) listener();
}

export function ThemeSwitch() {
	const resolved = useSyncExternalStore(
		subscribeToTheme,
		getResolvedTheme,
		() => "dark" as const,
	);

	const iconState = resolved === "dark" ? "b" : "a";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						className="size-9"
						aria-label="Toggle theme"
					/>
				}
			>
				<span className="relative grid size-[1.2rem]">
					<Sun
						className={`col-start-1 row-start-1 size-full transition-opacity duration-200 ${iconState === "a" ? "opacity-100" : "opacity-0"}`}
					/>
					<Moon
						className={`col-start-1 row-start-1 size-full transition-opacity duration-200 ${iconState === "b" ? "opacity-100" : "opacity-0"}`}
					/>
				</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")}>
					<Sun />
					<span>Light</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					<Moon />
					<span>Dark</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					<Laptop />
					<span>System</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
