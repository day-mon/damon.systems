import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import * as stylex from "@stylexjs/stylex";
import { Laptop, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

const placeholderButton = stylex.create({
	button: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		width: 36,
		height: 36,
		padding: 0,
		backgroundColor: "transparent",
		borderWidth: 0,
		borderStyle: "none",
		color: "inherit",
		cursor: "pointer",
	},
}).button;

const THEME_STORAGE_KEY = "theme";

/** Applies the resolved scheme so astryx light-dark() and site palette follow. */
function applyTheme(mode: ThemeMode, systemIsDark: boolean) {
	const root = document.documentElement;
	if (mode === "system") {
		root.removeAttribute("data-theme");
		root.style.colorScheme = systemIsDark ? "dark" : "light";
		return;
	}
	root.setAttribute("data-theme", mode);
	root.style.colorScheme = mode;
}

export function ThemeSwitch() {
	const [mounted, setMounted] = useState(false);
	const [theme, setTheme] = useState<ThemeMode>("system");
	const [systemIsDark, setSystemIsDark] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		setSystemIsDark(mq.matches);
		const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
		if (stored === "light" || stored === "dark") {
			setTheme(stored);
		}
		const onChange = () => setSystemIsDark(mq.matches);
		mq.addEventListener("change", onChange);
		setMounted(true);
		return () => mq.removeEventListener("change", onChange);
	}, []);

	useEffect(() => {
		if (mounted) applyTheme(theme, systemIsDark);
	}, [mounted, theme, systemIsDark]);

	if (!mounted) {
		return (
			<button
				type="button"
				aria-label="Toggle theme"
				{...stylex.props(placeholderButton)}
			>
				<Sun size={18} />
			</button>
		);
	}

	const isDark = theme === "dark" || (theme === "system" && systemIsDark);

	function handleSetMode(next: ThemeMode) {
		setTheme(next);
		if (next === "system") {
			window.localStorage.removeItem(THEME_STORAGE_KEY);
		} else {
			window.localStorage.setItem(THEME_STORAGE_KEY, next);
		}
	}

	return (
		<DropdownMenu
			button={{
				label: "Toggle theme",
				variant: "ghost",
				icon: isDark ? <Moon size={18} /> : <Sun size={18} />,
				isIconOnly: true,
			}}
			hasChevron={false}
			alignment="end"
			items={[
				{
					label: "Light",
					icon: <Sun size={16} />,
					onClick: () => handleSetMode("light"),
				},
				{
					label: "Dark",
					icon: <Moon size={16} />,
					onClick: () => handleSetMode("dark"),
				},
				{
					label: "System",
					icon: <Laptop size={16} />,
					onClick: () => handleSetMode("system"),
				},
			]}
		/>
	);
}
