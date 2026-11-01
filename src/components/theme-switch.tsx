import { Laptop, Moon, Sun } from "lucide-react";
import { setTheme, useResolvedTheme } from "#/lib/theme";

import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function ThemeSwitch() {
	const resolved = useResolvedTheme();

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
