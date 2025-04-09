import { A, useLocation } from "@solidjs/router";
import { Show } from "solid-js";

import { ModeToggle } from "~/components/mode-switch";

export function Navbar() {
    const location = useLocation();
    return (
        <nav class={'flex justify-between p-5'}>
            <Show when={location.pathname !== '/'}>
                <A class={'text-2xl italic'} href={'/'}>
                    damon
                </A>
            </Show>
            <ModeToggle />
        </nav>
    )
}