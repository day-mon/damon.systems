import { Laptop, Moon, Sun } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type Theme = "light" | "dark" | "system";

function subscribeToSystemTheme(callback: () => void) {
	const mq = window.matchMedia("(prefers-color-scheme: dark)");
	mq.addEventListener("change", callback);

	return () => mq.removeEventListener("change", callback);
}

function useSystemIsDark() {
	return useSyncExternalStore(
		subscribeToSystemTheme,
		() => window.matchMedia("(prefers-color-scheme: dark)").matches,
		() => false,
	);
}

function readStoredTheme(): Theme {
	if (typeof window === "undefined") return "system";

	// SAFETY: we own the "theme" key and only ever write Theme values
	return (localStorage.getItem("theme") as Theme) || "system";
}

export function ThemeSwitch() {
	const systemDark = useSystemIsDark();
	const [theme, setTheme] = useState<Theme>(readStoredTheme);

	const resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;
	const iconState = resolved === "dark" ? "b" : "a";

	function handleSetTheme(t: Theme) {
		setTheme(t);
		localStorage.setItem("theme", t);
		document.documentElement.classList.toggle(
			"dark",
			t === "dark" || (t === "system" && systemDark),
		);
	}

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
				<DropdownMenuItem onClick={() => handleSetTheme("light")}>
					<Sun />
					<span>Light</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleSetTheme("dark")}>
					<Moon />
					<span>Dark</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleSetTheme("system")}>
					<Laptop />
					<span>System</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
