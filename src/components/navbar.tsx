import {A} from "@solidjs/router";

import {ModeToggle} from "~/components/mode-switch";

export function Navbar() {
    return (
    <nav class={'flex justify-between p-5'}>
        <A class={'text-2xl italic'} href={'/'}>
            damon
        </A>
        <ModeToggle/>
    </nav>
    )
}