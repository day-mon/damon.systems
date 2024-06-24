import {For, Show} from "solid-js";
import {PAGES} from "~/constants";
import {A, useLocation} from "@solidjs/router";

export function Footer() {
    const location = useLocation()
    return (
        <Show when={location.pathname !== "/"}>
            <footer class="px-5 py-3 fixed bottom-0 left-0 right-0 flex justify-center md:justify-end">
                <span class="mr-2 hidden md:block">[</span>
                <For each={PAGES}>
                    {(page, index) => (
                        <>
                            <Show when={index() !== 0}>
                                <span class="mr-1 hidden md:block">○</span>
                            </Show>
                            <A target="" href={`/${page.path}`} class={`mr-2 md:hover-underline ${location.pathname === `/${page.path}` ? "font-bold" : ""}`}>
                                <button class={`block md:hidden border rounded-lg p-3 ${location.pathname === `/${page.path}` ? "bg-primary dark:bg-primary-foreground" : ""}`}>
                                    {page.icon}
                                </button>
                                <span class="hidden md:block">
                                    {page.name}
                                </span>
                            </A>
                        </>
                    )}
                </For>
                <span class="mr-2 hidden md:block">]</span>
            </footer>
        </Show>
    )
}